"""Quick DB check — shows all tables and row counts."""
import asyncio
from sqlalchemy import text
from models.database import async_session, init_db

async def main():
    await init_db()
    async with async_session() as db:

        # All tables
        result = await db.execute(text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' ORDER BY table_name"
        ))
        tables = [r[0] for r in result.fetchall()]
        print("\n=== TABLES ===")
        for t in tables:
            count = await db.execute(text(f"SELECT COUNT(*) FROM {t}"))
            print(f"  {t}: {count.scalar()} rows")

        # Accounts detail
        if "accounts" in tables:
            print("\n=== ACCOUNTS ===")
            result = await db.execute(text(
                "SELECT id, label, user_id, is_connected, "
                "access_token IS NOT NULL as has_token FROM accounts"
            ))
            rows = result.fetchall()
            if rows:
                for r in rows:
                    print(f"  id={r[0][:8]}... label={r[1]} user={r[2]} connected={r[3]} has_token={r[4]}")
            else:
                print("  (empty)")

asyncio.run(main())
