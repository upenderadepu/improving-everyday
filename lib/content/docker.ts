import type { Track } from "./types";

export const dockerTrack: Track = {
  id: "docker",
  title: "Docker",
  description: "Master containers from internals to production",
  longDescription:
    "Go from zero to hero with Docker — understanding Linux namespaces, cgroups, overlay filesystems, multi-stage builds, networking, volumes, Docker Compose, and production security hardening.",
  icon: "Container",
  color: "#2496ed",
  gradient: "track-docker-gradient",
  tags: ["containers", "devops", "deployment", "infrastructure"],
  modules: [
    {
      id: "docker-internals",
      title: "How Docker Really Works",
      level: "beginner",
      description: "Deep dive into the Linux primitives that make containers possible.",
      lessons: [
        {
          id: "linux-namespaces-cgroups",
          title: "Linux Namespaces & cgroups",
          duration: 20,
          type: "lesson",
          description: "Understand the kernel features that Docker uses to create container isolation.",
          objectives: [
            "Name the 8 Linux namespaces and what each isolates",
            "Explain how cgroups limit CPU, memory, and I/O",
            "Understand what 'container' really means at the kernel level",
            "Read /proc to inspect a running container's namespaces",
          ],
          content: `# Linux Namespaces & cgroups — Docker's Foundation

## Why This Matters in Real Production

**Docker powers the modern internet.** Netflix runs 100,000+ containers to stream to 230 million subscribers. Spotify uses Docker to deploy their microservices 1,000+ times per day. Google processes 2 billion containers per week across their infrastructure (using Borg, the system that inspired Kubernetes).

Understanding how containers work at the kernel level means you can:
- Debug mysterious container crashes without guessing
- Tune resource limits before they cause production outages
- Explain to your team *why* containers behave the way they do
- Answer deep technical interview questions with confidence

Docker is not magic. It's a well-designed API over two Linux kernel features: **namespaces** (isolation) and **cgroups** (resource limits). Understanding these explains every Docker behavior you've ever found confusing.

## What is a Container?

A container is **a process with restricted visibility and resource limits**. There is no "container" concept in the Linux kernel. There are only:

1. Regular Linux processes (forked via \`clone()\`)
2. Namespace flags that restrict what they can see
3. cgroup rules that restrict what they can use

\`\`\`bash
# This is all docker run does at a fundamental level:
# 1. Download and assemble a layered filesystem
# 2. Fork a new process with namespace flags
# 3. Attach cgroup limits to that process
# 4. exec() the container's entrypoint

# You can create a primitive "container" yourself:
sudo unshare --pid --mount --uts --ipc --net --fork bash
# You're now in a new process tree, mount, hostname, IPC, 
# and network namespace — a manual container!
\`\`\`

## The 8 Linux Namespaces

Each namespace type isolates a different aspect of the OS:

| Namespace | Flag | Isolates |
|-----------|------|----------|
| PID | CLONE_NEWPID | Process IDs |
| Network | CLONE_NEWNET | Network interfaces, routing, iptables |
| Mount | CLONE_NEWNS | Filesystem mount points |
| UTS | CLONE_NEWUTS | Hostname and domain name |
| IPC | CLONE_NEWIPC | System V IPC, POSIX message queues |
| User | CLONE_NEWUSER | UIDs/GIDs (root in container ≠ root on host) |
| Cgroup | CLONE_NEWCGROUP | cgroup root view |
| Time | CLONE_NEWTIME | System clock offsets (Linux 5.6+) |

### PID Namespace

The container's process tree starts fresh at PID 1:

\`\`\`bash
# Inside a container:
ps aux
# PID 1: your app (e.g., nginx)
# PID 2: worker process

# On the host — the same processes have different PIDs:
ps aux | grep nginx
# PID 28431: nginx (what the host kernel actually uses)
\`\`\`

PID 1 is special — it's the init process. If it dies, the container dies. This is why your Docker entrypoint must run as PID 1, not a shell wrapper:

\`\`\`dockerfile
# WRONG — shell is PID 1, your app is PID 2
CMD /app/server

# CORRECT — exec form, app becomes PID 1 directly
CMD ["/app/server"]

# If you need a shell wrapper, use exec:
ENTRYPOINT ["/bin/sh", "-c", "exec /app/server"]
\`\`\`

### Network Namespace

Each container gets a private network stack:

\`\`\`bash
# Container sees:
ip link show
# lo: 127.0.0.1 (loopback)
# eth0: 172.17.0.2 (veth pair connected to docker0 bridge)

# Host sees the other end of the virtual ethernet pair:
ip link show | grep veth
# veth3a7b2c1@if5: peer with the container's eth0
\`\`\`

Docker creates a **veth pair**: one end in the container, one end in the host. Both connect through the \`docker0\` bridge:

\`\`\`
Container (eth0: 172.17.0.2) ←→ veth pair ←→ docker0 bridge (172.17.0.1) ←→ host eth0 → Internet
\`\`\`

### Mount Namespace

Containers have their own filesystem view, built from image layers:

\`\`\`bash
# Check a container's mounts:
docker inspect <container_id> | jq '.[0].Mounts'

# From inside the container:
cat /proc/mounts
# overlay / overlay rw,relatime,lowerdir=/var/lib/docker/overlay2/...
\`\`\`

## cgroups — Resource Control

cgroups (control groups) limit, account for, and isolate resource usage of process groups:

\`\`\`bash
# Docker creates a cgroup for each container:
ls /sys/fs/cgroup/memory/docker/
# <container_id>/
#   memory.limit_in_bytes
#   memory.usage_in_bytes
#   memory.max_usage_in_bytes

# The actual limit file:
cat /sys/fs/cgroup/memory/docker/<id>/memory.limit_in_bytes
# 536870912  (512MB — set by docker run -m 512m)
\`\`\`

### cgroup Subsystems

| Subsystem | Controls |
|-----------|----------|
| cpu | CPU shares, CFS quota |
| memory | Memory limits, swap |
| blkio | Block I/O bandwidth |
| net_cls | Network packet classification |
| pids | Number of processes |
| cpuset | CPU core pinning |

\`\`\`bash
# Run a container with explicit resource limits:
docker run -d \\
  --cpus="1.5" \\          # Max 1.5 CPU cores
  --memory="512m" \\       # 512MB RAM limit
  --memory-swap="1g" \\    # 1GB swap (RAM + swap)
  --pids-limit=100 \\      # Max 100 processes
  --blkio-weight=500 \\    # IO weight (100–1000)
  nginx

# Verify from host:
docker stats --no-stream <container_id>
\`\`\`

## The Overlay2 Filesystem

Docker images use a **union filesystem** — multiple read-only layers stacked, with one writable layer on top:

\`\`\`
Container Layer (writable):    /var/lib/docker/overlay2/<hash>/diff/
Image Layer 3 (FROM ubuntu):   /var/lib/docker/overlay2/<hash>/diff/  ← read-only
Image Layer 2 (RUN apt-get):   /var/lib/docker/overlay2/<hash>/diff/  ← read-only
Image Layer 1 (base):          /var/lib/docker/overlay2/<hash>/diff/  ← read-only
                                        ↓ merged view
                               /var/lib/docker/overlay2/<hash>/merged/
\`\`\`

Key properties:
- **Read layers are shared** across all containers using that image (huge storage savings)
- **Writes use Copy-on-Write (CoW)**: first write to a file copies it to the writable layer
- **Container deletion** destroys only the writable layer; image layers persist

\`\`\`bash
# Inspect image layers:
docker image inspect nginx | jq '.[0].RootFS.Layers'
# Each SHA256 is a layer in overlay2

docker history nginx
# Each line is a layer with its size and command

# Find overlay2 directory:
docker inspect <container_id> | jq '.[0].GraphDriver.Data'
# {
#   "LowerDir": "/var/lib/docker/overlay2/.../diff:...",
#   "MergedDir": "/var/lib/docker/overlay2/.../merged",
#   "UpperDir": "/var/lib/docker/overlay2/.../diff",
#   "WorkDir": "/var/lib/docker/overlay2/.../work"
# }
\`\`\`

## The Docker Daemon Architecture

\`\`\`
Your CLI  →  REST API  →  dockerd  →  containerd  →  runc  →  Linux kernel
                           (daemon)    (container    (OCI     (namespaces
                                        lifecycle)   runtime)  + cgroups)
\`\`\`

- **dockerd**: High-level daemon, handles image builds, networks, volumes, API
- **containerd**: Container lifecycle manager (start/stop/pause), handles snapshots
- **runc**: OCI-compliant runtime that makes the actual \`clone()\` syscall
- **shim**: Per-container process that keeps stdin/stdout open when dockerd restarts

\`\`\`bash
# See all components running:
ps aux | grep -E 'dockerd|containerd|runc'
systemctl status docker containerd
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What Linux kernel features does Docker use, and what does each provide?",
              difficulty: "junior",
              answer: `Docker uses two primary kernel features:

**Namespaces** provide isolation — they restrict what a process can see:
- PID namespace: container processes have their own PID tree starting at 1
- Network namespace: each container has its own network interfaces, routing table, iptables rules
- Mount namespace: containers have their own filesystem view
- UTS namespace: containers can have a different hostname
- IPC, User, Cgroup, Time namespaces provide additional isolation

**cgroups** provide resource limits — they restrict what a process can use:
- cpu: CPU time allocation and throttling
- memory: RAM and swap limits (container gets OOM-killed if it exceeds)
- blkio: disk I/O bandwidth limits
- pids: limits the number of processes to prevent fork bombs

The combination means a container is just a regular Linux process that can only see what its namespaces allow and can only consume what its cgroups permit. There is no special "container" in the kernel — it's a process that happened to be started with namespace flags.`,
            },
            {
              question: "A container keeps getting OOM-killed. Walk me through how you'd diagnose and fix it.",
              difficulty: "mid",
              answer: `**Step 1 — Confirm it's an OOM kill:**
\`\`\`bash
docker inspect <id> | jq '.[0].State'
# Look for: "OOMKilled": true
# Or: ExitCode 137 (128 + SIGKILL signal 9)

# Check system logs:
dmesg | grep -i "oom" | tail -20
journalctl -k | grep -i oom
\`\`\`

**Step 2 — Understand current memory usage:**
\`\`\`bash
docker stats <id>                          # live view
docker stats --no-stream <id>              # snapshot

# Inside the container:
cat /sys/fs/cgroup/memory/memory.usage_in_bytes
cat /sys/fs/cgroup/memory/memory.max_usage_in_bytes  # peak
\`\`\`

**Step 3 — Profile the application:**
- Is it a memory leak? (usage grows over time) → fix the application
- Is it normal workload exceeding the limit? → increase the limit
- Is it a spike (e.g., GC pause, burst traffic)? → adjust limit + add swap

**Step 4 — Fix options:**
\`\`\`bash
# Option A: Raise the memory limit
docker run -m 1g --memory-swap=2g myapp

# Option B: Add swap buffer (soft limit stays, but allows overflow)
docker run -m 512m --memory-swap=1g myapp  # 512MB swap headroom

# Option C: Reserve memory for GC (Java JVM example)
docker run -m 512m -e JAVA_OPTS="-Xmx400m" myapp  # leave headroom

# Option D: Enable memory reservation (soft limit, no hard kill)
docker run --memory-reservation=256m myapp
\`\`\`

**Root cause matters**: don't just raise limits without understanding the leak.`,
            },
            {
              question: "Explain Copy-on-Write in overlay2. What are the performance implications?",
              difficulty: "senior",
              answer: `**How CoW works in overlay2:**

overlay2 mounts image layers as the "LowerDir" (read-only) and creates an empty "UpperDir" (writable) for the container. The kernel merges these into a unified "MergedDir" view.

When a container writes to a file that exists in a lower layer:
1. The kernel checks UpperDir first — file not there
2. Kernel copies the entire file from LowerDir to UpperDir
3. The modification is applied to the copy in UpperDir
4. Future reads/writes go directly to UpperDir

**Performance implications:**

- **First write is expensive**: Copying a large file (e.g., 100MB database file) on first write causes latency spike. This is the CoW penalty.
- **Small writes to large files are disproportionately expensive**: Modifying 1 byte of a 500MB file copies the whole 500MB to UpperDir.
- **Databases in containers suffer the most**: Every write potentially triggers CoW. Always use Docker volumes for databases — volumes bypass overlay2 and write directly to the host filesystem.
- **Read performance**: Pure reads from lower layers are fast — they're served directly from the shared layer cache.

**Best practices:**
\`\`\`bash
# Mount a volume for data that has heavy write patterns:
docker run -v /data/postgres:/var/lib/postgresql/data postgres

# Verify a container is using volumes (not overlay2) for data:
docker inspect <id> | jq '.[0].Mounts'
\`\`\`

**Memory-mapped files**: In overlay2, mmap() on container files can be slow because the CoW copy must complete before the mapping is returned. This is a common source of "why is my app slow in a container" bugs.`,
            },
          ],
        },
        {
          id: "docker-architecture",
          title: "Docker Architecture & Image Layers",
          duration: 18,
          type: "lesson",
          description: "Understand how Docker images, layers, and the daemon work together.",
          objectives: [
            "Explain the Docker client-daemon-containerd-runc pipeline",
            "Understand image layers and how they're stored in overlay2",
            "Read and interpret docker history and docker inspect output",
            "Calculate image size savings from shared layers",
          ],
          content: `# Docker Architecture & Image Layers

## The Client-Server Architecture

Docker uses a client-server model. The CLI you type commands into is separate from the daemon that does the work:

\`\`\`bash
# The Docker CLI talks to the daemon via REST API (Unix socket or TCP):
DOCKER_HOST=tcp://remote-host:2375 docker ps  # remote daemon

# Default socket:
ls -la /var/run/docker.sock
# srw-rw---- 1 root docker /var/run/docker.sock

# You can call the API directly:
curl --unix-socket /var/run/docker.sock http://localhost/containers/json | jq '.[].Names'
\`\`\`

## Image Anatomy

A Docker image is an **ordered list of read-only layers** plus metadata:

\`\`\`bash
# Inspect image layers:
docker pull nginx:alpine
docker image inspect nginx:alpine | jq '.[0].RootFS'
# {
#   "Type": "layers",
#   "Layers": [
#     "sha256:994393dc58e7...",  ← base alpine layer
#     "sha256:b95a99feebf7...",  ← nginx installation layer
#     "sha256:5b10591...",       ← config layer
#   ]
# }

# Human-readable history:
docker history nginx:alpine
# IMAGE          CREATED       CREATED BY                         SIZE
# 3b38aff42da6   2 weeks ago   /bin/sh -c #(nop) CMD ["nginx"…]  0B
# <missing>      2 weeks ago   /bin/sh -c nginx-install.sh        22.1MB
# <missing>      3 weeks ago   /bin/sh -c #(nop) FROM alpine      7.05MB
\`\`\`

## Layer Sharing — The Storage Win

When multiple images share the same base layer, Docker stores it only once:

\`\`\`bash
# Pull two images based on the same alpine:
docker pull python:3.12-alpine
docker pull node:20-alpine

# Check disk usage:
docker system df -v
# Shows: "Shared size" for layers used by multiple images

# The alpine base layer (7MB) is stored ONCE, shared by both images
# Without layer sharing: 7MB × N images = N×7MB
# With layer sharing: 7MB × 1 (no matter how many images)
\`\`\`

\`\`\`
Image A (python:alpine):  [alpine base] [python 3.12] [pip]
Image B (node:alpine):    [alpine base] [node 20] [npm]
                               ↑
                        Shared on disk (stored once)
\`\`\`

## Layer Caching in Builds

The Dockerfile creates a layer per instruction. Docker caches each layer by its instruction + inputs:

\`\`\`dockerfile
FROM node:20-alpine           # Layer 1: cached (stable base)
WORKDIR /app                  # Layer 2: cached (never changes)
COPY package*.json ./         # Layer 3: cached unless package.json changes
RUN npm ci                    # Layer 4: cached unless Layer 3 changed
COPY . .                      # Layer 5: invalidated on ANY source change
RUN npm run build             # Layer 6: invalidated when Layer 5 changes
\`\`\`

**Cache invalidation rule**: Changing any instruction invalidates that layer and ALL subsequent layers.

\`\`\`bash
# See cache hits during build:
docker build --progress=plain -t myapp .
# #4 CACHED  ← cache hit
# #5 0.821s  ← cache miss, actually ran

# Force no cache:
docker build --no-cache -t myapp .
\`\`\`

## The .dockerignore File

\`.dockerignore\` prevents files from being sent to the build context (and thus from invalidating layer 5 above unnecessarily):

\`\`\`dockerignore
# .dockerignore
node_modules/     # Don't copy node_modules (large, rebuilt inside container)
.git/             # Don't copy git history
*.log             # Don't copy log files
.env              # IMPORTANT: don't copy secrets
dist/             # Don't copy build output (rebuilt in container)
**/*.test.js      # Don't copy test files
README.md
.DS_Store
\`\`\`

\`\`\`bash
# Check build context size before building:
du -sh . --exclude=.git
# If it's >50MB, you likely need a better .dockerignore

# See what gets sent to the daemon:
docker build --no-cache . 2>&1 | head -5
# Sending build context to Docker daemon  2.048kB  ← good
# Sending build context to Docker daemon  450.5MB  ← fix .dockerignore
\`\`\`

## Image Size Optimization

Small images = faster pulls, smaller attack surface, cheaper storage:

\`\`\`bash
# Check image size:
docker images --format "{{.Repository}}:{{.Tag}} {{.Size}}"
docker image inspect myapp | jq '.[0].Size'

# Analyze layers to find bloat:
docker history myapp --no-trunc
# Which layer added 200MB? Fix that layer.

# Tools for detailed analysis:
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
  wagoodman/dive myapp:latest
\`\`\`

**Size reduction techniques:**

\`\`\`dockerfile
# 1. Use Alpine or distroless base images
FROM node:20-alpine    # 180MB vs node:20 at 1.1GB

# 2. Combine RUN commands to reduce layers:
# BAD — 3 layers, intermediate files stick around:
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# GOOD — 1 layer, cleanup in same layer:
RUN apt-get update && \\
    apt-get install -y --no-install-recommends curl && \\
    rm -rf /var/lib/apt/lists/*

# 3. Multi-stage builds (covered in next lesson)
# 4. Don't install dev dependencies in production image
\`\`\`
`,
          interviewQuestions: [
            {
              question: "How does Docker's layer caching work, and how would you optimize a Dockerfile for cache efficiency?",
              difficulty: "junior",
              answer: `Docker caches each build step (layer) based on the instruction text and the files it depends on. If nothing changed, it reuses the cached layer. The moment any layer's cache is invalidated, all subsequent layers must rebuild too.

**Optimization strategy — order by change frequency:**
\`\`\`dockerfile
# Stable things FIRST (rarely change → rarely rebuild)
FROM node:20-alpine
WORKDIR /app

# Dependencies BEFORE source code
# package.json changes rarely; source code changes constantly
COPY package*.json ./
RUN npm ci --only=production  # cached until package.json changes

# Source code LAST (changes most often)
COPY . .
RUN npm run build
\`\`\`

**Common mistakes:**
- Copying everything with \`COPY . .\` before installing deps → every code change rebuilds node_modules
- Not using .dockerignore → irrelevant files (logs, .git) invalidate cache
- Having \`RUN apt-get update\` without installing in the same \`RUN\` → stale package lists

**For compiled languages (Go, Java, Rust):**
\`\`\`dockerfile
# Copy dependency manifests first
COPY go.mod go.sum ./
RUN go mod download  # cached

COPY . .
RUN go build -o /app .
\`\`\`

This pattern means developer iteration (changing source, rebuilding) takes seconds instead of minutes.`,
            },
            {
              question: "Explain how Docker layer sharing saves storage. When does it break down?",
              difficulty: "mid",
              answer: `**How it works:**
Docker stores each layer as a directory in \`/var/lib/docker/overlay2/\`. Layers are content-addressed by SHA256 of their content. When two images share a layer (same SHA256), Docker stores only one copy on disk but presents it in both image filesystems.

\`\`\`bash
# 10 containers running nginx share the same layers:
docker run -d nginx  # pulls layers once
docker run -d nginx  # instant — layers already present
# Storage: 1× image size, not 10×
\`\`\`

**Sharing at the container level:**
- All containers from the same image share ALL image layers (read-only)
- Each container gets its own thin writable layer on top
- So 100 nginx containers ≈ 100 tiny writable layers + 1 shared image

**When sharing breaks down:**

1. **Different base images**: \`ubuntu:22.04\` and \`debian:12\` share nothing despite being similar
2. **Version pinning drift**: \`node:20.1\` and \`node:20.2\` share early layers but diverge at the node install layer — you get duplicate middle layers
3. **Large COPY layers**: If your source code copy layer is 500MB and you have 20 services, each has its own 500MB source layer — no sharing
4. **Build args that change frequently**: \`ARG BUILD_DATE\` in a layer invalidates everything below, defeating caching and producing unique (unshared) layers

**Best practice**: Use consistent, pinned base images across your org's services. \`FROM node:20.9-alpine3.18\` across 20 repos means the alpine and node layers are shared.`,
            },
          ],
        },
      ],
    },
    {
      id: "dockerfile-mastery",
      title: "Dockerfile Mastery",
      level: "intermediate",
      description: "Write production-grade Dockerfiles with multi-stage builds.",
      lessons: [
        {
          id: "writing-dockerfiles",
          title: "Writing Production Dockerfiles",
          duration: 22,
          type: "lesson",
          description: "Master Dockerfile instructions and build secure, optimized images.",
          objectives: [
            "Use all major Dockerfile instructions correctly (FROM, RUN, COPY, ADD, ENV, ARG, ENTRYPOINT, CMD)",
            "Understand the difference between ENTRYPOINT and CMD",
            "Apply non-root user security hardening",
            "Handle build arguments and environment variables correctly",
          ],
          content: `# Writing Production Dockerfiles

## Dockerfile Instruction Reference

### FROM — Base Image Selection

\`\`\`dockerfile
# Pin to specific digest for reproducibility (production):
FROM node:20.9.0-alpine3.18@sha256:c0a3badbd8a0a760de903e00cedbca94588f261b0e21d4d92c4f91a6e3f07c03

# Use ARG for flexible builds:
ARG NODE_VERSION=20
FROM node:\${NODE_VERSION}-alpine

# Multi-stage (builds have multiple FROM):
FROM golang:1.21 AS builder
FROM gcr.io/distroless/static AS runtime
\`\`\`

### COPY vs ADD

\`\`\`dockerfile
# COPY — explicit, predictable, preferred for files:
COPY src/ /app/src/
COPY --chown=node:node package.json /app/

# ADD — has extra powers (use sparingly):
# 1. Auto-extracts tar archives:
ADD app.tar.gz /app/        # extracts automatically

# 2. Fetches URLs (DON'T USE — wget/curl is more explicit):
ADD http://example.com/file /app/  # bad practice

# Rule: Use COPY unless you specifically need ADD's tar extraction
\`\`\`

### ENTRYPOINT vs CMD

This is a source of endless confusion. Here's the definitive explanation:

\`\`\`
ENTRYPOINT: The executable to run (rarely overridden)
CMD:        Default arguments (easily overridden at runtime)
\`\`\`

\`\`\`dockerfile
# Exec form (PREFERRED — no shell, signals work correctly):
ENTRYPOINT ["/app/server"]
CMD ["--port=8080", "--log-level=info"]

# Shell form (AVOID — shell becomes PID 1, wraps your app):
ENTRYPOINT /app/server        # sh -c "/app/server" — signals don't reach app!
\`\`\`

\`\`\`bash
# docker run overrides CMD, not ENTRYPOINT:
docker run myapp --port=9090           # replaces CMD, keeps ENTRYPOINT
docker run --entrypoint /bin/sh myapp  # replaces ENTRYPOINT

# Common pattern: use ENTRYPOINT for the binary, CMD for defaults:
ENTRYPOINT ["nginx", "-g", "daemon off;"]
# Override at runtime:
docker run nginx-image -c /custom/nginx.conf  # replaces CMD
\`\`\`

### ENV vs ARG

\`\`\`dockerfile
# ARG: Build-time only, not in final image, not in running container
ARG BUILD_VERSION
ARG GITHUB_TOKEN  # safe — doesn't persist in image

# ENV: Persists in final image, available at runtime
ENV NODE_ENV=production
ENV PORT=8080

# WARNING: ENV values persist in image history!
ENV API_KEY=secret123  # NEVER do this — visible in docker history

# Correct pattern for secrets: pass at runtime, not build time
# docker run -e API_KEY=secret myapp
\`\`\`

\`\`\`bash
# Verify ARGs don't leak into image:
docker history myapp | grep -i token  # should show nothing
docker inspect myapp | jq '.[0].Config.Env'  # only ENV vars appear here
\`\`\`

### RUN — Best Practices

\`\`\`dockerfile
# Install dependencies efficiently:
RUN apt-get update && \\
    apt-get install -y --no-install-recommends \\
        curl \\
        ca-certificates && \\
    rm -rf /var/lib/apt/lists/*
    # ↑ CRITICAL: clean package lists in SAME RUN layer
    #   Separate RUN rm creates a new layer but doesn't reduce image size!

# For Alpine:
RUN apk add --no-cache curl ca-certificates

# Install and verify checksums for downloaded binaries:
RUN curl -fsSL https://example.com/binary -o /usr/local/bin/tool && \\
    echo "abc123  /usr/local/bin/tool" | sha256sum -c && \\
    chmod +x /usr/local/bin/tool
\`\`\`

## Security Hardening

### Non-Root User

By default, containers run as root (UID 0). This is dangerous — if the container escapes, root in the container can become root on the host (especially without user namespaces).

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --only=production

# Switch to non-root user (node user exists in node:alpine)
USER node

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

\`\`\`bash
# Verify:
docker run --rm myapp whoami  # should print 'node', not 'root'

# Check effective UID:
docker run --rm myapp id
# uid=1000(node) gid=1000(node) groups=1000(node)
\`\`\`

### Read-Only Filesystem

\`\`\`bash
# Run with read-only root filesystem:
docker run --read-only \\
  --tmpfs /tmp \\               # writable tmpfs for /tmp
  --tmpfs /var/run \\           # writable for pid files
  myapp

# If the app tries to write outside /tmp or /var/run, it fails:
# Read-only file system error → forces you to be explicit about write paths
\`\`\`

### Drop Capabilities

Linux capabilities split root privileges. Containers don't need most of them:

\`\`\`bash
# Drop ALL capabilities, add back only what's needed:
docker run --cap-drop=ALL \\
  --cap-add=NET_BIND_SERVICE \\  # Allow binding ports < 1024
  --security-opt no-new-privileges \\  # Prevent privilege escalation
  myapp

# Check what capabilities a container has:
docker run --rm myapp cat /proc/self/status | grep Cap
capsh --decode=0000000000000400  # Decode the hex capability set
\`\`\`

## A Complete Production Dockerfile (Node.js)

\`\`\`dockerfile
# syntax=docker/dockerfile:1.6

# ── Build Stage ─────────────────────────────────────────────
FROM node:20.9.0-alpine3.18 AS deps
WORKDIR /app
# Copy dependency files first (cache efficiency)
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20.9.0-alpine3.18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime Stage ────────────────────────────────────────────
FROM node:20.9.0-alpine3.18 AS runtime

# Metadata
LABEL org.opencontainers.image.source="https://github.com/org/repo"
LABEL org.opencontainers.image.version="1.0.0"

# Security hardening
RUN apk add --no-cache dumb-init && \\
    addgroup -g 1001 -S appgroup && \\
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy only production artifacts
COPY --chown=appuser:appgroup --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:appgroup --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000

# dumb-init handles signals properly and reaps zombie processes
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What's the difference between ENTRYPOINT and CMD? When would you use each?",
              difficulty: "junior",
              answer: `**ENTRYPOINT**: Defines the executable to run. Hard to override (requires \`--entrypoint\` flag).
**CMD**: Provides default arguments. Easily overridden by appending to \`docker run\`.

**Shell vs Exec form:**
- Shell form: \`CMD /app/server\` → runs as \`sh -c "/app/server"\`. The shell becomes PID 1, not your app. Signals (SIGTERM for graceful shutdown) don't reach your app.
- Exec form: \`CMD ["/app/server"]\` → your app is PID 1 directly. Signals work. **Always use exec form.**

**Common patterns:**
\`\`\`dockerfile
# Pattern 1: Binary with overridable defaults
ENTRYPOINT ["/app/server"]
CMD ["--port=8080"]
# Override: docker run myapp --port=9090

# Pattern 2: Shell scripts as entrypoint
COPY entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
# entrypoint.sh does setup, then: exec "$@"

# Pattern 3: Wrapper with dumb-init for signal handling
ENTRYPOINT ["dumb-init", "--", "/app/server"]
\`\`\`

**Signal handling test:**
\`\`\`bash
docker run myapp &
docker stop myapp  # sends SIGTERM — does your app shut down gracefully?
# If it waits 10 seconds then SIGKILL → your app is not receiving signals
# Fix: use exec form or dumb-init
\`\`\``,
            },
            {
              question: "A developer committed a Docker image with an API key in an ENV instruction. How do you remediate this?",
              difficulty: "mid",
              answer: `**The problem:** \`ENV API_KEY=secret\` persists in every layer of the image AND in the image history. Even if you add a subsequent \`RUN unset API_KEY\`, the value is still visible in \`docker history\` because it was set in a prior layer.

**Immediate containment:**
\`\`\`bash
# 1. Revoke the exposed secret immediately (rotate the key)
# 2. Remove the image from all registries:
docker rmi myapp:latest
# If pushed to a registry:
docker trust revoke myapp:latest  # if signed
# Delete via registry API or UI

# 3. Scan all images derived from this one
\`\`\`

**Verify the exposure:**
\`\`\`bash
docker history myapp:latest | grep API_KEY
docker inspect myapp:latest | jq '.[0].Config.Env'
# Both will show the key in plain text
\`\`\`

**Correct pattern going forward:**
\`\`\`dockerfile
# NEVER: ENV API_KEY=secret

# CORRECT: Pass secrets at runtime, not build time
# docker run -e API_KEY=secret myapp

# For build-time secrets (e.g., pulling private packages):
# Use BuildKit secret mounts (never persisted in layer):
RUN --mount=type=secret,id=github_token \\
    GITHUB_TOKEN=$(cat /run/secrets/github_token) npm install

# Build with:
docker build --secret id=github_token,env=GITHUB_TOKEN .
\`\`\`

**Process fix:** Add secret scanning to CI/CD (tools: Trivy, gitleaks, docker scout) to catch this before push.`,
            },
            {
              question: "How do you handle secrets that a container needs at runtime in a Kubernetes/production environment?",
              difficulty: "senior",
              answer: `**The options, from worst to best:**

**1. ENV in Dockerfile** — Never. Baked into image layers, visible to everyone who can pull.

**2. Environment variables at runtime** — OK for non-sensitive config. Secrets visible in \`docker inspect\`, \`/proc/1/environ\`, logs.
\`\`\`bash
docker run -e DB_PASSWORD=secret myapp  # leaks in ps, docker inspect
\`\`\`

**3. Docker secrets (Swarm)** — Mounted as tmpfs files:
\`\`\`bash
echo "password" | docker secret create db_password -
docker service create --secret db_password myapp
# In container: /run/secrets/db_password
\`\`\`

**4. Kubernetes Secrets** — Mounted as files or env vars, stored in etcd (encrypt at rest!):
\`\`\`yaml
# As volume mount (preferred — not in env, not in /proc):
volumes:
  - name: db-creds
    secret:
      secretName: db-credentials
containers:
  - volumeMounts:
    - name: db-creds
      mountPath: /run/secrets
      readOnly: true
\`\`\`

**5. External secret managers (best practice for production):**
- AWS Secrets Manager / Parameter Store
- HashiCorp Vault
- GCP Secret Manager

Pattern: Container identity (IAM role, Vault AppRole) fetches secrets at startup. No secrets in images, environment, or Kubernetes manifests.

**In practice:** Use an init container or sidecar (e.g., Vault Agent) to fetch secrets and write them to a shared in-memory volume. The main container reads them as files — never as env vars.`,
            },
          ],
        },
        {
          id: "multi-stage-builds",
          title: "Multi-Stage Builds",
          duration: 20,
          type: "lesson",
          description: "Build tiny production images by separating build and runtime environments.",
          objectives: [
            "Understand why multi-stage builds reduce image size by 10–50x",
            "Write multi-stage Dockerfiles for compiled languages",
            "Use distroless and scratch base images",
            "Implement BuildKit cache mounts for faster builds",
          ],
          content: `# Multi-Stage Builds

Multi-stage builds solve the build vs. runtime problem: you need a full compiler toolchain to build your app, but the final image only needs the compiled binary.

## The Problem Without Multi-Stage

\`\`\`dockerfile
# Single-stage Go build — includes the entire Go compiler in the image!
FROM golang:1.21
WORKDIR /app
COPY . .
RUN go build -o /server .
CMD ["/server"]
\`\`\`

\`\`\`bash
docker images myapp
# myapp   latest   1.18GB   ← includes entire Go toolchain!
\`\`\`

## Multi-Stage Solution

\`\`\`dockerfile
# Stage 1: Builder (has full Go toolchain)
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /server .
#   ↑ static binary (no CGO), stripped debug symbols (-s), optimized (-w)

# Stage 2: Runtime (minimal, no Go toolchain)
FROM scratch AS runtime
#   ↑ scratch = empty image, literally nothing

# Copy only what we need:
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /server /server

EXPOSE 8080
ENTRYPOINT ["/server"]
\`\`\`

\`\`\`bash
docker images myapp
# myapp   latest   8.3MB   ← from 1.18GB to 8.3MB (142x smaller!)
\`\`\`

## Distroless Images

**scratch** is completely empty — no shell, no package manager, but also no CA certs, no user setup. **Distroless** images add just enough:

\`\`\`dockerfile
# Google's distroless — includes CA certs, timezone data, /etc/passwd
FROM gcr.io/distroless/static-debian12 AS runtime
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
# Size: ~2MB for static binary + distroless base
\`\`\`

\`\`\`bash
# Distroless has no shell — debugging requires the :debug tag:
FROM gcr.io/distroless/static-debian12:debug AS runtime
# Adds busybox shell for troubleshooting:
docker run --entrypoint /busybox/sh myapp
\`\`\`

## Multi-Stage for Different Languages

### Node.js

\`\`\`dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # TypeScript compilation, bundling, etc.

FROM node:20-alpine AS runtime
WORKDIR /app
# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy built output from builder stage
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
\`\`\`

### Java / JVM

\`\`\`dockerfile
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
# Cache dependencies (copy pom.xml first)
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/target/app.jar .
# JVM tuning for containers:
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "app.jar"]
\`\`\`

### Python

\`\`\`dockerfile
FROM python:3.12-alpine AS builder
WORKDIR /app
RUN pip install --user --no-cache-dir -r requirements.txt
# --user installs to /root/.local, which we copy to runtime stage

FROM python:3.12-alpine AS runtime
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY app/ ./app/
ENV PATH=/root/.local/bin:\$PATH
CMD ["python", "-m", "app"]
\`\`\`

## BuildKit Cache Mounts

BuildKit adds \`--mount=type=cache\` to speed up builds by persisting package caches between builds:

\`\`\`dockerfile
# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Cache mount persists between builds — npm doesn't re-download packages:
RUN --mount=type=cache,target=/root/.npm \\
    npm ci
COPY . .
RUN --mount=type=cache,target=/root/.npm \\
    npm run build

FROM golang:1.21 AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
# Go module cache persists between builds:
RUN --mount=type=cache,target=/go/pkg/mod \\
    go mod download
COPY . .
# Build cache also persists:
RUN --mount=type=cache,target=/root/.cache/go-build \\
    --mount=type=cache,target=/go/pkg/mod \\
    go build -o /server .
\`\`\`

\`\`\`bash
# Enable BuildKit (default in Docker 23+):
DOCKER_BUILDKIT=1 docker build .
# Or in docker-compose:
COMPOSE_DOCKER_CLI_BUILD=1 docker-compose build

# Build with explicit platform (for cross-compilation):
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest --push .
\`\`\`

## Selecting Specific Stages

\`\`\`bash
# Build only the builder stage (for CI testing):
docker build --target builder -t myapp:builder .

# Build the final stage (default):
docker build -t myapp:latest .

# Run tests in the builder stage without building the full runtime:
docker build --target builder -t myapp:test . && \\
  docker run myapp:test npm test
\`\`\`
`,
          interviewQuestions: [
            {
              question: "How do multi-stage builds work and what size reduction can you expect?",
              difficulty: "junior",
              answer: `Multi-stage builds use multiple \`FROM\` instructions in one Dockerfile. Each stage is independent; you can \`COPY --from=<stage>\` to bring files from one stage to another. Only the final stage ends up in the shipped image.

**Typical size reductions:**
- Go binary: 1.18GB (with toolchain) → 8–20MB (binary only in scratch/distroless) = **60–140x smaller**
- Node.js: 1.1GB (full node + devDependencies + source) → 150–200MB (alpine + production deps only) = **5–7x smaller**
- Java: 600MB (JDK + Maven + sources) → 150–200MB (JRE + fat jar) = **3–4x smaller**

**Why it matters in production:**
- Faster image pulls (especially on auto-scaling: 8MB pulls in seconds, 1GB takes minutes)
- Smaller attack surface (no compiler, no package manager in runtime image)
- Less storage cost in registries

**The pattern:**
\`\`\`dockerfile
FROM golang:1.21 AS builder   # has compiler
RUN go build -o /app .

FROM scratch AS runtime       # empty — no compiler
COPY --from=builder /app /app # only the binary
\`\`\``,
            },
            {
              question: "You have a Go service that takes 4 minutes to build in CI. How do you optimize it?",
              difficulty: "mid",
              answer: `**Root cause first:** Where is the time going?
\`\`\`bash
docker build --progress=plain . 2>&1 | grep "^#"
# Identify which steps take longest
\`\`\`

**Optimization strategy:**

**1. Layer caching — copy go.mod first:**
\`\`\`dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./          # copy only manifests
RUN go mod download             # cached until go.mod changes
COPY . .                        # source code
RUN go build -o /server .
\`\`\`
This means \`go mod download\` only re-runs when dependencies change.

**2. BuildKit cache mounts (persist Go caches between builds):**
\`\`\`dockerfile
RUN --mount=type=cache,target=/go/pkg/mod \\
    --mount=type=cache,target=/root/.cache/go-build \\
    go build -o /server .
\`\`\`
On cache hit: **4 min → 20 seconds**.

**3. Use a registry cache:**
\`\`\`bash
docker buildx build \\
  --cache-from type=registry,ref=myregistry/myapp:cache \\
  --cache-to type=registry,ref=myregistry/myapp:cache,mode=max \\
  -t myregistry/myapp:latest .
\`\`\`
CI workers (ephemeral) pull the layer cache from the registry instead of rebuilding.

**4. Parallelism with buildx:**
For multi-platform builds, \`buildx\` builds amd64 and arm64 in parallel.

**Expected result:** 4 minutes → 20–30 seconds on cache hit, maybe 60 seconds on full rebuild (parallelism + cache mounts).`,
            },
          ],
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
          id: "compose-deep-dive",
          title: "Docker Compose Deep Dive",
          duration: 22,
          type: "lesson",
          description: "Master Docker Compose for local development and simple deployments.",
          objectives: [
            "Write production-quality docker-compose.yml files",
            "Use health checks to manage startup dependencies",
            "Implement environment-specific overrides",
            "Understand Compose networking and DNS",
          ],
          content: `# Docker Compose Deep Dive

Docker Compose is a tool for defining and running multi-container applications. A single YAML file describes the entire application stack.

## Core Concepts

\`\`\`yaml
# docker-compose.yml
version: "3.9"  # use 3.8+ for full feature support

services:
  web:              # service name = DNS hostname within compose network
    image: nginx:alpine
    ports:
      - "80:80"     # host:container
    depends_on:
      api:
        condition: service_healthy  # wait for health check, not just start

  api:
    build:
      context: .           # build context
      dockerfile: Dockerfile
      target: runtime      # use specific multi-stage target
      args:
        NODE_ENV: production
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s  # wait before first check (app startup time)
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password  # secret file
    volumes:
      - postgres_data:/var/lib/postgresql/data  # named volume (persisted)
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro  # init script
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 5s
      timeout: 3s
      retries: 5
    secrets:
      - db_password

volumes:
  postgres_data:      # managed by Docker, persists across down/up

secrets:
  db_password:
    file: ./secrets/db_password.txt
\`\`\`

## Networking in Compose

All services in a Compose file share a network and can reach each other by **service name**:

\`\`\`bash
# Service 'api' can reach 'db' at hostname 'db', port 5432:
postgresql://db:5432/app

# Compose creates a network: <project>_default
docker network ls
# <project>_default   bridge
\`\`\`

\`\`\`yaml
# Custom network configuration:
services:
  frontend:
    networks:
      - public
      - internal

  api:
    networks:
      - internal

  db:
    networks:
      - internal

networks:
  public:       # frontend ↔ external
    driver: bridge
  internal:     # backend services only
    driver: bridge
    internal: true  # no external access to this network
\`\`\`

## Environment Management

\`\`\`bash
# .env file (automatically loaded by Compose):
DB_PASSWORD=secret123
NODE_ENV=production
API_PORT=3000
\`\`\`

\`\`\`yaml
services:
  api:
    environment:
      - NODE_ENV=\${NODE_ENV}        # from .env file
      - DB_PASSWORD=\${DB_PASSWORD}  # from .env file
    env_file:
      - .env.production  # load entire file
\`\`\`

## Override Files — Environment Stacking

\`\`\`yaml
# docker-compose.yml (base, used always):
services:
  api:
    image: myapp:latest
    environment:
      - NODE_ENV=production

# docker-compose.override.yml (automatically merged for local dev):
services:
  api:
    build: .           # build instead of pull
    volumes:
      - .:/app         # live code reload
    environment:
      - NODE_ENV=development
    ports:
      - "9229:9229"    # Node.js debugger port

# docker-compose.test.yml (for CI):
services:
  api:
    environment:
      - NODE_ENV=test
\`\`\`

\`\`\`bash
# Local dev (uses docker-compose.yml + docker-compose.override.yml automatically):
docker compose up

# CI (explicit override):
docker compose -f docker-compose.yml -f docker-compose.test.yml up

# Production (no override, use .env.production):
docker compose --env-file .env.production up
\`\`\`

## Resource Limits in Compose

\`\`\`yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "1.0"       # max 1 CPU core
          memory: 512M      # max 512MB RAM
        reservations:
          cpus: "0.25"      # guaranteed 0.25 cores
          memory: 256M      # guaranteed 256MB
    # Note: deploy.resources works with docker compose (v2) and Swarm
\`\`\`

## Common Compose Commands

\`\`\`bash
# Start everything (detached):
docker compose up -d

# Start and force rebuild:
docker compose up -d --build

# Scale a service:
docker compose up -d --scale api=3

# Tail logs:
docker compose logs -f api

# Run a one-off command in a service:
docker compose run --rm api npm run migrate
docker compose run --rm api sh  # get a shell

# Stop everything (keep volumes):
docker compose down

# Stop and remove volumes (DESTRUCTIVE):
docker compose down -v

# Show resource usage:
docker compose stats

# Check health status:
docker compose ps
# NAME        STATUS          PORTS
# app-api-1   Up (healthy)   0.0.0.0:3000->3000/tcp
# app-db-1    Up (healthy)   5432/tcp
\`\`\`
`,
          interviewQuestions: [
            {
              question: "How do you handle startup ordering in Docker Compose? What's the limitation of depends_on?",
              difficulty: "junior",
              answer: `**The problem:** Even with \`depends_on\`, Compose only waits for the container to start, not for the service inside it to be ready. A Postgres container starts in milliseconds but needs 10+ seconds before accepting connections.

**Basic depends_on (insufficient):**
\`\`\`yaml
services:
  api:
    depends_on:
      - db  # waits for container start, NOT for postgres to be ready
\`\`\`

**Correct approach — health checks + condition:**
\`\`\`yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER}"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s

  api:
    depends_on:
      db:
        condition: service_healthy  # waits for health check to pass
\`\`\`

**Alternative — application-level retry:**
Even with health checks, network partitions can happen. Production-grade apps should retry connections with exponential backoff:
\`\`\`javascript
// Don't rely on Docker for this — make your app resilient:
async function connectWithRetry(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try { return await connect(); }
    catch (e) { await sleep(delay * Math.pow(2, i)); }
  }
}
\`\`\`

**Limitation of depends_on:** It only handles startup order within a single Compose file. For complex orchestration across multiple services, use Kubernetes readiness probes instead.`,
            },
            {
              question: "A developer is running docker compose up but changes to source code don't reflect in the running container. How do you debug this?",
              difficulty: "mid",
              answer: `**Diagnosis checklist:**

**1. Is a bind mount configured?**
\`\`\`yaml
# Required for live code sync:
volumes:
  - .:/app:ro  # bind mount source code
\`\`\`
\`\`\`bash
docker compose ps -a  # confirm service is running
docker inspect <container> | jq '.[0].Mounts'  # check mounts
\`\`\`

**2. Is a named volume shadowing the bind mount?**
\`\`\`yaml
# BUG: named volume for node_modules shadows app directory:
volumes:
  - .:/app              # bind mount
  - node_modules:/app/node_modules  # ← this is correct
# Verify: docker compose run api ls /app  # should see source files
\`\`\`

**3. Is the app watching for file changes?**
The container sees the file — but does the app reload? Check if the app uses hot reload:
\`\`\`yaml
# Node.js example — use nodemon for dev:
command: npm run dev  # should use nodemon/ts-node-dev
\`\`\`

**4. File system events on macOS/Windows:**
On Mac (VirtioFS/gRPC-FUSE), file events can be slow or miss changes. Fix:
\`\`\`yaml
volumes:
  - type: bind
    source: .
    target: /app
    consistency: cached  # better performance on Mac
\`\`\`
Or use polling in the app: \`nodemon --legacy-watch\`

**5. Image vs. build cache:**
\`\`\`bash
# Force rebuild to rule out stale image:
docker compose up --build --force-recreate
\`\`\`

**Definitive test:**
\`\`\`bash
# Make a change, then check the container filesystem directly:
docker compose exec api cat /app/src/changed-file.js
# If it shows the new content → bind mount works, app isn't watching
# If it shows old content → bind mount isn't working
\`\`\``,
            },
          ],
        },
      ],
    },
    {
      id: "docker-networking-volumes",
      title: "Networking & Volumes",
      level: "intermediate",
      description: "Master Docker networking modes and persistent storage strategies.",
      lessons: [
        {
          id: "networking-deep-dive",
          title: "Docker Networking Deep Dive",
          duration: 20,
          type: "lesson",
          description: "Understand Docker network drivers, container DNS, and network isolation.",
          objectives: [
            "Explain Docker's bridge, host, overlay, and none network drivers",
            "Configure custom bridge networks for service isolation",
            "Understand how Docker implements container DNS resolution",
            "Debug network connectivity between containers",
          ],
          content: `# Docker Networking Deep Dive

## Network Drivers

Docker ships with several network drivers for different use cases:

### Bridge Network (default)

The default driver. Docker creates a virtual bridge (docker0) on the host:

\`\`\`bash
# Default bridge — all containers without --network can communicate:
docker run -d --name redis redis:alpine
docker run -d --name api myapi
# api can reach redis at its IP, but not by name (no DNS on default bridge)

# Custom bridge — containers can reach each other by name:
docker network create myapp-net
docker run -d --name redis --network myapp-net redis:alpine
docker run -d --name api --network myapp-net myapi
# Now api can reach redis at hostname 'redis' — Docker provides DNS

# Inspect the network:
docker network inspect myapp-net
docker exec api ping redis  # works with custom bridge, not default
\`\`\`

### Host Network

Container shares the host's network namespace — no isolation, but maximum performance:

\`\`\`bash
docker run -d --network host nginx
# nginx now binds to port 80 on the host's actual interface
# No port mapping needed (and --publish/-p is ignored)
# Use case: high-performance networking, monitoring tools
\`\`\`

### None Network

No network at all — complete isolation:

\`\`\`bash
docker run --network none alpine sh
# No internet, no container-to-container: good for batch processing jobs
\`\`\`

### Overlay Network (Swarm/cross-host)

Spans multiple Docker hosts:

\`\`\`bash
# Create overlay (requires Swarm mode):
docker swarm init
docker network create -d overlay myapp-overlay
# Containers on different hosts can communicate over encrypted VXLAN tunnel
\`\`\`

## Container DNS Resolution

Docker runs an embedded DNS server at 127.0.0.11 in every container:

\`\`\`bash
# Inspect DNS inside a container:
docker exec mycontainer cat /etc/resolv.conf
# nameserver 127.0.0.11   ← Docker's embedded DNS
# options ndots:0

# Test DNS resolution:
docker exec api nslookup db
# Server:  127.0.0.11
# Address: 127.0.0.11:53
# Name: db
# Address: 172.18.0.3  ← container's IP

# DNS aliases:
docker run -d --network myapp-net --network-alias=database postgres
docker run -d --network myapp-net --network-alias=database postgres  # second replica
# 'database' now resolves to both IPs — round-robin DNS load balancing
\`\`\`

## Port Mapping Internals

\`\`\`bash
docker run -p 8080:80 nginx
# Creates iptables rules:
# DOCKER chain: -d 0.0.0.0/0 -p tcp --dport 8080 -j DNAT --to 172.17.0.2:80

# View the iptables rules Docker manages:
iptables -t nat -L DOCKER --line-numbers
\`\`\`

## Network Debugging

\`\`\`bash
# Can container A reach container B?
docker exec containerA ping containerB                    # basic
docker exec containerA curl http://containerB:8080/health # HTTP
docker exec containerA nc -zv containerB 5432             # port check

# What network is a container on?
docker inspect containerA | jq '.[0].NetworkSettings.Networks'

# List all networks:
docker network ls

# Which containers are on a network?
docker network inspect myapp-net | jq '.[0].Containers'

# Use busybox/net-tools for debugging:
docker run --rm --network myapp-net nicolaka/netshoot
# netshoot has curl, dig, tcpdump, iperf, nmap, etc.

# Capture traffic between containers:
docker run --rm -it --network container:mycontainer \\
  nicolaka/netshoot tcpdump -i eth0 port 5432
\`\`\`
`,
          interviewQuestions: [
            {
              question: "Why can containers on the default bridge network not communicate by hostname, but containers on a custom bridge can?",
              difficulty: "mid",
              answer: `Docker's embedded DNS server (127.0.0.11) only resolves container names when they're on a **user-defined** (custom) bridge network.

On the **default bridge** (docker0):
- Created automatically, no embedded DNS for container names
- Containers can only reach each other by IP address
- IPs are dynamic and change on restart — making this approach fragile
- The only "name resolution" is via deprecated --link flag

On a **custom bridge** network:
- Docker registers each container's name and any aliases with the embedded DNS
- Containers resolve each other by service name
- Also supports network aliases for multiple containers sharing one hostname (primitive load balancing)

\`\`\`bash
# Default bridge — no hostname resolution:
docker run -d --name redis redis:alpine
docker run --rm alpine ping redis  # fails: ping: bad address 'redis'

# Custom bridge — hostname resolution works:
docker network create mynet
docker run -d --name redis --network mynet redis:alpine
docker run --rm --network mynet alpine ping redis  # works!
\`\`\`

**Why Docker Compose always works:** Compose always creates a custom network per project, so all services can resolve each other by service name. This is why \`postgresql://db:5432/app\` works in Compose files.`,
            },
          ],
        },
        {
          id: "volumes-and-storage",
          title: "Volumes & Persistent Storage",
          duration: 18,
          type: "lesson",
          description: "Manage stateful data with Docker volumes, bind mounts, and tmpfs.",
          objectives: [
            "Choose between volumes, bind mounts, and tmpfs for different use cases",
            "Backup, restore, and migrate Docker volumes",
            "Configure volumes for database containers",
            "Understand volume drivers for cloud storage",
          ],
          content: `# Volumes & Persistent Storage

## Three Types of Mounts

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                     Host Filesystem                       │
│  /var/lib/docker/volumes/  │  /home/user/app/  │  /dev/  │
│         (volumes)          │  (bind mounts)    │  (tmpfs) │
└────────────┬───────────────┴────────┬──────────┴────┬────┘
             │                        │               │
             ▼                        ▼               ▼
         Named Volume           Bind Mount          tmpfs
         (Docker managed)       (Host path)     (Memory only)
\`\`\`

| | Named Volume | Bind Mount | tmpfs |
|--|--|--|--|
| Host location | /var/lib/docker/volumes/ | Any path | Memory |
| Portability | High | Low (path-dependent) | n/a |
| Performance | Good | Varies (best on Linux) | Fastest |
| Persistence | Yes | Yes | No (lost on stop) |
| Use case | Production data | Dev hot-reload | Secrets, temp |

## Named Volumes

\`\`\`bash
# Create a named volume:
docker volume create postgres_data

# Use in docker run:
docker run -d \\
  -v postgres_data:/var/lib/postgresql/data \\
  postgres:16

# Inspect:
docker volume inspect postgres_data
# {
#   "Mountpoint": "/var/lib/docker/volumes/postgres_data/_data",
#   "Driver": "local"
# }

# List volumes:
docker volume ls

# Remove (DESTRUCTIVE — all data lost):
docker volume rm postgres_data

# Remove dangling volumes (not referenced by any container):
docker volume prune
\`\`\`

## Bind Mounts

\`\`\`bash
# Mount host directory into container:
docker run -v /host/path:/container/path myapp

# Read-only bind mount:
docker run -v /host/config:/etc/app/config:ro myapp

# Development pattern — live code sync:
docker run -v \$(pwd):/app -v /app/node_modules myapp
#            ↑ source code   ↑ named volume prevents host overwriting
#                              node_modules with empty host directory
\`\`\`

## Volume Backup and Restore

\`\`\`bash
# Backup a volume to a tar file:
docker run --rm \\
  -v postgres_data:/source:ro \\
  -v \$(pwd):/backup \\
  alpine tar czf /backup/postgres_backup_\$(date +%Y%m%d).tar.gz -C /source .

# Restore:
docker run --rm \\
  -v postgres_data:/target \\
  -v \$(pwd):/backup \\
  alpine tar xzf /backup/postgres_backup_20240101.tar.gz -C /target

# Copy data between volumes (migration):
docker run --rm \\
  -v old_volume:/source:ro \\
  -v new_volume:/target \\
  alpine cp -av /source/. /target/
\`\`\`

## tmpfs Mounts

Temporary filesystems stored in memory — cleared when container stops:

\`\`\`bash
# Use for secrets, temp files, session data:
docker run \\
  --tmpfs /run:rw,noexec,nosuid,size=100m \\
  --tmpfs /tmp:rw,size=50m \\
  myapp
# Great for: session files, runtime secrets, temp processing
\`\`\`

## Volume Drivers — Cloud Storage

\`\`\`bash
# AWS EFS via docker volume plugin:
docker volume create \\
  --driver rexray/efs \\
  --opt size=20 \\
  my-efs-volume

# Azure File Share:
docker volume create \\
  --driver azure_file \\
  --opt share=myfileshare \\
  azure-volume

# In Kubernetes, this maps to PersistentVolumeClaims
\`\`\`
`,
          interviewQuestions: [
            {
              question: "Should you run a database in a Docker container in production? What are the trade-offs?",
              difficulty: "senior",
              answer: `**Short answer:** It depends on the organization's operational maturity, but managed cloud databases (RDS, Cloud SQL) are usually preferred for critical production workloads.

**Arguments for running DB in Docker:**
- Consistency: dev/staging/prod environments match exactly
- Easy for small projects, startups, or internal tools
- Works well for read-heavy workloads with proper volume setup
- Useful for development and testing

**Arguments against (the real risks):**

1. **Volume management**: If someone runs \`docker volume prune\` or \`docker compose down -v\` by mistake — all data is gone. Managed databases have automated backups.

2. **Overlay2 performance**: Database files stored on overlay2 (without volumes) have CoW overhead on every write. Always use named volumes.

3. **Memory management**: JVM, Postgres, and MySQL rely on OS-level buffer caches. In a container with a memory limit, the OS can't cache as aggressively → more disk I/O.

4. **Operational complexity**: You own everything: backups, point-in-time recovery, failover, upgrades, monitoring. Managed services handle all of this.

5. **Container restart ≠ HA**: A container crash means downtime. Postgres HA (Patroni, etc.) in containers is significantly complex.

**When Docker DB works well:**
- Development environments (always)
- Stateless microservices with ephemeral data
- Internal tooling with low durability requirements
- Read-only replicas when the primary is managed

**Best practice if you do run DB in Docker:**
\`\`\`yaml
db:
  image: postgres:16-alpine
  volumes:
    - postgres_data:/var/lib/postgresql/data  # named volume, not bind mount
  deploy:
    resources:
      limits:
        memory: 2G
  restart: unless-stopped
  # Implement external backup: pg_dump to S3 via cron container
\`\`\``,
            },
          ],
        },
      ],
    },
    {
      id: "docker-security",
      title: "Docker Security",
      level: "advanced",
      description: "Harden Docker deployments against container escape and privilege escalation.",
      lessons: [
        {
          id: "container-security-hardening",
          title: "Container Security Hardening",
          duration: 25,
          type: "lesson",
          description: "Apply defense-in-depth strategies to secure containerized workloads.",
          objectives: [
            "Implement rootless Docker and user namespace remapping",
            "Scan images for CVEs with Trivy and Docker Scout",
            "Apply seccomp and AppArmor profiles",
            "Understand container escape attack vectors and mitigations",
          ],
          content: `# Container Security Hardening

## The Container Threat Model

Containers are not VMs. They share the host kernel. A container escape means an attacker gets code execution on the host:

\`\`\`
Attack vectors:
1. Kernel exploits (CVE in the shared kernel → root on host)
2. Container runtime vulnerabilities (runc CVEs — e.g., CVE-2019-5736)
3. Privileged containers (--privileged = almost no isolation)
4. Mounted docker.sock (/var/run/docker.sock → container to root)
5. Host path mounts (/host/etc/passwd → read/write host files)
6. Exposed secrets (ENV vars, image layers)
\`\`\`

## Image Vulnerability Scanning

\`\`\`bash
# Trivy — scan an image for CVEs:
trivy image nginx:latest
# Reports vulnerabilities by severity: CRITICAL, HIGH, MEDIUM, LOW

# Scan with exit code for CI/CD gates:
trivy image --exit-code 1 --severity CRITICAL myapp:latest
# Exit code 1 if CRITICAL vulnerabilities found → fails the pipeline

# Scan the Dockerfile for misconfigurations:
trivy config --exit-code 1 Dockerfile

# Docker Scout (Docker's built-in):
docker scout cves nginx:latest
docker scout recommendations nginx:latest  # suggests better base image

# Scan filesystem (in CI before build):
trivy fs --exit-code 1 --severity HIGH,CRITICAL .
\`\`\`

## Running as Non-Root

\`\`\`dockerfile
# Create a dedicated user:
RUN groupadd -r appgroup && useradd -r -g appgroup -u 1001 appuser
USER appuser

# For Alpine:
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
USER appuser
\`\`\`

\`\`\`bash
# Verify at runtime:
docker run --rm myapp id
# uid=1001(appuser) gid=1001(appgroup) — good!

# Override user at runtime (for debugging):
docker run --user root myapp sh
\`\`\`

## Rootless Docker

Run the Docker daemon itself without root privileges:

\`\`\`bash
# Install rootless Docker:
dockerd-rootless-setuptool.sh install

# Use rootless Docker:
export DOCKER_HOST=unix://\$XDG_RUNTIME_DIR/docker.sock
docker run nginx  # daemon runs as your user, not root

# Benefits:
# - Container escape doesn't give root on host
# - Meets compliance requirements (CIS benchmark, NIST)
\`\`\`

## User Namespace Remapping

Map container root (UID 0) to an unprivileged user on the host:

\`\`\`bash
# Configure in /etc/docker/daemon.json:
{
  "userns-remap": "default"
  # Or: "userns-remap": "myuser:mygroup"
}
# Restart docker daemon

# Now root in container = UID 165536 on host (nobody can access host files)
docker run --rm alpine id
# uid=0(root) — appears as root inside
# But on host: ps aux shows process owned by UID 165536
\`\`\`

## Seccomp Profiles

Seccomp (Secure Computing Mode) filters syscalls the container can make:

\`\`\`bash
# Docker's default seccomp profile blocks ~44 dangerous syscalls
# including: keyctl, ptrace, personality, mount, etc.

# Run with NO seccomp (dangerous — only for debugging):
docker run --security-opt seccomp=unconfined myapp

# Apply a custom profile:
docker run --security-opt seccomp=./my-seccomp.json myapp

# Check which syscalls your app needs (strace it first):
strace -f -e trace=all your-app 2>&1 | awk '{print \$2}' | sort -u
\`\`\`

\`\`\`json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": ["read", "write", "open", "close", "accept", "connect"],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
\`\`\`

## AppArmor Profiles

MAC (Mandatory Access Control) layer on top of Linux permissions:

\`\`\`bash
# Load a profile:
apparmor_parser -r -W /etc/apparmor.d/docker-nginx

# Apply at runtime:
docker run --security-opt apparmor=docker-nginx nginx

# Docker's default AppArmor profile (docker-default):
# Blocks: mount, network raw sockets, writing to /proc, etc.
\`\`\`

## Capabilities Deep Dive

\`\`\`bash
# Drop all capabilities, add back minimum needed:
docker run --cap-drop=ALL \\
  --cap-add=NET_BIND_SERVICE \\   # bind ports < 1024
  --security-opt no-new-privileges \\  # prevent setuid binaries from gaining caps
  nginx

# Check what capabilities a container has:
docker run --rm alpine cat /proc/self/status | grep CapEff
# CapEff: 00000000a80425fb
capsh --decode=00000000a80425fb  # human-readable list

# Common capability needs:
# NET_BIND_SERVICE: bind ports < 1024 (nginx, apache)
# SYS_PTRACE: debugging, strace
# SYS_ADMIN: many things — almost never needed (avoid)
# CHOWN: change file ownership (often in entrypoints)
\`\`\`

## The docker.sock Risk

\`\`\`bash
# NEVER do this:
docker run -v /var/run/docker.sock:/var/run/docker.sock myapp
# Container now controls the Docker daemon = full host compromise

# If you must (CI runners, management tools):
# Use read-only socket proxy:
docker run -d \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -p 2375:2375 \\
  tecnativa/docker-socket-proxy
# Configure CONTAINERS=1, SERVICES=1, but POST=0 (read-only)
\`\`\`

## Security Scanning in CI Pipeline

\`\`\`yaml
# .github/workflows/security.yml
name: Security Scan
on: [push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t myapp:\${{ github.sha }} .
      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:\${{ github.sha }}
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What is a container escape and what prevents it?",
              difficulty: "senior",
              answer: `A container escape is when a process inside a container gains access to the host filesystem, processes, or network outside its namespace boundaries — effectively breaking the isolation.

**Common attack vectors:**

1. **Kernel CVEs**: Exploiting vulnerabilities in the shared kernel (e.g., Dirty COW, Dirty Pipe). The container and host share the kernel, so a kernel exploit compromises both. Mitigation: Keep kernel patched, use gVisor (separate kernel per container).

2. **runc vulnerabilities** (CVE-2019-5736): Overwriting the runc binary from inside the container. Fixed in runc 1.0-rc6, but shows that the runtime itself is an attack surface.

3. **Privileged containers** (\`--privileged\`): Disables almost all isolation. A process can mount the host filesystem: \`nsenter --target 1 --mount --uts --ipc --net --pid -- bash\`. Never use \`--privileged\` in production.

4. **Mounted docker.sock**: \`docker run -v /var/run/docker.sock:/var/run/docker.sock\` gives the container control over the Docker daemon. The attacker runs \`docker run -v /:/host --privileged attacker-image\` and has full host access.

5. **Host path mounts with sensitive paths**: \`-v /etc:/etc\` or \`-v /:/host\` — attacker reads /etc/shadow, writes cron jobs.

**Defense in depth:**
- Non-root users in containers (USER instruction)
- Drop all capabilities (\`--cap-drop=ALL\`)
- \`--security-opt no-new-privileges\`
- Seccomp profiles (block dangerous syscalls like mount, ptrace)
- AppArmor/SELinux profiles
- Rootless Docker or user namespace remapping
- Read-only root filesystem (\`--read-only\`)
- Never mount docker.sock
- Runtime security (Falco) to detect anomalous syscalls
- Regular image and host kernel patching`,
            },
            {
              question: "How do you set up image scanning in a CI/CD pipeline and what do you do when vulnerabilities are found?",
              difficulty: "mid",
              answer: `**Pipeline integration with Trivy:**
\`\`\`bash
# In CI (fail build on CRITICAL):
trivy image --exit-code 1 --severity CRITICAL myapp:\$IMAGE_TAG

# Allow specific CVEs that can't be fixed yet:
trivy image --ignore-unfixed \\
  --ignorefile .trivyignore \\
  --exit-code 1 myapp:latest
\`\`\`

\`\`\`
# .trivyignore — suppress known acceptable risks
CVE-2023-1234  # we're mitigated at WAF level, tracking in JIRA-456
CVE-2023-5678  # no fix available, low risk in our network context
\`\`\`

**Triage workflow when vulnerabilities are found:**

1. **Is there a fix?** Check \`trivy image --ignore-unfixed\` — if the CVE has no available fix, block on CRITICAL/HIGH only after careful review.

2. **Is the vulnerable code path reachable?** A CRITICAL CVE in OpenSSL might not matter if your app never uses the vulnerable function. Reachability analysis (with tools like Socket.dev or Snyk) helps.

3. **Fix strategies:**
   - Update base image: \`FROM node:20.9-alpine3.18\` → \`FROM node:20.11-alpine3.19\`
   - Update the vulnerable package in Dockerfile: \`RUN apk upgrade openssl\`
   - Move to distroless (removes most vulnerable packages entirely)
   - File exception with risk acceptance if no fix exists

4. **Continuous monitoring:** Don't just scan at build time. Rescan in production on a schedule — a zero-day can affect images already deployed:
\`\`\`bash
# Scan running container images in Kubernetes:
trivy k8s --report summary cluster
\`\`\``,
            },
            {
              question: "Walk me through how you would audit an existing Docker deployment for security issues.",
              difficulty: "senior",
              answer: `**Systematic audit process:**

**1. Image-level audit:**
\`\`\`bash
# Scan all images for CVEs:
docker images --format "{{.Repository}}:{{.Tag}}" | xargs -I{} trivy image {}

# Check for root user:
docker inspect <image> | jq '.[0].Config.User'
# Empty string = running as root = BAD

# Check exposed secrets in layers:
docker history --no-trunc <image> | grep -iE 'password|secret|key|token'

# Check for unnecessary capabilities:
docker inspect <container> | jq '.[0].HostConfig.CapAdd'
\`\`\`

**2. Container runtime audit:**
\`\`\`bash
# Find privileged containers:
docker ps -q | xargs docker inspect | jq '.[] | select(.HostConfig.Privileged==true) | .Name'

# Find containers with docker.sock mounted:
docker ps -q | xargs docker inspect | jq '.[] | select(.Mounts[].Source=="/var/run/docker.sock") | .Name'

# Find containers with host network:
docker ps -q | xargs docker inspect | jq '.[] | select(.HostConfig.NetworkMode=="host") | .Name'

# Find containers with host path mounts (sensitive paths):
docker ps -q | xargs docker inspect | jq '.[] | .Mounts[] | select(.Type=="bind" and (.Source | startswith("/etc") or startswith("/var/run"))) | {Name: .Name, Source: .Source}'
\`\`\`

**3. Daemon configuration audit:**
\`\`\`bash
# Run Docker Bench Security:
docker run --rm \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v /etc:/etc:ro \\
  docker/docker-bench-security

# Checks: TLS enabled, user namespace remapping, log driver, etc.
\`\`\`

**4. Network audit:**
\`\`\`bash
# Find containers with ports exposed to 0.0.0.0:
docker ps --format "{{.Ports}}" | grep "0.0.0.0"
# Ports should bind to 127.0.0.1 unless externally needed
\`\`\`

**Automation:** Integrate this into CI/CD and run weekly against production with Falco for runtime anomaly detection.`,
            },
          ],
        },
      ],
    },
  ],
};
