#!/bin/sh
# Generate environment files for frontend and backend.
# Random secrets are generated automatically. After running this
# script edit the created files to set your domain names and HIBP key.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

# Generate backend .env
echo "Generating backend environment (.env)"
"$DIR/pwned-proxy-backend/generate_env.sh"

# Copy frontend example
echo "Creating frontend environment (.env.local)"
cp "$DIR/pwned-proxy-frontend/app-main/.env.local.example" \
   "$DIR/pwned-proxy-frontend/app-main/.env.local"

frontend_env="$DIR/pwned-proxy-frontend/app-main/.env.local"

echo "\nEnter values for frontend variables"
# Prompt for frontend variables based on the example file
while IFS= read -r raw || [ -n "$raw" ]; do
  line="$(printf '%s' "$raw" | tr -d '\r')"
  [ -z "$line" ] && continue
  case "$line" in
    \#*) continue ;;
  esac
  key="${line%%=*}"
  default="${line#*=}"
  printf "Enter value for %s [%s]: " "$key" "$default"
  # Read from the terminal instead of the redirected file descriptor
  read -r value < /dev/tty
  if [ -z "$value" ]; then
    if [ "$key" = "NEXTAUTH_SECRET" ]; then
      value="$(openssl rand -base64 32 | tr -d '\n')"
    else
      value="$default"
    fi
  fi
  esc="$(printf '%s' "$value" | sed -e 's/[&/]/\\&/g')"
  sed -i "s#^${key}=.*#${key}=${esc}#" "$frontend_env"
done < "$DIR/pwned-proxy-frontend/app-main/.env.local.example"

echo "\nEnter values for backend variables"
# Prompt for HIBP key and domain
printf "Enter your HIBP API key (leave blank to skip): "
read -r hibp_key < /dev/tty
printf "Enter domain for the API [localhost:8000]: "
read -r domain < /dev/tty
domain=${domain:-localhost:8000}

# Update backend environment values
backend_env="$DIR/pwned-proxy-backend/.env"
sed -i "s/^HIBP_API_KEY=.*/HIBP_API_KEY=$hibp_key/" "$backend_env"
sed -i "s#^SERVICE_FQDN_APP=.*#SERVICE_FQDN_APP=$domain#" "$backend_env"
sed -i "s#^PWNED_PROXY_DOMAIN=.*#PWNED_PROXY_DOMAIN=$domain#" "$backend_env"

echo "Environment files created."
