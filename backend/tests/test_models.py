"""Validation tests for the Pydantic schemas (the API's security boundary)."""

from __future__ import annotations

import pytest
from app.carbon.calculator import calculate_footprint
from app.models import (
    ActivityLog,
    CarbonInput,
    ConsumptionInput,
    EntryCreate,
    HomeInput,
    TransportInput,
    UserProfile,
)
from pydantic import ValidationError


def test_transport_rejects_values_above_upper_bound():
    with pytest.raises(ValidationError):
        TransportInput(car_km_per_week=20_001)
    with pytest.raises(ValidationError):
        TransportInput(short_haul_flights_per_year=201)


def test_transport_rejects_negative_values():
    with pytest.raises(ValidationError):
        TransportInput(public_transit_km_per_week=-1)


def test_home_household_size_must_be_at_least_one():
    with pytest.raises(ValidationError):
        HomeInput(household_size=0)
    with pytest.raises(ValidationError):
        HomeInput(household_size=51)


def test_consumption_rejects_out_of_bounds_spend():
    with pytest.raises(ValidationError):
        ConsumptionInput(goods_spend_usd_per_month=1_000_001)


def test_entry_create_rejects_malformed_device_ids():
    data = CarbonInput()
    result = calculate_footprint(data)
    for bad_id in ["short", "has spaces here", "bad/slash-id", "x" * 129]:
        with pytest.raises(ValidationError):
            EntryCreate(device_id=bad_id, input=data, result=result)


def test_entry_create_accepts_well_formed_device_id():
    data = CarbonInput()
    result = calculate_footprint(data)
    entry = EntryCreate(device_id="dev-abc123XYZ_-", input=data, result=result)
    assert entry.device_id == "dev-abc123XYZ_-"


def test_user_profile_rejects_malformed_device_ids():
    for bad_id in ["short", "has spaces", "bad/slash", "x" * 129]:
        with pytest.raises(ValidationError):
            UserProfile(device_id=bad_id)


def test_user_profile_validation():
    p = UserProfile(device_id="dev-abc123XYZ_-", total_emissions=1000.0, xp=10, level=2, streak=5)
    assert p.device_id == "dev-abc123XYZ_-"
    assert p.total_emissions == 1000.0
    assert p.xp == 10
    assert p.level == 2
    assert p.streak == 5


def test_activity_log_rejects_malformed_device_ids():
    for bad_id in ["short", "has spaces", "bad/slash", "x" * 129]:
        with pytest.raises(ValidationError):
            ActivityLog(
                id="act-1",
                date="2026-01-01",
                device_id=bad_id,
                category="transport",
                activity="walk",
                impact=0.0,
            )
