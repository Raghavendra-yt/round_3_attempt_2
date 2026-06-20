from __future__ import annotations

from functools import lru_cache

from app.config import get_settings
from app.repository.base import Repository


@lru_cache
def get_repository() -> Repository:
    """Return the configured repository (Firestore or InMemory), cached."""
    settings = get_settings()
    if settings.use_firestore:
        from app.repository.firestore_repo import FirestoreRepository

        return FirestoreRepository(project_id=settings.project_id)
    else:
        from app.repository.memory_repo import InMemoryRepository

        return InMemoryRepository()
