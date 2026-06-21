from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Path

from app.deps import get_repository
from app.models import ActivityLog, ActivityLogCreate, ChallengeState, ChallengeUpdate, StreakUpdate, UserProfile
from app.repository.base import Repository

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/profile/{device_id}", response_model=UserProfile)
def get_profile(
    device_id: str = Path(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+$"),
    repo: Repository = Depends(get_repository),
) -> UserProfile:
    """Get the user profile, including XP and Challenges."""
    return repo.get_profile(device_id)


@router.get("/activities/{device_id}", response_model=list[ActivityLog])
def list_activities(
    device_id: str = Path(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+$"),
    repo: Repository = Depends(get_repository),
) -> list[ActivityLog]:
    """List recent activities for the device."""
    return repo.list_activities(device_id)


@router.post("/activities/{device_id}", response_model=ActivityLog, status_code=201)
def add_activity(
    payload: ActivityLogCreate,
    device_id: str = Path(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+$"),
    repo: Repository = Depends(get_repository),
) -> ActivityLog:
    """Log a new activity and update user XP/emissions."""
    profile = repo.get_profile(device_id)

    # 1. Add Activity
    log = ActivityLog(
        id=uuid.uuid4().hex,
        date=datetime.now(timezone.utc).isoformat(),
        device_id=device_id,
        category=payload.category,
        activity=payload.activity,
        impact=payload.impact,
    )
    repo.add_activity(log)

    # 2. Update Profile Stats
    profile.total_emissions += payload.impact  # impact can be negative (savings) or positive
    profile.xp += 10  # Arbitrary XP gain for logging something
    if profile.xp >= profile.level * 100:
        profile.level += 1
        profile.xp = 0

    repo.save_profile(profile)

    return log


@router.put("/profile/{device_id}/streak", response_model=UserProfile)
def update_streak(
    payload: StreakUpdate,
    device_id: str = Path(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+$"),
    repo: Repository = Depends(get_repository),
) -> UserProfile:
    """Update the user's streak."""
    profile = repo.get_profile(device_id)
    profile.streak = payload.streak
    repo.save_profile(profile)
    return profile


@router.put("/profile/{device_id}/challenges/{challenge_id}", response_model=UserProfile)
def update_challenge(
    challenge_id: str,
    payload: ChallengeUpdate,
    device_id: str = Path(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+$"),
    repo: Repository = Depends(get_repository),
) -> UserProfile:
    """Update a challenge's state for the user."""
    profile = repo.get_profile(device_id)
    profile.challenges[challenge_id] = ChallengeState(
        id=challenge_id,
        status=payload.status,
        progress=payload.progress,
    )
    repo.save_profile(profile)
    return profile
