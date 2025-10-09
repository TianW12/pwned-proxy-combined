"""Custom DRF permissions for the API layer."""

from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import BasePermission

from .models import APIKey


class HasValidAPIKey(BasePermission):
    """Permit access only when the request is authenticated via APIKeyAuthentication."""

    message = "No valid API key provided."

    def has_permission(self, request, view) -> bool:
        if isinstance(getattr(request, "auth", None), APIKey):
            return True
        raise NotAuthenticated(self.message)

