# =============================================================================
# Frontend production image
# -----------------------------------------------------------------------------
# Stage 1 builds the React app with Node. Stage 2 throws Node away and keeps
# only the tiny built files, served by nginx. The final image is small and
# contains no build tools.
# =============================================================================

# ---- Stage 1: build the React app ------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Install dependencies first (cached unless package files change).
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source and build. Output goes to /app/dist.
COPY . .
RUN npm run build

# ---- Stage 2: serve with nginx ---------------------------------------------
FROM nginx:1.27-alpine

# Copy the built static site into nginx's web root.
COPY --from=build /app/dist /usr/share/nginx/html

# The actual server config (nginx/nginx.conf) is mounted at runtime by
# docker-compose, so editing domains doesn't require rebuilding this image.

EXPOSE 80 443
