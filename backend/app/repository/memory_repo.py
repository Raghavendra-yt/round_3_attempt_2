from __future__ import annotations

from app.models import ActivityLog, UserProfile
from app.repository.base import Repository


class InMemoryRepository(Repository):
    def __init__(self) -> None:
        self._profiles: dict[str, UserProfile] = {}
        self._activities: dict[str, list[ActivityLog]] = {}

    def get_profile(self, device_id: str) -> UserProfile:
        if device_id not in self._profiles:
            self._profiles[device_id] = UserProfile(device_id=device_id)
        return self._profiles[device_id]

    def save_profile(self, profile: UserProfile) -> None:
        self._profiles[profile.device_id] = profile

    def add_activity(self, activity: ActivityLog) -> None:
        self._activities.setdefault(activity.device_id, []).append(activity)

    def list_activities(self, device_id: str, limit: int = 50) -> list[ActivityLog]:
        activities = self._activities.get(device_id, [])
        return sorted(activities, key=lambda a: a.date, reverse=True)[:limit]
