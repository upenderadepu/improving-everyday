import type { Track } from "./types";

export const dockerTrack: Track = {
  id: "docker",
  title: "Docker",
  description: "Containerize everything with Docker",
  longDescription:
    "Learn to build, run, and ship applications in containers — from your first docker run to production-ready multi-container applications.",
  icon: "Container",
  color: "#2496ed",
  gradient: "track-docker-gradient",
  tags: ["containers", "devops", "deployment", "infrastructure"],
  modules: [
    {
      id: "docker-fundamentals",
      title: "Docker Fundamentals",
      level: "beginner",
      description: "Understand containers, the Docker architecture, and why containers matter.",
      lessons: [
        {
          id: "what-is-docker",
          title: "What is Docker?",
          duration: 10,
          type: "lesson",
          description: "Understand containers, how they differ from VMs, and the Docker architecture.",
          content: `# What is Docker?

Docker is an open-source platform that enables you to **package, distribute, and run applications inside containers**. Containers are lightweight, isolated environments that include everything an application needs to run.

## The "It Works on My Machine" Problem

Before containers, deploying software meant wrestling with environment differences:

\`\`\`
Developer's machine: Python 3.9, Ubuntu 20.04, libssl 1.1
Staging server:      Python 3.8, CentOS 7, libssl 1.0  ← BREAKS
Production:          Python 3.11, Debian 11, libssl 3.0 ← BREAKS DIFFERENTLY
\`\`\`

Docker solves this by packaging the application **with its entire runtime environment**:

\`\`\`
Container = Your App + Python 3.9 + Ubuntu 20.04 + libssl 1.1 + everything else
\`\`\`

Now the container runs identically everywhere Docker is installed.

## Containers vs. Virtual Machines

| | Virtual Machine | Container |
|---|---|---|
| What it virtualizes | Entire hardware stack | OS process isolation |
| Boot time | Minutes | Milliseconds |
| Size | GBs | MBs |
| OS | Full guest OS | Shares host OS kernel |
| Isolation | Complete | Process-level |
| Performance overhead | High (hypervisor) | Near-native |

\`\`\`
┌────────────────────────┐    ┌──────────────────────────┐
│  VM Architecture        │    │  Container Architecture   │
├────────┬───────────────┤    ├──────┬──────┬────────────┤
│ App A  │ App B         │    │ App A│ App B│ App C      │
├────────┴───────────────┤    ├──────┴──────┴────────────┤
│ Guest OS │ Guest OS    │    │        Docker Engine      │
├──────────────────────  ┤    ├──────────────────────────┤
│       Hypervisor        │    │        Host OS Kernel     │
├────────────────────────┤    ├──────────────────────────┤
│       Host Hardware     │    │       Host Hardware       │
└────────────────────────┘    └──────────────────────────┘
\`\`\`

## Docker Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                Docker CLI (your terminal)                │
└──────────────────────────────┬──────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────┐
│                    Docker Daemon (dockerd)               │
│                                                         │
│    ┌───────────┐  ┌───────────┐  ┌───────────────────┐  │
│    │ Containers │  │  Images   │  │ Networks/Volumes  │  │
│    └───────────┘  └───────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────┐
│                    Docker Registry                       │
│              (Docker Hub, GHCR, ECR, etc.)              │
└─────────────────────────────────────────────────────────┘
\`\`\`

**Docker Client** — The CLI tool you use (\`docker\` command)
**Docker Daemon** — The background service that manages containers
**Docker Registry** — Where images are stored and distributed

## Key Concepts

- **Image** — A read-only template (blueprint) for creating containers
- **Container** — A running instance of an image
- **Dockerfile** — Instructions for building an image
- **Registry** — Storage for images (Docker Hub is the default public registry)
- **Volume** — Persistent storage for containers
- **Network** — Communication channel between containers

## Installing Docker

\`\`\`bash
# macOS / Windows
# Download Docker Desktop from https://docker.com/products/docker-desktop

# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER  # add yourself to docker group

# Verify
docker --version
# Docker version 26.1.0, build abc1234

docker run hello-world  # Test it works
\`\`\`
`,
        },
        {
          id: "docker-basics",
          title: "Docker Basics: run, ps, exec",
          duration: 15,
          type: "lesson",
          description: "Run your first containers and learn to manage them.",
          content: `# Docker Basics: run, ps, exec

## docker run — Start a Container

\`\`\`bash
# Basic run
docker run nginx

# Run in detached mode (background)
docker run -d nginx

# Run with a name
docker run -d --name my-nginx nginx

# Run with port mapping (host:container)
docker run -d -p 8080:80 --name web nginx
# Now visit http://localhost:8080

# Run with environment variables
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql

# Run interactively (get a shell)
docker run -it ubuntu bash

# Run and remove on exit
docker run --rm -it python:3.12 python

# Run with resource limits
docker run -d --memory="512m" --cpus="1.5" nginx
\`\`\`

### Port Mapping Explained

\`\`\`
Host port 8080  →  Container port 80
      │                   │
Your browser        Nginx inside container
http://localhost:8080      listens on :80
\`\`\`

## docker ps — List Containers

\`\`\`bash
# List running containers
docker ps
# CONTAINER ID   IMAGE     COMMAND                CREATED        STATUS       PORTS                  NAMES
# a1b2c3d4e5f6   nginx     "/docker-entrypoint…"  2 minutes ago  Up 2 min     0.0.0.0:8080->80/tcp   web

# List all containers (including stopped)
docker ps -a

# Just container IDs
docker ps -q

# Filter
docker ps -f status=exited
docker ps -f name=web
\`\`\`

## docker exec — Run Commands in Running Containers

\`\`\`bash
# Get an interactive shell
docker exec -it web bash
docker exec -it web sh  # if bash isn't available

# Run a single command
docker exec web nginx -t         # Test nginx config
docker exec web cat /etc/nginx/nginx.conf

# Run as root (even if container runs as another user)
docker exec -u root -it web bash
\`\`\`

## docker logs — View Output

\`\`\`bash
# View logs
docker logs web

# Follow logs (like tail -f)
docker logs -f web

# Last 50 lines
docker logs --tail 50 web

# With timestamps
docker logs -t web

# Since a specific time
docker logs --since 2024-01-01T00:00:00 web
\`\`\`

## Managing Containers

\`\`\`bash
# Stop a container (sends SIGTERM, then SIGKILL after 10s)
docker stop web

# Start a stopped container
docker start web

# Restart a container
docker restart web

# Kill immediately (SIGKILL)
docker kill web

# Remove a container (must be stopped first)
docker rm web

# Remove a running container (force)
docker rm -f web

# Remove all stopped containers
docker container prune

# Inspect container details (JSON)
docker inspect web
\`\`\`

## Copying Files

\`\`\`bash
# Copy from container to host
docker cp web:/etc/nginx/nginx.conf ./nginx.conf

# Copy from host to container
docker cp ./my-config.conf web:/etc/nginx/nginx.conf
\`\`\`
`,
        },
        {
          id: "images-and-containers",
          title: "Images & Docker Hub",
          duration: 12,
          type: "lesson",
          description: "Pull, build, tag, and push Docker images.",
          content: `# Images & Docker Hub

## Understanding Docker Images

A Docker image is a **layered, read-only filesystem** built from a Dockerfile. Each instruction in the Dockerfile creates a new layer.

\`\`\`
Image layers (read-only):
┌─────────────────────────────┐
│  Layer 4: COPY app/ /app/   │ ← your application code
├─────────────────────────────┤
│  Layer 3: RUN npm install   │ ← node_modules
├─────────────────────────────┤
│  Layer 2: COPY package*.json│ ← package files
├─────────────────────────────┤
│  Layer 1: FROM node:20      │ ← base OS + Node.js
└─────────────────────────────┘
Container (writable layer on top, added when run)
\`\`\`

## Pulling Images

\`\`\`bash
# Pull from Docker Hub (default registry)
docker pull nginx
docker pull nginx:1.25.3       # Specific version
docker pull nginx:alpine        # Alpine-based (smaller)

# Pull from GitHub Container Registry
docker pull ghcr.io/owner/image:tag

# Pull from AWS ECR
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest

# Pull for specific platform
docker pull --platform linux/arm64 nginx
\`\`\`

## Image Naming Convention

\`\`\`
[registry/][namespace/]name[:tag]

nginx                           → docker.io/library/nginx:latest
nginx:alpine                    → docker.io/library/nginx:alpine
myorg/myapp:1.2.3              → docker.io/myorg/myapp:1.2.3
ghcr.io/myorg/myapp:latest     → GitHub Container Registry
\`\`\`

## Listing and Managing Images

\`\`\`bash
# List local images
docker images
# REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
# nginx        latest    abc123def456   2 weeks ago     187MB
# node         20        789012ghi789   3 weeks ago     1.1GB

# Remove an image
docker rmi nginx

# Remove unused images
docker image prune

# Remove ALL unused images
docker image prune -a

# Inspect an image
docker inspect nginx

# See image layers
docker history nginx
\`\`\`

## Tagging Images

\`\`\`bash
# Tag an image
docker tag myapp:latest myorg/myapp:1.2.3
docker tag myapp:latest myorg/myapp:latest
docker tag myapp:latest ghcr.io/myorg/myapp:1.2.3

# Tag with git commit SHA
docker tag myapp:latest myorg/myapp:$(git rev-parse --short HEAD)
\`\`\`

## Pushing to Docker Hub

\`\`\`bash
# Log in
docker login
# Username: your-username
# Password: (personal access token, not your password)

# Push
docker push myorg/myapp:1.2.3
docker push myorg/myapp:latest

# Log out
docker logout
\`\`\`

## Image Best Practices

\`\`\`bash
# Use specific tags in production (not :latest)
FROM node:20.11.1-alpine3.19   # ✅ Pinned
FROM node:latest                # ❌ Unpredictable

# Use official images when possible
FROM nginx:alpine               # ✅ Official, well-maintained
FROM some-random-user/nginx    # ❌ Unknown provenance

# Use alpine or slim variants for smaller images
node:20          → 1.1 GB
node:20-slim     → 229 MB
node:20-alpine   → 135 MB
\`\`\`
`,
        },
      ],
    },
    {
      id: "dockerfile-basics",
      title: "Dockerfile Basics",
      level: "beginner",
      description: "Write Dockerfiles to build your own images.",
      lessons: [
        {
          id: "writing-dockerfiles",
          title: "Writing Dockerfiles",
          duration: 20,
          type: "lesson",
          description: "Learn the essential Dockerfile instructions to containerize any app.",
          content: `# Writing Dockerfiles

A Dockerfile is a text file with instructions that Docker reads to build an image. Each instruction becomes a layer.

## Dockerfile Instructions

### FROM — Base Image

\`\`\`dockerfile
# Start from an official base image
FROM node:20-alpine

# Multi-stage: name the stage
FROM node:20-alpine AS builder
\`\`\`

### WORKDIR — Working Directory

\`\`\`dockerfile
# Set the working directory (creates it if needed)
WORKDIR /app
# All subsequent commands run from /app
\`\`\`

### COPY & ADD — Copy Files

\`\`\`dockerfile
# COPY <src> <dest>
COPY package*.json ./      # Copy package files
COPY src/ ./src/            # Copy directory
COPY . .                    # Copy everything

# ADD can also extract archives and fetch URLs
ADD app.tar.gz /app/       # Extracts the archive
# Prefer COPY for simple file copying (more explicit)
\`\`\`

### RUN — Execute Commands

\`\`\`dockerfile
# Run during BUILD time (each RUN = new layer)
RUN npm ci
RUN apt-get update && apt-get install -y curl

# Chain commands to reduce layers
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       curl \
       wget \
    && rm -rf /var/lib/apt/lists/*
\`\`\`

### ENV — Environment Variables

\`\`\`dockerfile
ENV NODE_ENV=production
ENV PORT=3000 HOST=0.0.0.0
\`\`\`

### EXPOSE — Document Ports

\`\`\`dockerfile
# Documents which ports the container listens on
# Does NOT actually publish the port (that's done with -p in docker run)
EXPOSE 3000
\`\`\`

### CMD vs ENTRYPOINT

\`\`\`dockerfile
# CMD — default command (can be overridden by docker run arguments)
CMD ["node", "server.js"]
CMD ["npm", "start"]

# ENTRYPOINT — always runs (CMD becomes default arguments)
ENTRYPOINT ["node"]
CMD ["server.js"]            # docker run myapp → runs: node server.js
                             # docker run myapp other.js → runs: node other.js

# Common pattern: ENTRYPOINT for the executable, CMD for default args
ENTRYPOINT ["python3"]
CMD ["app.py"]
\`\`\`

Always use the **exec form** (JSON array) not the shell form:
\`\`\`dockerfile
CMD ["node", "server.js"]       # ✅ exec form (PID 1, receives signals)
CMD node server.js              # ❌ shell form (runs in sh -c, signals ignored)
\`\`\`

### USER — Non-Root User

\`\`\`dockerfile
# Create a non-root user (security best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
\`\`\`

### HEALTHCHECK

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

## Complete Node.js Example

\`\`\`dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only what's needed
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
\`\`\`

## Building Images

\`\`\`bash
# Build (tag with -t)
docker build -t myapp:latest .

# Build with specific Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build args
docker build --build-arg NODE_VERSION=20 -t myapp .

# Build for specific platform
docker build --platform linux/amd64 -t myapp .

# Build and push in one step (with buildx)
docker buildx build --push -t ghcr.io/org/myapp:latest .
\`\`\`
`,
        },
      ],
    },
    {
      id: "docker-compose",
      title: "Docker Compose",
      level: "intermediate",
      description: "Orchestrate multi-container applications with Docker Compose.",
      lessons: [
        {
          id: "compose-intro",
          title: "Docker Compose",
          duration: 20,
          type: "lesson",
          description: "Define and run multi-container applications with compose.yaml.",
          content: `# Docker Compose

Docker Compose lets you define and manage **multi-container applications** with a single YAML file. Instead of running multiple \`docker run\` commands, you describe your entire stack.

## Why Docker Compose?

A modern app typically needs:
- The application server
- A database (PostgreSQL, MySQL)
- A cache (Redis)
- A message queue (RabbitMQ)
- A reverse proxy (nginx)

Managing these with individual \`docker run\` commands is tedious. Compose solves this.

## compose.yaml Structure

\`\`\`yaml
# compose.yaml (or docker-compose.yml)
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - web

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: bridge
\`\`\`

## Docker Compose Commands

\`\`\`bash
# Start all services (detached)
docker compose up -d

# Build images before starting
docker compose up -d --build

# View running services
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs for a specific service
docker compose logs -f web

# Execute a command in a service
docker compose exec web bash
docker compose exec db psql -U postgres myapp

# Stop all services (keeps data)
docker compose stop

# Stop and remove containers, networks
docker compose down

# Stop and remove everything including volumes
docker compose down -v

# Scale a service (run multiple instances)
docker compose up -d --scale web=3

# Restart a specific service
docker compose restart web

# Pull latest images
docker compose pull

# Run a one-off command
docker compose run --rm web npm run migrate
\`\`\`

## Environment Variables

\`\`\`yaml
# Option 1: inline
services:
  web:
    environment:
      NODE_ENV: production
      PORT: 3000

# Option 2: .env file (auto-loaded by Compose)
services:
  web:
    env_file:
      - .env
      - .env.local

# Option 3: reference host environment
services:
  web:
    environment:
      - API_KEY  # takes value from host shell
\`\`\`

## Service Dependencies

\`\`\`yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy    # wait for health check
      cache:
        condition: service_started   # just wait for container to start
      migrations:
        condition: service_completed_successfully  # wait for one-shot task
\`\`\`

## Production Compose with Override

\`\`\`bash
# Development (default)
docker compose up

# Production (merges compose.yaml + compose.prod.yaml)
docker compose -f compose.yaml -f compose.prod.yaml up
\`\`\`

\`\`\`yaml
# compose.prod.yaml (overrides for production)
services:
  web:
    restart: always
    deploy:
      resources:
        limits:
          memory: 512m
  db:
    volumes:
      - /data/postgres:/var/lib/postgresql/data  # host path in prod
\`\`\`
`,
        },
      ],
    },
    {
      id: "docker-networking",
      title: "Docker Networking",
      level: "intermediate",
      description: "Connect containers together using Docker networks.",
      lessons: [
        {
          id: "networking-basics",
          title: "Container Networking",
          duration: 12,
          type: "lesson",
          description: "Understand Docker network types and how containers communicate.",
          objectives: [
            "Understand bridge, host, and overlay network drivers",
            "Create custom Docker networks",
            "Connect containers by name using DNS",
            "Publish ports and control traffic",
          ],
          content: `# Container Networking

By default, Docker containers are isolated from each other and the host. Docker **networks** control how containers communicate.

## Network Drivers

| Driver | Use Case |
|--------|----------|
| \`bridge\` | Default for standalone containers on the same host |
| \`host\` | Container shares the host's network stack |
| \`overlay\` | Multi-host networking (Docker Swarm / Kubernetes) |
| \`none\` | Completely isolated — no networking |

## The Default Bridge Network

When you start a container without specifying a network, it joins the default \`bridge\` network. Containers on the default bridge can communicate by IP but **not by name**.

\`\`\`bash
# Inspect the default bridge
docker network inspect bridge

# Container IPs are assigned automatically
docker run -d --name c1 nginx
docker run -d --name c2 nginx
# c1 cannot ping c2 by name on the default bridge
\`\`\`

## User-Defined Bridge Networks

Create a custom bridge network to enable **DNS-based container discovery**:

\`\`\`bash
# Create a network
docker network create my-app-net

# Run containers on the network
docker run -d --name db --network my-app-net postgres:16
docker run -d --name api --network my-app-net my-api-image

# api can reach db using the hostname "db"
# Inside api container:
psql -h db -U postgres
\`\`\`

## Connecting and Disconnecting

\`\`\`bash
# Connect a running container to another network
docker network connect my-app-net my-container

# Disconnect
docker network disconnect my-app-net my-container

# List all networks
docker network ls

# Remove unused networks
docker network prune
\`\`\`

## Publishing Ports

Use \`-p host:container\` to expose container ports to the host:

\`\`\`bash
# Map host port 8080 to container port 80
docker run -d -p 8080:80 nginx

# Bind to a specific host interface
docker run -d -p 127.0.0.1:8080:80 nginx

# Publish all exposed ports (random host ports)
docker run -d -P nginx
\`\`\`

## Compose Networking

Docker Compose automatically creates a network for your project and connects all services:

\`\`\`yaml
services:
  web:
    image: nginx
    ports:
      - "80:80"
  api:
    build: .
    # web and api can reach each other by service name
  db:
    image: postgres:16
    # no ports published — only accessible within the network
\`\`\`

> **Tip:** Never publish database ports to the host in production. Keep them internal to the Docker network.

## Inspecting Network Traffic

\`\`\`bash
# Check container's network config
docker inspect --format '{{json .NetworkSettings.Networks}}' my-container | jq

# View exposed / published ports
docker port my-container
\`\`\`
`,
        },
      ],
    },
    {
      id: "docker-volumes",
      title: "Volumes & Persistent Data",
      level: "intermediate",
      description: "Persist data beyond the container lifecycle with volumes and bind mounts.",
      lessons: [
        {
          id: "volumes-and-mounts",
          title: "Volumes & Bind Mounts",
          duration: 14,
          type: "lesson",
          description: "Understand how Docker manages data and choose the right storage strategy.",
          objectives: [
            "Differentiate named volumes, anonymous volumes, and bind mounts",
            "Create and manage named volumes",
            "Share data between containers",
            "Back up and restore volume data",
          ],
          content: `# Volumes & Persistent Data

Containers are **ephemeral** — when a container is removed, its filesystem changes are gone. Docker provides three mechanisms to persist data:

| Mechanism | Managed By | Best For |
|-----------|-----------|---------|
| Named Volume | Docker | Databases, persistent app data |
| Bind Mount | Host OS | Development, source code sharing |
| Anonymous Volume | Docker | Temporary scratch space |

## Named Volumes

Named volumes are the preferred way to persist data in production. Docker manages their location on the host.

\`\`\`bash
# Create a volume explicitly
docker volume create my-data

# Use a volume with a container
docker run -d \\
  --name db \\
  -v my-data:/var/lib/postgresql/data \\
  postgres:16

# Volume persists even after the container is removed
docker rm db
docker volume ls       # my-data still exists
docker volume inspect my-data
\`\`\`

## Bind Mounts

Bind mounts map a **host directory** into the container. Perfect for development since code changes are instantly reflected:

\`\`\`bash
# Mount the current directory into /app
docker run -it \\
  -v \$(pwd):/app \\
  -w /app \\
  node:20 \\
  npm run dev

# Changes to files on the host are immediately visible inside the container
\`\`\`

## Compose Volume Declaration

\`\`\`yaml
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data   # named volume

  api:
    build: .
    volumes:
      - ./src:/app/src                    # bind mount for dev
      - /app/node_modules                 # anonymous: prevent host override

volumes:
  pgdata:   # declare named volumes at the top level
\`\`\`

## Backup & Restore

\`\`\`bash
# Backup a volume to a tar file
docker run --rm \\
  -v my-data:/data \\
  -v \$(pwd):/backup \\
  alpine \\
  tar czf /backup/my-data-backup.tar.gz -C /data .

# Restore from backup
docker run --rm \\
  -v my-data:/data \\
  -v \$(pwd):/backup \\
  alpine \\
  tar xzf /backup/my-data-backup.tar.gz -C /data

# Remove unused volumes
docker volume prune
\`\`\`

> **Warning:** \`docker volume prune\` deletes all volumes not attached to a container. Always back up important data first.
`,
        },
      ],
    },
    {
      id: "docker-security",
      title: "Docker Security",
      level: "advanced",
      description: "Harden your Docker deployments with security best practices.",
      lessons: [
        {
          id: "security-best-practices",
          title: "Security Best Practices",
          duration: 16,
          type: "lesson",
          description: "Learn to build and run containers securely.",
          objectives: [
            "Run containers as non-root users",
            "Use minimal base images",
            "Scan images for vulnerabilities",
            "Apply least-privilege capabilities",
          ],
          content: `# Docker Security Best Practices

Containers are not a security boundary by themselves. Use these practices to harden your Docker deployments.

## 1. Run as Non-Root

By default, processes inside containers run as **root** — a security risk if the container is compromised.

\`\`\`dockerfile
FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Create a system user and switch to it
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

\`\`\`bash
# Verify the process runs as non-root
docker exec my-container id
# uid=1001(appuser) gid=1001(appgroup)
\`\`\`

## 2. Use Minimal Base Images

Fewer packages = smaller attack surface:

| Image | Size | Packages |
|-------|------|---------|
| \`ubuntu:24.04\` | ~78 MB | Full OS |
| \`debian:bookworm-slim\` | ~75 MB | Minimal |
| \`alpine:3.19\` | ~7 MB | Musl libc |
| \`gcr.io/distroless/nodejs20\` | ~113 MB | Runtime only |
| \`scratch\` | 0 bytes | Nothing |

For Go and compiled binaries, \`scratch\` or \`distroless\` are ideal:

\`\`\`dockerfile
# Multi-stage: build on full image, ship distroless
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]
\`\`\`

## 3. Scan for Vulnerabilities

\`\`\`bash
# Docker Scout (built into Docker Desktop)
docker scout cves my-image:latest

# Trivy (open-source)
trivy image my-image:latest

# Grype
grype my-image:latest
\`\`\`

## 4. Drop Capabilities

Linux capabilities give fine-grained control over root privileges:

\`\`\`bash
# Drop ALL capabilities, add only what's needed
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx

# Run read-only filesystem
docker run --read-only -v /tmp:/tmp nginx
\`\`\`

## 5. Dockerfile Security Rules

\`\`\`dockerfile
# Pin exact versions — never use :latest in production
FROM node:20.11.0-slim

# Don't copy .env or secrets into the image
# Use .dockerignore
# .dockerignore:
# .env
# .env.*
# secrets/
# *.key

# Avoid storing secrets in ENV or ARG (they appear in image history)
# Use Docker secrets or external secret managers instead

# Verify downloaded binaries with checksums
RUN curl -fsSL https://example.com/tool.tar.gz | sha256sum --check - && \\
    tar xzf tool.tar.gz
\`\`\`

## 6. Docker Bench Security

Run the CIS Docker Benchmark automatically:

\`\`\`bash
docker run --net host --pid host --userns host --cap-add audit_control \\
  -v /etc:/etc:ro -v /usr/bin/containerd:/usr/bin/containerd:ro \\
  -v /var/lib:/var/lib:ro -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  docker/docker-bench-security
\`\`\`
`,
        },
      ],
    },
  ],
};
