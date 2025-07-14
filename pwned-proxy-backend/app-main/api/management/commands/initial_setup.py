from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth.models import Group
from api.models import HIBPKey, APIKey, Domain
from api.admin import SEED_DATA
import os
import json

class Command(BaseCommand):
    help = "Perform initial setup using HIBP_API_KEY if provided."

    def handle(self, *args, **options):
        hibp_key_env = os.getenv('HIBP_API_KEY')
        if not hibp_key_env:
            self.stdout.write(self.style.WARNING('HIBP_API_KEY not set; skipping initial setup.'))
            return

        created = False
        if not HIBPKey.objects.exists():
            HIBPKey.objects.create(api_key=hibp_key_env, description='Initial key from .env')
            self.stdout.write(self.style.SUCCESS('Added HIBP API key.'))
            created = True
        else:
            self.stdout.write('HIBP API key already configured.')

        if not created:
            # If key already existed we assume initial setup already ran
            return

        # Import domains
        call_command('import_domain_data')

        # Seed groups
        seed_group_names = [item['group'] for item in SEED_DATA]
        APIKey.objects.filter(group__name__in=seed_group_names).delete()

        results = []
        for item in SEED_DATA:
            group_name = item['group']
            base_domain = item['domain']
            group, _ = Group.objects.get_or_create(name=group_name)
            api_key_obj, raw_key = APIKey.create_api_key(group=group)
            matching = Domain.objects.filter(name__endswith=base_domain)
            api_key_obj.domains.add(*matching)
            results.append({'group': group_name, 'api_key': raw_key})

        for res in results:
            self.stdout.write(f"{res['group']}: {res['api_key']}")

        # Also print admin credentials from env if available
        admin_user = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        admin_pass = os.getenv('DJANGO_SUPERUSER_PASSWORD', '')
        self.stdout.write(f"Admin user: {admin_user}")
        if admin_pass:
            self.stdout.write(f"Admin password: {admin_pass}")

