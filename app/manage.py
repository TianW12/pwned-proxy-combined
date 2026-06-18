#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path

# The working directory may be ``app-main`` when running inside Docker.
# Ensure both the project root and ``app-main`` are on ``sys.path`` so
# that ``config.settings`` can import ``envutils`` regardless of
# where this script is executed.
BASE_DIR = Path(__file__).resolve().parent


def main():
    """Run administrative tasks."""
    os.environ.setdefault(
        "DJANGO_SETTINGS_MODULE",
        "config.development_settings"
    )



    if 'DJANGO_SETTINGS_MODULE' not in os.environ:
        raise RuntimeError(
            'DJANGO_SETTINGS_MODULE environment variable is required'
        )
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
