"""
api/admin/auth.py — FastAPI dependency that validates the caller has the 'admin' realm role.
"""

import base64
import json

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer()


def require_admin(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> None:
    """Raise 403 if the Keycloak JWT does not contain the 'admin' realm role."""
    try:
        payload_b64 = creds.credentials.split(".")[1]
        payload_b64 += "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        roles   = payload.get("realm_access", {}).get("roles", [])
        if "admin" not in roles:
            raise HTTPException(status_code=403, detail="Admin role required")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
