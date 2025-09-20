from sqlalchemy.orm import Session
from app.models.spoilage_entry import SpoilageEntry
from app.schemas.spoilage_entry import SpoilageEntryCreate, SpoilageEntryUpdate
from typing import List, Optional


def create_spoilage_entry(db: Session, entry: SpoilageEntryCreate) -> SpoilageEntry:
    db_entry = SpoilageEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def get_spoilage_entry(db: Session, entry_id: int) -> Optional[SpoilageEntry]:
    return db.query(SpoilageEntry).filter(SpoilageEntry.id == entry_id).first()


def get_all_spoilage_entries(db: Session, skip: int = 0, limit: int = 100) -> List[SpoilageEntry]:
    return db.query(SpoilageEntry).offset(skip).limit(limit).all()


def update_spoilage_entry(db: Session, entry_id: int, entry_update: SpoilageEntryUpdate) -> Optional[SpoilageEntry]:
    db_entry = get_spoilage_entry(db, entry_id)
    if not db_entry:
        return None
    update_data = entry_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entry, key, value)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def delete_spoilage_entry(db: Session, entry_id: int) -> bool:
    db_entry = get_spoilage_entry(db, entry_id)
    if not db_entry:
        return False
    db.delete(db_entry)
    db.commit()
    return True
