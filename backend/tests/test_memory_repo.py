"""Tests for the in-memory repository."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models import ActivityLog
from app.repository.memory_repo import InMemoryRepository


def _make_activity(device_id: str, offset_seconds: int = 0) -> ActivityLog:
    return ActivityLog(
        id=uuid.uuid4().hex,
        date=datetime.now(timezone.utc).isoformat(),
        device_id=device_id,
        category="transport",
        activity="Carpooling",
        impact=-5.2,
    )


def test_get_profile_returns_default_for_new_device():
    repo = InMemoryRepository()
    profile = repo.get_profile("device-123")
    assert profile.device_id == "device-123"
    assert profile.total_emissions == 8500.0
    assert profile.xp == 0
    assert profile.level == 1
    assert profile.streak == 1
    assert profile.challenges == {}


def test_save_and_get_profile():
    repo = InMemoryRepository()
    profile = repo.get_profile("device-123")
    profile.xp = 150
    profile.level = 2
    repo.save_profile(profile)

    updated = repo.get_profile("device-123")
    assert updated.xp == 150
    assert updated.level == 2


def test_add_and_list_activities():
    repo = InMemoryRepository()
    device1 = "device-1"
    device2 = "device-2"

    act1 = _make_activity(device1)
    act2 = _make_activity(device1)
    act3 = _make_activity(device2)

    repo.add_activity(act1)
    repo.add_activity(act2)
    repo.add_activity(act3)

    # Scoped to device
    acts_dev1 = repo.list_activities(device1)
    assert len(acts_dev1) == 2
    assert act1 in acts_dev1
    assert act2 in acts_dev1

    acts_dev2 = repo.list_activities(device2)
    assert len(acts_dev2) == 1
    assert act3 in acts_dev2


def test_list_activities_respects_limit():
    repo = InMemoryRepository()
    device = "device-limit"
    for _ in range(5):
        repo.add_activity(_make_activity(device))

    assert len(repo.list_activities(device, limit=3)) == 3


def test_list_activities_returns_newest_first():
    repo = InMemoryRepository()
    device = "device-time"

    act1 = ActivityLog(
        id="1",
        date="2026-01-01T00:00:01Z",
        device_id=device,
        category="transport",
        activity="Walk",
        impact=-1.0,
    )
    act2 = ActivityLog(
        id="2",
        date="2026-01-01T00:00:02Z",
        device_id=device,
        category="transport",
        activity="Walk",
        impact=-1.0,
    )
    act3 = ActivityLog(
        id="3",
        date="2026-01-01T00:00:03Z",
        device_id=device,
        category="transport",
        activity="Walk",
        impact=-1.0,
    )

    repo.add_activity(act1)
    repo.add_activity(act2)
    repo.add_activity(act3)

    listed = repo.list_activities(device)
    assert [e.id for e in listed] == ["3", "2", "1"]
