"""Tests for the Firestore repository against an in-memory fake client."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import pytest
from app.models import ActivityLog
from app.repository.firestore_repo import FirestoreRepository


class _FakeDocumentSnapshot:
    def __init__(self, doc_id, data, exists=True):
        self.id = doc_id
        self._data = data
        self.exists = exists

    def to_dict(self):
        return self._data


class _FakeDocumentReference:
    def __init__(self, store, path, doc_id):
        self._store = store
        self._path = path  # tuple of keys
        self._id = doc_id

    def get(self):
        data = self._store.get((*self._path, self._id))
        if data is None:
            return _FakeDocumentSnapshot(self._id, None, exists=False)
        return _FakeDocumentSnapshot(self._id, data, exists=True)

    def set(self, data):
        self._store[(*self._path, self._id)] = data

    def collection(self, col_name):
        return _FakeCollectionReference(self._store, (*self._path, self._id), col_name)


class _FakeQuery:
    def __init__(self, items):
        self._items = items  # list of dicts

    def order_by(self, field, direction="ASCENDING"):
        from google.cloud import firestore

        reverse = direction == firestore.Query.DESCENDING
        sorted_items = sorted(self._items, key=lambda x: x.get(field), reverse=reverse)
        return _FakeQuery(sorted_items)

    def limit(self, limit):
        return _FakeQuery(self._items[:limit])

    def stream(self):
        return iter(_FakeDocumentSnapshot("", item, exists=True) for item in self._items)


class _FakeCollectionReference:
    def __init__(self, store, parent_path, name):
        self._store = store
        self._parent_path = parent_path
        self._name = name

    def document(self, doc_id):
        return _FakeDocumentReference(self._store, (*self._parent_path, self._name), doc_id)

    def order_by(self, field, direction="ASCENDING"):
        prefix = (*self._parent_path, self._name)
        items = []
        for key, val in self._store.items():
            if len(key) == len(prefix) + 1 and key[: len(prefix)] == prefix:
                items.append(val)
        return _FakeQuery(items).order_by(field, direction)


class _FakeFirestoreClient:
    def __init__(self, project=None):
        self.project = project
        self._store = {}  # tuple path -> dict

    def collection(self, name):
        return _FakeCollectionReference(self._store, (), name)


@pytest.fixture
def repo(monkeypatch):
    monkeypatch.setattr("google.cloud.firestore.Client", _FakeFirestoreClient)
    return FirestoreRepository(project_id="test-project")


def _make_activity(device_id: str, act_id: str | None = None) -> ActivityLog:
    return ActivityLog(
        id=act_id or uuid.uuid4().hex,
        date=datetime.now(timezone.utc).isoformat(),
        device_id=device_id,
        category="transport",
        activity="Carpooling",
        impact=-5.2,
    )


def test_get_profile_returns_default_and_saves_when_not_exist(repo):
    profile = repo.get_profile("device-fire-new")
    assert profile.device_id == "device-fire-new"
    # Ensure it saved it to db too
    retrieved = repo.get_profile("device-fire-new")
    assert retrieved.device_id == "device-fire-new"


def test_save_and_get_profile(repo):
    profile = repo.get_profile("device-fire-1")
    profile.xp = 250
    profile.level = 3
    repo.save_profile(profile)

    updated = repo.get_profile("device-fire-1")
    assert updated.xp == 250
    assert updated.level == 3


def test_add_and_list_activities(repo):
    device = "device-fire-2"
    act1 = _make_activity(device, "act-1")
    act2 = _make_activity(device, "act-2")
    act_other = _make_activity("device-other", "act-other")

    repo.add_activity(act1)
    repo.add_activity(act2)
    repo.add_activity(act_other)

    acts = repo.list_activities(device)
    assert len(acts) == 2
    assert {a.id for a in acts} == {"act-1", "act-2"}


def test_list_activities_respects_limit(repo):
    device = "device-fire-limit"
    for i in range(5):
        repo.add_activity(_make_activity(device, f"act-{i}"))

    assert len(repo.list_activities(device, limit=3)) == 3


def test_list_activities_returns_newest_first(repo):
    device = "device-fire-time"
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
