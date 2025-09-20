from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.spoilage_entry import SpoilageEntryCreate, SpoilageEntryOut, SpoilageEntryUpdate
from app.services import spoilage_entry as spoilage_service
from app.dependencies import get_db

router = APIRouter(
    prefix="/spoilage-entries",
    tags=["Spoilage Entries"]
)


@router.post("/", response_model=SpoilageEntryOut)
def create_entry(entry: SpoilageEntryCreate, db: Session = Depends(get_db)):
    return spoilage_service.create_spoilage_entry(db, entry)


@router.get("/{entry_id}", response_model=SpoilageEntryOut)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = spoilage_service.get_spoilage_entry(db, entry_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Spoilage entry not found")
    return db_entry


@router.get("/", response_model=List[SpoilageEntryOut])
def list_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return spoilage_service.get_all_spoilage_entries(db, skip, limit)


@router.put("/{entry_id}", response_model=SpoilageEntryOut)
def update_entry(entry_id: int, entry_update: SpoilageEntryUpdate, db: Session = Depends(get_db)):
    updated_entry = spoilage_service.update_spoilage_entry(db, entry_id, entry_update)
    if not updated_entry:
        raise HTTPException(status_code=404, detail="Spoilage entry not found")
    return updated_entry


@router.delete("/{entry_id}", response_model=dict)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    deleted = spoilage_service.delete_spoilage_entry(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Spoilage entry not found")
    return {"ok": True}
