import os
import sys
import secrets
import string
from pathlib import Path

import django

# Make imports work when running from scripts/ or app root
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

USERNAME = "admin"
PASSWORD_LENGTH = 18


def generate_password(length=18):
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


if not User.objects.filter(username=USERNAME).exists():
    password = generate_password(PASSWORD_LENGTH)

    User.objects.create_superuser(
        username=USERNAME,
        password=password,
    )

    print("")
    print("========================================")
    print("Created default admin user")
    print(f"Username: {USERNAME}")
    print(f"Password: {password}")
    print("========================================")
    print("")
else:
    print("Default admin already exists.")
