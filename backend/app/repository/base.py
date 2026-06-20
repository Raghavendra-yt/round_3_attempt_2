from __future__ import annotations

import abc

from app.models import ActivityLog, UserProfile


class Repository(abc.ABC):
    @abc.abstractmethod
    def get_profile(self, device_id: str) -> UserProfile:
        pass  # pragma: no cover

    @abc.abstractmethod
    def save_profile(self, profile: UserProfile) -> None:
        pass  # pragma: no cover

    @abc.abstractmethod
    def add_activity(self, activity: ActivityLog) -> None:
        pass  # pragma: no cover

    @abc.abstractmethod
    def list_activities(self, device_id: str, limit: int = 50) -> list[ActivityLog]:
        pass  # pragma: no cover
