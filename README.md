# DevOps Learn

A modern, self-paced learning platform for DevOps engineers. 20 structured tracks covering Linux, cloud, containers, CI/CD, security, and more — all running locally in the browser with no backend required.

---

## Features

- **20 learning tracks** organized from beginner to advanced, with modules and individual lessons
- **Progress tracking** — lesson completion state persisted in localStorage per profile
- **Profile system** — create multiple learner profiles; progress is tracked per profile
- **Module exams** — quiz-style assessments at the end of each module to test knowledge
- **Notes** — attach personal notes to any lesson
- **Full-text search** — search across all 20 tracks, modules, and lessons instantly
- **Lesson navigation** — prev/next lesson links within a track, breadcrumb navigation
- **Responsive sidebar** — quick access to all tracks and lessons from anywhere in the app
- **Dark UI** — terminal-inspired design built for engineers

---

## Learning Tracks

| # | Track | Level | Topics |
|---|-------|-------|--------|
| 01 | **Linux** | Beginner → Advanced | File system, permissions, process management, shell scripting, security hardening |
| 02 | **Linux Networking** | Beginner → Advanced | TCP/IP, DNS, firewalls, network troubleshooting, VPNs |
| 03 | **Scripting & Automation** | Beginner → Intermediate | Bash scripting, cron, automation patterns |
| 04 | **SSH & Network Protocols** | Beginner → Intermediate | SSH keys, tunneling, port forwarding, SCP/SFTP |
| 05 | **Git** | Beginner → Advanced | Branching, merging, rebasing, hooks, workflows |
| 06 | **GitHub Actions** | Beginner → Advanced | Workflows, runners, secrets, matrix builds, reusable workflows |
| 07 | **GitLab CI/CD** | Beginner → Advanced | Pipelines, runners, templates, environments, Container Registry, security scanning |
| 08 | **Python** | Beginner → Advanced | Core Python, scripting, automation, APIs, testing |
| 09 | **Docker** | Beginner → Advanced | Images, containers, volumes, networking, Docker Compose, security |
| 10 | **Databases** | Beginner → Intermediate | SQL, PostgreSQL, Redis, backups, connection pooling |
| 11 | **Web Technology** | Beginner → Intermediate | HTTP, TLS, reverse proxies, load balancing, CDNs |
| 12 | **SDLC** | Beginner → Intermediate | Agile, Scrum, Kanban, release management, SLOs |
| 13 | **Go Programming** | Beginner → Intermediate | Go fundamentals, concurrency, CLI tools, Docker/Kubernetes SDKs |
| 14 | **Terraform** | Beginner → Advanced | HCL, providers, modules, workspaces, remote state, advanced patterns |
| 15 | **AWS** | Beginner → Advanced | EC2, S3, VPC, IAM, RDS, EKS, Lambda, CloudFormation |
| 16 | **Kubernetes** | Intermediate → Advanced | Pods, deployments, services, ingress, RBAC, Helm, operators |
| 17 | **DevSecOps** | Intermediate → Advanced | Threat modeling, SAST/DAST, secret scanning, supply chain security |
| 18 | **Troubleshooting** | Intermediate → Advanced | Systematic debugging, observability, incident response, postmortems |
| 19 | **Compliance** | Intermediate → Advanced | SOC 2, ISO 27001, GDPR, audit trails, policy as code |
| 20 | **Prompt Engineering** | Beginner → Advanced | LLM fundamentals, prompt patterns, AI-assisted DevOps workflows |

---

## Screenshots

### Dashboard
![Dashboard](public/screenshots/dashboard.png)

### Track Page
![Track Page](public/screenshots/track.png)

### Lesson Viewer
![Lesson Viewer](public/screenshots/lesson.png)

---

## Tech Stack

- **[Next.js](https://nextjs.org)** (App Router) — framework
- **TypeScript** — type-safe throughout
- **Tailwind CSS** — styling
- **localStorage** — all state (profiles, progress, notes) persisted client-side with no backend
- **React Context** — profile and progress state management
- **Lucide React** — icons

---

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd devops-lms

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be prompted to create a learner profile on first launch.

---

## Project Structure

```
app/              # Next.js App Router pages
components/       # Shared UI components
lib/
  content/        # All 20 learning tracks (TypeScript)
  hooks/          # React hooks (useProfile, useProgress, useNotes)
public/           # Static assets
```

## Adding Content

Each track is a TypeScript file in `lib/content/` that exports a `Track` object. To add a new track:

1. Create `lib/content/my-track.ts` following the structure of any existing track
2. Import and add it to the `tracks` array in `lib/content/index.ts`
3. Add a CSS gradient class in `app/globals.css`
