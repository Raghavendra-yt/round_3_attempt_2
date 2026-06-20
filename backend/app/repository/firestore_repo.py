"""Firestore-backed Repository (Google Cloud Native mode) for Gamified Activity/XP Tracker."""

from __future__ import annotations

from app.models import ActivityLog, UserProfile
from app.repository.base import Repository


class FirestoreRepository(Repository):
    """Repository backed by Firestore collections/documents."""

    def __init__(self, project_id: str) -> None:
        """Create a Firestore client for the given project (auth via ADC)."""
        from google.cloud import firestore  # lazy import

        self._db = firestore.Client(project=project_id)

    def get_profile(self, device_id: str) -> UserProfile:
        """Fetch the UserProfile for a device, or return a default profile if not found."""
        doc = self._db.collection("devices").document(device_id).get()
        if not doc.exists:
            # Create, save, and return a default profile
            profile = UserProfile(device_id=device_id)
            self.save_profile(profile)
            return profile
        return UserProfile.model_validate(doc.to_dict())

    def save_profile(self, profile: UserProfile) -> None:
        """Persist/update a user's profile."""
        doc = self._db.collection("devices").document(profile.device_id)
        doc.set(profile.model_dump(mode="json"))

    def add_activity(self, activity: ActivityLog) -> None:
        """Log a new activity under the device's subcollection."""
        doc = (
            self._db.collection("devices")
            .document(activity.device_id)
            .collection("activities")
            .document(activity.id)
        )
        doc.set(activity.model_dump(mode="json"))

    def list_activities(self, device_id: str, limit: int = 50) -> list[ActivityLog]:
        """List recent activities for the device, ordered by date descending."""
        from google.cloud import firestore  # lazy import

        snapshots = (
            self._db.collection("devices")
            .document(device_id)
            .collection("activities")
            .order_by("date", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        activities: list[ActivityLog] = []
        for snap in snapshots:
            activities.append(ActivityLog.model_validate(snap.to_dict()))
        return activities
