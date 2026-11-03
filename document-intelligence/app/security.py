from functools import lru_cache
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings
from .db import get_pool

bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _jwks_client() -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json", cache_keys=True)


def _decode_access_token(token: str) -> dict:
    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") == "HS256":
            if not settings.jwt_secret:
                raise ValueError("Legacy HMAC JWTs require DI_JWT_SECRET")
            return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"], audience="authenticated", issuer=f"{settings.supabase_url.rstrip('/')}/auth/v1")
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(token, signing_key.key, algorithms=["ES256", "RS256"], audience="authenticated", issuer=f"{settings.supabase_url.rstrip('/')}/auth/v1")
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid or expired access token") from error


async def current_organization(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> UUID:
    if credentials is None:
        raise HTTPException(status_code=401, detail="A Supabase access token is required")
    claims = _decode_access_token(credentials.credentials)
    try:
        user_id = UUID(str(claims.get("sub", "")))
    except ValueError as error:
        raise HTTPException(status_code=401, detail="Access token has no valid subject") from error

    pool = get_pool()
    async with pool.connection() as connection:
        row = await (await connection.execute(
            "SELECT id FROM register WHERE id = %s AND is_active IS DISTINCT FROM false",
            (user_id,),
        )).fetchone()
    if not row:
        raise HTTPException(status_code=403, detail="No active organization profile is linked to this user")
    return row[0]

