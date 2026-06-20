"""Integration tests for the HTTP API via FastAPI's TestClient."""

from __future__ import annotations


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_calculate_returns_breakdown(client):
    resp = client.post(
        "/api/calculate",
        json={
            "transport": {"car_km_per_week": 100, "car_fuel": "petrol"},
            "diet": "vegan",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert set(body["breakdown_kg"]) == {"transport", "home", "diet", "consumption"}
    assert body["total_annual_kg"] > 0
    assert "comparison" in body


def test_calculate_rejects_negative_values(client):
    resp = client.post("/api/calculate", json={"transport": {"car_km_per_week": -5}})
    assert resp.status_code == 422  # Pydantic validation rejects out-of-bounds input


def test_calculate_rejects_unknown_enum(client):
    resp = client.post("/api/calculate", json={"diet": "carnivore_supreme"})
    assert resp.status_code == 422


def test_insights_uses_rules_when_gemini_disabled(client):
    resp = client.post("/api/insights", json={"diet": "heavy_meat"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["source"] == "rules"
    assert len(body["recommendations"]) >= 1


def test_dashboard_flow(client):
    device_id = "device-test-1234"

    # 1. Fetch initial profile
    resp = client.get(f"/api/dashboard/profile/{device_id}")
    assert resp.status_code == 200
    p = resp.json()
    assert p["device_id"] == device_id
    assert p["xp"] == 0
    assert p["level"] == 1
    assert p["total_emissions"] == 8500.0

    # 2. Log activity
    resp = client.post(
        f"/api/dashboard/activities/{device_id}",
        json={"category": "transport", "activity": "Carpooling", "impact": -15.5},
    )
    assert resp.status_code == 201
    act = resp.json()
    assert act["id"]
    assert act["device_id"] == device_id
    assert act["category"] == "transport"
    assert act["activity"] == "Carpooling"
    assert act["impact"] == -15.5

    # 3. Verify profile updated (XP + 10, total_emissions - 15.5)
    resp = client.get(f"/api/dashboard/profile/{device_id}")
    assert resp.status_code == 200
    p = resp.json()
    assert p["xp"] == 10
    assert p["total_emissions"] == 8500.0 - 15.5

    # 4. Verify listed activities
    resp = client.get(f"/api/dashboard/activities/{device_id}")
    assert resp.status_code == 200
    acts = resp.json()
    assert len(acts) == 1
    assert acts[0]["id"] == act["id"]


def test_dashboard_level_up(client):
    device_id = "device-lvlup-123"
    # Get profile to initialize
    client.get(f"/api/dashboard/profile/{device_id}")
    # Log 10 activities to get 100 XP (level 1 needs 100 XP to level up)
    for _ in range(10):
        resp = client.post(
            f"/api/dashboard/activities/{device_id}",
            json={"category": "transport", "activity": "Carpooling", "impact": -1.0},
        )
        assert resp.status_code == 201

    # Check level is now 2 and XP reset to 0
    resp = client.get(f"/api/dashboard/profile/{device_id}")
    assert resp.status_code == 200
    p = resp.json()
    assert p["level"] == 2
    assert p["xp"] == 0


def test_dashboard_rejects_bad_device_id(client):
    resp = client.get("/api/dashboard/profile/short")
    assert resp.status_code == 422


def test_unknown_api_route_returns_json_404(client):
    resp = client.get("/api/does-not-exist")
    assert resp.status_code == 404
    assert resp.headers["content-type"].startswith("application/json")


def test_security_headers_present(client):
    resp = client.get("/api/health")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert "Content-Security-Policy" in resp.headers
