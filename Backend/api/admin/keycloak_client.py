"""
api/admin/keycloak_client.py — Thin async wrapper around the Keycloak Admin REST API.

All functions accept an admin token so callers can re-use a single token per request.
"""

import logging

import httpx
from fastapi import HTTPException

from config.settings import settings

log = logging.getLogger(__name__)

MANAGED_ROLES = ("admin", "approve", "revoke", "pending")
_SKIP_ROLES   = {"default-roles-swts", "offline_access", "uma_authorization"}


# ── Token ──────────────────────────────────────────────────────────────────────

async def get_admin_token() -> str:
    """Obtain a short-lived admin token from the Keycloak master realm."""
    url = f"{settings.keycloak_url}/realms/master/protocol/openid-connect/token"
    async with httpx.AsyncClient() as client:
        r = await client.post(url, data={
            "grant_type": "password",
            "client_id":  "admin-cli",
            "username":   settings.keycloak_admin_user,
            "password":   settings.keycloak_admin_password,
        })
        if not r.is_success:
            log.error("Keycloak admin token failed: %s", r.text)
            raise HTTPException(status_code=502, detail="Could not obtain Keycloak admin token")
        return r.json()["access_token"]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _base() -> str:
    return f"{settings.keycloak_url}/admin/realms/{settings.keycloak_realm}"


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── User operations ────────────────────────────────────────────────────────────

async def list_users(token: str) -> list[dict]:
    """Return all realm users with their filtered realm roles."""
    base = _base()
    h    = _headers(token)

    async with httpx.AsyncClient() as client:
        r = await client.get(f"{base}/users?max=200", headers=h)
        r.raise_for_status()
        users: list[dict] = r.json()

        result = []
        for u in users:
            uid = u["id"]
            rr  = await client.get(f"{base}/users/{uid}/role-mappings/realm", headers=h)
            roles = (
                [rm["name"] for rm in rr.json() if rm["name"] not in _SKIP_ROLES]
                if rr.is_success else []
            )
            result.append({
                "id":        uid,
                "username":  u.get("username"),
                "email":     u.get("email", ""),
                "firstName": u.get("firstName", ""),
                "lastName":  u.get("lastName", ""),
                "enabled":   u.get("enabled", True),
                "roles":     roles,
                "createdAt": u.get("createdTimestamp"),
            })

    return result


async def assign_role(token: str, user_id: str, role_name: str) -> None:
    """Assign a realm role to a user."""
    _validate_role(role_name)
    base = _base()
    h    = _headers(token)

    async with httpx.AsyncClient() as client:
        role_rep = await _fetch_role(client, base, h, role_name)
        rr = await client.post(
            f"{base}/users/{user_id}/role-mappings/realm",
            json=[role_rep],
            headers=h,
        )
        if not rr.is_success:
            raise HTTPException(status_code=rr.status_code, detail=rr.text)


async def remove_role(token: str, user_id: str, role_name: str) -> None:
    """Remove a realm role from a user."""
    _validate_role(role_name)
    base = _base()
    h    = _headers(token)

    async with httpx.AsyncClient() as client:
        role_rep = await _fetch_role(client, base, h, role_name)
        rr = await client.request(
            "DELETE",
            f"{base}/users/{user_id}/role-mappings/realm",
            json=[role_rep],
            headers=h,
        )
        if not rr.is_success:
            raise HTTPException(status_code=rr.status_code, detail=rr.text)


async def set_user_enabled(token: str, user_id: str, enabled: bool) -> None:
    """Enable or disable a Keycloak user account."""
    base = _base()
    h    = _headers(token)

    async with httpx.AsyncClient() as client:
        rr = await client.put(
            f"{base}/users/{user_id}",
            json={"enabled": enabled},
            headers=h,
        )
        if not rr.is_success:
            raise HTTPException(status_code=rr.status_code, detail=rr.text)


# ── Private helpers ────────────────────────────────────────────────────────────

def _validate_role(role_name: str) -> None:
    if role_name not in MANAGED_ROLES:
        raise HTTPException(status_code=400, detail=f"role must be one of: {MANAGED_ROLES}")


async def _fetch_role(client: httpx.AsyncClient, base: str, headers: dict, role_name: str) -> dict:
    r = await client.get(f"{base}/roles/{role_name}", headers=headers)
    if not r.is_success:
        raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found in realm")
    return r.json()
