# app/models.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class MessageIn(BaseModel):
    id: str
    meta_msg_id: Optional[str] = None
    wa_id: str
    name: Optional[str] = None
    number: Optional[str] = None
    text: Optional[str] = None
    timestamp: Optional[datetime] = None
    status: Optional[str] = "sent"   # sent | delivered | read
    from_me: Optional[bool] = False

class StatusUpdate(BaseModel):
    id: Optional[str] = None
    meta_msg_id: Optional[str] = None
    status: str
    timestamp: Optional[datetime] = None
