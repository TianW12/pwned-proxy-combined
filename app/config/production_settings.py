# # config/localhost_production_settings.py

# from .settings import *  # First pull in all base settings

# # Override only what's needed for production-like settings on localhost.

# DEBUG = False
# ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# # If you need CSRF or CORS set for local dev behind a domain or IP:
# CSRF_TRUSTED_ORIGINS = [
#     "http://localhost",
#     "http://127.0.0.1",
#     # Add more as needed...
# ]
# CORS_ALLOW_ALL_ORIGINS = True

# SESSION_COOKIE_SECURE = False
# CSRF_COOKIE_SECURE = False

# # If you are using HTTPS on localhost (with something like mkcert),
# # set these to True (and set your local TLS). Otherwise keep them False for local dev:
# SECURE_SSL_REDIRECT = False
# SECURE_HSTS_SECONDS = 0
# SECURE_HSTS_INCLUDE_SUBDOMAINS = False
# SECURE_HSTS_PRELOAD = False




# # # When running behind a reverse proxy like Traefik the original protocol is
# # # communicated via the `X-Forwarded-Proto` header. Without telling Django to
# # # trust this header it will assume all requests are HTTP, causing tools like
# # # drf-yasg to generate Swagger/OpenAPI URLs with the wrong scheme. Browsers then
# # # block these "mixed content" requests. Configure Django to respect the
# # # forwarded header so HTTPS links are generated correctly.
# # SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# # USE_X_FORWARDED_HOST = True




# # Allow this application to be embedded in an iframe. By default Django
# # sets the X-Frame-Options header to 'DENY' which prevents embedding. Setting
# # it to 'ALLOWALL' removes the header so the site can be framed by any origin.
# X_FRAME_OPTIONS = 'ALLOWALL'