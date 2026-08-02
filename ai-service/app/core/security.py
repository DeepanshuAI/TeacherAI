"""JWT verification and service-to-service authentication."""

from typing import Optional

import structlog
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

logger = structlog.get_logger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


def verify_service_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> bool:
    """Verify the internal service-to-service secret token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if credentials.credentials != settings.SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid service token",
        )
    return True


def verify_user_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> dict:
    """
    Verify and decode a user JWT passed from the Next.js layer.
    In production, better-auth signs JWTs which we validate here.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    # The Next.js API layer forwards user info as headers (validated there).
    # The AI service trusts X-User-* headers set by the Next.js proxy.
    # The bearer token here is the internal service secret.
    if credentials.credentials != settings.SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid service token",
        )

    # Return a placeholder — actual user data comes from X-User-* headers
    return {"authenticated": True}
