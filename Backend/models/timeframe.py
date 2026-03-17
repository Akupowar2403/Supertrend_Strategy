"""
models/timeframe.py — Timeframes table.
Stores the 8 Zerodha Kite supported candle intervals.
Seeded once on startup — never fetched from Zerodha (they are static/fixed by Kite API).
"""

from sqlalchemy import Column, Integer, String, Boolean
from models.database import Base


class Timeframe(Base):
    __tablename__ = "timeframes"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    interval     = Column(String, nullable=False, unique=True)  # exact string passed to kite.historical_data()
    label        = Column(String, nullable=False)               # human-readable label for frontend
    minutes      = Column(Integer, nullable=False)              # duration in minutes — useful for sorting/display
    is_active    = Column(Boolean, default=True)                # allow disabling a timeframe without deleting
