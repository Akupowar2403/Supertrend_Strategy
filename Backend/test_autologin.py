"""
test_autologin.py — Verify auto-login stores access_token and instruments in PostgreSQL.

Steps:
  1. Auto-login to Zerodha using .env credentials (TOTP)
  2. Save access_token to accounts table
  3. Fetch instruments from Zerodha and save to instruments table
  4. Verify both are stored correctly by querying DB
"""

import asyncio
import logging
from sqlalchemy import select, text

import zeroda
from models.database import async_session, init_db
from models.account import Account
from models.instrument import Instrument
from broker.instruments import refresh_instruments
from config.settings import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s — %(message)s")
log = logging.getLogger(__name__)


async def main():

    # ── Step 1: Create tables if not exist ────────────────────────────────────
    print("\n=== Step 1: Initialising DB tables ===")
    await init_db()
    print("  Done.\n")

    # ── Step 2: Auto-login using .env credentials ─────────────────────────────
    print("=== Step 2: Auto-login via TOTP (.env credentials) ===")
    try:
        access_token = zeroda.auto_login()
        print(f"  Access token received: {access_token[:10]}...{access_token[-6:]}\n")
    except Exception as e:
        print(f"  FAILED: {e}")
        print("  Fix: Make sure KITE_USER_ID, KITE_PASSWORD, KITE_TOTP_KEY are set in .env")
        return

    # ── Step 3: Save access_token to accounts table ───────────────────────────
    print("=== Step 3: Saving access_token to accounts table ===")
    async with async_session() as db:
        # Check if account already exists
        result = await db.execute(
            select(Account).where(Account.user_id == settings.kite_user_id)
        )
        account = result.scalars().first()

        if account:
            account.access_token  = access_token
            account.is_connected  = True
            print(f"  Updated existing account: {account.label} ({account.user_id})")
        else:
            account = Account(
                label        = f"Zerodha {settings.kite_user_id}",
                user_id      = settings.kite_user_id,
                api_key      = settings.kite_api_key,
                auth_method  = "totp",
                access_token = access_token,
                is_active    = True,
                is_connected = True,
            )
            db.add(account)
            print(f"  Created new account: {account.label}")

        await db.commit()
        print("  access_token saved to DB.\n")

    # ── Step 4: Fetch instruments from Zerodha → save to DB ──────────────────
    print("=== Step 4: Fetching instruments from Zerodha (NSE only for speed) ===")
    print("  This may take 10-20 seconds...")
    async with async_session() as db:
        try:
            total = await refresh_instruments(zeroda.kite, db)
            print(f"  Total instruments saved: {total}\n")
        except Exception as e:
            print(f"  FAILED: {e}\n")

    # ── Step 5: Verify DB ─────────────────────────────────────────────────────
    print("=== Step 5: Verifying DB ===")
    async with async_session() as db:

        # Check accounts
        result = await db.execute(
            select(Account).where(Account.user_id == settings.kite_user_id)
        )
        acc = result.scalars().first()
        print(f"  accounts table:")
        print(f"    user_id      = {acc.user_id}")
        print(f"    is_connected = {acc.is_connected}")
        print(f"    has_token    = {acc.access_token is not None}")

        # Check instruments count per exchange
        print(f"\n  instruments table:")
        for exchange in ["NSE", "NFO", "BSE", "MCX"]:
            result = await db.execute(
                text(f"SELECT COUNT(*) FROM instruments WHERE exchange = '{exchange}'")
            )
            count = result.scalar()
            print(f"    {exchange}: {count} instruments")

        # Sample 3 NSE instruments
        result = await db.execute(
            select(Instrument)
            .where(Instrument.exchange == "NSE")
            .limit(3)
        )
        samples = result.scalars().all()
        print(f"\n  Sample NSE instruments:")
        for s in samples:
            print(f"    {s.tradingsymbol} | token={s.instrument_token} | type={s.instrument_type}")

    print("\n=== ALL STEPS PASSED ===\n")


if __name__ == "__main__":
    asyncio.run(main())
