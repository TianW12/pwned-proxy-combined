from rest_framework.throttling import SimpleRateThrottle
from .models import hash_api_key

class APIKeyRateThrottle(SimpleRateThrottle):
    scope = 'apikey'

    def get_cache_key(self, request, view):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return None
        return f"apikey_{hash_api_key(api_key)}"



class AnonymousForwardedIPRateThrottle(SimpleRateThrottle):
    scope = "forwarded_ip"

    def get_cache_key(self, request, view):
        # If a valid API key authenticated the request,
        # do not apply the anonymous IP throttle.
        if request.auth:
            return None

        x_forwarded_for = request.headers.get("X-Forwarded-For")

        if x_forwarded_for:
            client_ip = x_forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.META.get("REMOTE_ADDR")

        if not client_ip:
            return None

        return f"throttle_forwarded_ip_{client_ip}"