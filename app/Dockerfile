FROM python:3.11-slim

# Install build dependencies and sudo
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential sudo && rm -rf /var/lib/apt/lists/*

# Create application user with passwordless sudo
RUN useradd --create-home --shell /bin/bash appuser && echo "appuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/appuser

WORKDIR /usr/src/project

COPY requirements.txt ./

# Create venv inside project/app/venv
RUN mkdir -p app \
    && python -m venv /usr/src/project/app/venv

ENV PATH="/usr/src/project/app/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /usr/src/project

USER appuser

EXPOSE 8000
