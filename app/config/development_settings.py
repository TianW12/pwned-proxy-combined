from .base_settings import *  # First pull in all base settings

DEBUG = True

DOMAIN = 'localhost:8000'

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000'
]
CORS_ALLOW_ALL_ORIGINS = True


ALLOWED_HOSTS = []

# If you’re debugging over HTTPS but not forcing cookies to be Secure:
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# These can remain off in dev:
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

CORS_ALLOW_ALL_ORIGINS = True




# Allow this application to be embedded in an iframe. By default Django
# sets the X-Frame-Options header to 'DENY' which prevents embedding. Setting
# it to 'ALLOWALL' removes the header so the site can be framed by any origin.
X_FRAME_OPTIONS = 'ALLOWALL'