from .settings import *  # First pull in all base settings

DEBUG = True

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000'
]
CORS_ALLOW_ALL_ORIGINS = True



# If you’re debugging over HTTPS but not forcing cookies to be Secure:
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# These can remain off in dev:
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

CORS_ALLOW_ALL_ORIGINS = True




# This allows the app to be iramed in the UI frontend
X_FRAME_OPTIONS = 'ALLOWALL'