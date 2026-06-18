import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# # Setup Django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')



if not User.objects.filter(username=username).exists():
    if not password:
        print('Error: missing env variable DJANGO_SUPERUSER_PASSWORD', file=sys.stderr)
        sys.exit(1)
    User.objects.create_superuser(username=username, password=password)
    print('Created default admin user:', username)
    print('Password:', password)
else:
    print('Default admin already exists: %s' % username)
    print('Password:', password)
