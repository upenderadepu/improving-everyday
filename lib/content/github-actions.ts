import type { Track } from "./types";

export const githubActionsTrack: Track = {
  id: "github-actions",
  title: "GitHub Actions",
  description: "Build CI/CD pipelines with GitHub Actions",
  longDescription:
    "Automate your software workflows with GitHub Actions — from simple test runners to full multi-environment deployment pipelines.",
  icon: "Workflow",
  color: "#2088ff",
  gradient: "track-actions-gradient",
  tags: ["ci-cd", "automation", "devops", "pipelines"],
  modules: [
    {
      id: "intro-to-actions",
      title: "Introduction to GitHub Actions",
      level: "beginner",
      description: "Understand CI/CD concepts and the GitHub Actions ecosystem.",
      lessons: [
        {
          id: "what-is-cicd",
          title: "What is CI/CD?",
          duration: 8,
          type: "lesson",
          description: "Learn the fundamentals of Continuous Integration and Continuous Delivery.",
          content: `# What is CI/CD?

**CI/CD** stands for **Continuous Integration** and **Continuous Delivery/Deployment**. It's a set of practices that automate the software delivery process, allowing teams to release software faster and with higher confidence.

## The Problem CI/CD Solves

Traditional release cycles looked like this:

\`\`\`
Dev → Dev → Dev → ... → "Integration Hell" → Test → Bug Fix → Bug Fix → Release
                         (days or weeks of merging conflicts and broken code)
\`\`\`

CI/CD changes it to:

\`\`\`
Code → Auto Test → Auto Build → Auto Deploy → Feedback → Repeat
       (minutes, not weeks)
\`\`\`

## Continuous Integration (CI)

CI means every code change is automatically:
1. Merged into a shared branch frequently (at least daily)
2. Built
3. Tested

The goal: **detect integration problems early**, when they're cheap to fix.

\`\`\`
Developer pushes code
        ↓
CI system detects the push
        ↓
Runs: linting → unit tests → integration tests → build
        ↓
Result: ✅ Pass or ❌ Fail (notified immediately)
\`\`\`

## Continuous Delivery (CD)

CD extends CI — after passing tests, the software is **automatically prepared for release** to production. A human still approves the final deployment.

## Continuous Deployment

One step further — every passing change is **automatically deployed to production** with no human intervention.

| Practice | Automated tests | Automated build | Automated release | Automated deploy |
|----------|----------------|-----------------|-------------------|------------------|
| CI | ✅ | ✅ | ❌ | ❌ |
| CD | ✅ | ✅ | ✅ | ❌ (manual gate) |
| Continuous Deployment | ✅ | ✅ | ✅ | ✅ |

## Why It Matters

- **Faster feedback** — bugs found in minutes, not weeks
- **Smaller, safer changes** — less code per deployment = less risk
- **Always deployable** — main branch is always in a releasable state
- **Reduced manual work** — automated testing replaces manual QA cycles
- **Confidence** — "it works on my machine" becomes "it works in production"

## Where GitHub Actions Fits

GitHub Actions is GitHub's built-in CI/CD platform. It:
- Runs workflows in response to GitHub events (push, PR, schedule)
- Provides thousands of pre-built "Actions" for common tasks
- Integrates natively with your GitHub repositories
- Scales automatically — no infrastructure to manage
`,
        },
        {
          id: "github-actions-overview",
          title: "GitHub Actions Overview",
          duration: 10,
          type: "lesson",
          description: "Understand the core concepts: workflows, jobs, steps, and runners.",
          content: `# GitHub Actions Overview

GitHub Actions uses a hierarchy of concepts: **Workflows** contain **Jobs**, which contain **Steps**, which run on **Runners**.

## Core Concepts

### Workflow
A YAML file in \`.github/workflows/\` that defines automated processes. Triggered by events.

### Event
Something that triggers a workflow: a push, pull request, schedule, manual trigger, etc.

### Job
A set of steps that execute on the same runner. Jobs in a workflow run in parallel by default.

### Step
An individual task within a job — either a shell command or a reusable Action.

### Action
A reusable unit of code. You can use actions from the GitHub Marketplace or write your own.

### Runner
A virtual machine that executes the jobs. GitHub provides Ubuntu, Windows, and macOS runners.

## The Hierarchy

\`\`\`
Workflow (.github/workflows/ci.yml)
└── Job: build-and-test
    ├── Step: Checkout code
    ├── Step: Set up Node.js
    ├── Step: Install dependencies
    ├── Step: Run linter
    └── Step: Run tests
└── Job: deploy (depends on build-and-test)
    ├── Step: Checkout code
    ├── Step: Build Docker image
    └── Step: Deploy to production
\`\`\`

## Anatomy of a Workflow File

\`\`\`yaml
# .github/workflows/ci.yml
name: CI Pipeline               # Displayed in GitHub UI

on:                             # Trigger events
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:                           # One or more jobs
  test:                         # Job ID (alphanumeric + hyphens)
    name: Run Tests             # Human-readable name
    runs-on: ubuntu-latest      # Runner type

    steps:                      # Sequential steps
      - name: Checkout code
        uses: actions/checkout@v4       # Use a pre-built action

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci               # Run a shell command

      - name: Run tests
        run: npm test
\`\`\`

## GitHub-Hosted Runners

| Label | OS | CPU | RAM |
|-------|-----|-----|-----|
| \`ubuntu-latest\` | Ubuntu 22.04 | 4 cores | 16 GB |
| \`windows-latest\` | Windows Server 2022 | 4 cores | 16 GB |
| \`macos-latest\` | macOS 14 | 3 cores (M1) | 7 GB |

> **Note:** GitHub provides 2,000 free CI/CD minutes per month for private repos (unlimited for public repos).

## Viewing Workflow Runs

After pushing a workflow, go to your repo → **Actions** tab. You'll see:
- All workflow runs with their status
- Real-time logs for each step
- Downloadable artifacts
- Re-run failed jobs
`,
        },
      ],
    },
    {
      id: "first-workflow",
      title: "Your First Workflow",
      level: "beginner",
      description: "Write and run your first GitHub Actions workflow from scratch.",
      lessons: [
        {
          id: "yaml-basics",
          title: "YAML for GitHub Actions",
          duration: 10,
          type: "lesson",
          description: "Learn just enough YAML to write GitHub Actions workflows.",
          content: `# YAML for GitHub Actions

YAML (YAML Ain't Markup Language) is the format used for GitHub Actions workflows. It's designed to be human-readable.

## Key Syntax Rules

### Indentation is everything
YAML uses spaces (never tabs) for indentation. Inconsistent indentation will break your workflow.

\`\`\`yaml
# Correct (2-space indent)
jobs:
  build:
    runs-on: ubuntu-latest

# Wrong (mixed indentation) — BROKEN
jobs:
  build:
      runs-on: ubuntu-latest
\`\`\`

### Scalars (simple values)
\`\`\`yaml
name: My Workflow          # String (no quotes needed)
number: 42                  # Integer
float: 3.14                 # Float
enabled: true               # Boolean (true/false, not True/False)
nothing: null               # Null
quoted: "Hello, World!"     # Quoted string (use for special chars)
\`\`\`

### Lists
\`\`\`yaml
# Block style (one item per line)
branches:
  - main
  - develop
  - "feature/*"

# Flow style (inline)
branches: [main, develop, "feature/*"]
\`\`\`

### Mappings (key-value objects)
\`\`\`yaml
# Block style
env:
  NODE_ENV: production
  PORT: 3000

# Flow style
env: { NODE_ENV: production, PORT: 3000 }
\`\`\`

### Multi-line strings
\`\`\`yaml
# Literal block (|) — preserves newlines
run: |
  echo "First line"
  echo "Second line"
  npm test

# Folded block (>) — folds newlines into spaces
description: >
  This is a long description that
  wraps across multiple lines.
\`\`\`

## Common GitHub Actions YAML Patterns

### Environment variables
\`\`\`yaml
env:
  NODE_VERSION: '20'
  DATABASE_URL: \${{ secrets.DATABASE_URL }}

steps:
  - name: Use env var
    run: echo "Node version is $NODE_VERSION"
\`\`\`

### Expressions and contexts
\`\`\`yaml
# \${{ }} is the expression syntax
if: \${{ github.event_name == 'push' }}
run: echo "Commit SHA is \${{ github.sha }}"
\`\`\`

### Anchors and aliases (DRY YAML)
\`\`\`yaml
.defaults: &defaults
  runs-on: ubuntu-latest
  timeout-minutes: 10

jobs:
  test:
    <<: *defaults
    steps:
      - run: npm test

  lint:
    <<: *defaults
    steps:
      - run: npm run lint
\`\`\`

> **Tip:** Use the GitHub Actions YAML validator in VS Code extension "GitHub Actions" to catch syntax errors before pushing.
`,
        },
        {
          id: "triggers-jobs-steps",
          title: "Triggers, Jobs & Steps",
          duration: 15,
          type: "lesson",
          description: "Master workflow triggers and structure multi-job pipelines.",
          content: `# Triggers, Jobs & Steps

## Event Triggers (\`on:\`)

### Push and Pull Request
\`\`\`yaml
on:
  push:
    branches: [main, "release/*"]
    paths:
      - 'src/**'        # Only trigger when src/ changes
      - '!src/**/*.md'  # But NOT for markdown changes

  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
\`\`\`

### Schedule (Cron)
\`\`\`yaml
on:
  schedule:
    - cron: '0 8 * * 1-5'  # Weekdays at 8 AM UTC
    - cron: '0 0 * * 0'    # Every Sunday at midnight
\`\`\`

### Manual Trigger
\`\`\`yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy target'
        required: true
        type: choice
        options: [staging, production]
      debug:
        type: boolean
        default: false
\`\`\`

### Other Events
\`\`\`yaml
on:
  release:
    types: [published]
  issues:
    types: [opened]
  workflow_call:  # Called from another workflow
  repository_dispatch:  # Triggered via API
\`\`\`

## Jobs

### Parallel Jobs (default)
\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
# test and lint run simultaneously
\`\`\`

### Sequential Jobs (needs:)
\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: test          # Only runs if test passes
    steps:
      - run: ./deploy.sh
\`\`\`

### Matrix Jobs
\`\`\`yaml
jobs:
  test:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: ['18', '20', '22']
        exclude:
          - os: windows-latest
            node: '18'
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - run: npm test
\`\`\`

## Steps

### Using Actions
\`\`\`yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4       # Pinned to major version

  - name: Set up Python
    uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: 'pip'

  - name: Upload artifact
    uses: actions/upload-artifact@v4
    with:
      name: test-results
      path: ./coverage/
      retention-days: 7
\`\`\`

### Conditional Steps
\`\`\`yaml
steps:
  - name: Deploy to staging
    if: github.ref == 'refs/heads/develop'
    run: ./deploy.sh staging

  - name: Deploy to production
    if: github.event_name == 'release'
    run: ./deploy.sh production

  - name: Always notify
    if: always()    # Runs even if previous steps fail
    run: ./notify.sh
\`\`\`

### Step Outputs
\`\`\`yaml
steps:
  - name: Get version
    id: version
    run: echo "value=$(cat package.json | jq -r .version)" >> $GITHUB_OUTPUT

  - name: Use version
    run: echo "Deploying version \${{ steps.version.outputs.value }}"
\`\`\`
`,
        },
      ],
    },
    {
      id: "ci-pipelines",
      title: "CI Pipelines",
      level: "intermediate",
      description: "Build production-grade CI pipelines with testing, linting, and matrix builds.",
      lessons: [
        {
          id: "build-test-pipeline",
          title: "Build & Test Pipeline",
          duration: 20,
          type: "lesson",
          description: "Create a complete CI pipeline for a Node.js application.",
          content: `# Build & Test Pipeline

Let's build a production-grade CI pipeline for a Node.js application. This workflow runs on every push and pull request.

## Complete CI Workflow

\`\`\`yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true  # Cancel older runs on same branch

env:
  NODE_VERSION: '20'

jobs:
  # ─── Lint ────────────────────────────────────────────────────────────────
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  # ─── Test ────────────────────────────────────────────────────────────────
  test:
    name: Test (Node \${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node: ['18', '20', '22']

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://postgres:testpass@localhost:5432/testdb

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: matrix.node == '20'
        with:
          name: coverage-report
          path: coverage/

  # ─── Build ───────────────────────────────────────────────────────────────
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 1

  # ─── Security Scan ───────────────────────────────────────────────────────
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        continue-on-error: true  # Don't fail on scan findings, just report
\`\`\`

## Caching Dependencies

Caching \`node_modules\` dramatically speeds up workflows:

\`\`\`yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'         # Built-in cache based on package-lock.json hash
\`\`\`

Or manually with more control:

\`\`\`yaml
- name: Cache node_modules
  uses: actions/cache@v4
  id: npm-cache
  with:
    path: ~/.npm
    key: \${{ runner.os }}-npm-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-npm-

- name: Install dependencies
  if: steps.npm-cache.outputs.cache-hit != 'true'
  run: npm ci
\`\`\`

## Pull Request Summary Comment

Automatically post test results as a PR comment:

\`\`\`yaml
- name: Comment PR with test results
  uses: actions/github-script@v7
  if: github.event_name == 'pull_request'
  with:
    script: |
      const coverage = require('./coverage/coverage-summary.json');
      const total = coverage.total;
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '## Test Coverage\\n| Type | % |\\n|------|---|\\n| Statements | ' + total.statements.pct + '% |\\n| Branches | ' + total.branches.pct + '% |\\n| Functions | ' + total.functions.pct + '% |'
      });
\`\`\`
`,
        },
      ],
    },
    {
      id: "docker-integration",
      title: "Docker Integration",
      level: "intermediate",
      description: "Build and push Docker images in your GitHub Actions pipelines.",
      lessons: [
        {
          id: "build-docker-images",
          title: "Build & Push Docker Images",
          duration: 18,
          type: "lesson",
          description: "Build Docker images and push them to registries in CI.",
          content: `# Build & Push Docker Images

## Complete Docker Build Workflow

\`\`\`yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  push:
    branches: [main]
    tags: ['v*.*.*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Set up Docker Buildx for multi-platform builds
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Log in to GitHub Container Registry
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}  # Auto-provided by GitHub

      # Generate image metadata (tags, labels)
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix=,suffix=,format=short

      # Build and push (or just build on PRs)
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha        # Use GitHub Actions cache
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64  # Multi-arch
\`\`\`

## Tags Generated Automatically

For a push to \`main\`:
- \`ghcr.io/org/repo:main\`
- \`ghcr.io/org/repo:sha-abc1234\`

For a tag \`v2.1.0\`:
- \`ghcr.io/org/repo:2.1.0\`
- \`ghcr.io/org/repo:2.1\`
- \`ghcr.io/org/repo:latest\`

## Pushing to Docker Hub

\`\`\`yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: \${{ secrets.DOCKERHUB_USERNAME }}
    password: \${{ secrets.DOCKERHUB_TOKEN }}

- name: Build and push to Docker Hub
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myorg/myapp:latest,myorg/myapp:\${{ github.sha }}
\`\`\`

## Scanning Images for Vulnerabilities

\`\`\`yaml
- name: Scan image for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'

- name: Upload scan results
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
\`\`\`
`,
        },
      ],
    },
    {
      id: "reusable-workflows",
      title: "Reusable Workflows & Composite Actions",
      level: "intermediate",
      description: "DRY up your CI/CD by sharing workflows across repositories.",
      lessons: [
        {
          id: "reusable-workflows",
          title: "Reusable Workflows",
          duration: 14,
          type: "lesson",
          description: "Create workflow templates that can be called from other workflows or repositories.",
          objectives: [
            "Create a reusable workflow with inputs and outputs",
            "Call a reusable workflow from another workflow",
            "Pass secrets to reusable workflows",
            "Build a composite action",
          ],
          content: `# Reusable Workflows

## Why Reuse?

Every team eventually copies the same CI steps across repositories. Reusable workflows let you define the logic once and call it from many places — like a function call for CI/CD.

## Creating a Reusable Workflow

Save this as \`.github/workflows/build-and-test.yml\` in a **shared repo** (or the same repo):

\`\`\`yaml
name: Build and Test (Reusable)

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'
        description: Node.js version to use
      run-e2e:
        type: boolean
        default: false
    secrets:
      NPM_TOKEN:
        required: false
    outputs:
      image-tag:
        description: The built Docker image tag
        value: \\\${{ jobs.build.outputs.image-tag }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \\\${{ inputs.node-version }}
          cache: npm
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: \\\${{ steps.tag.outputs.tag }}
    steps:
      - uses: actions/checkout@v4
      - id: tag
        run: echo "tag=\\\${{ github.sha }}" >> "\\\$GITHUB_OUTPUT"
      - run: echo "Building image with tag \\\${{ steps.tag.outputs.tag }}"
\`\`\`

## Calling a Reusable Workflow

From any other workflow:

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    uses: my-org/shared-workflows/.github/workflows/build-and-test.yml@main
    with:
      node-version: '20'
      run-e2e: true
    secrets:
      NPM_TOKEN: \\\${{ secrets.NPM_TOKEN }}
\`\`\`

## Composite Actions

For smaller reusable units, create a **composite action** in your repo at \`.github/actions/setup-app/action.yml\`:

\`\`\`yaml
name: Setup Application
description: Install dependencies and configure the environment

inputs:
  node-version:
    description: Node.js version
    default: '20'

runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: \\\${{ inputs.node-version }}
        cache: npm
    - run: npm ci
      shell: bash
    - run: npm run build
      shell: bash
\`\`\`

Use it in any workflow:

\`\`\`yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-app
    with:
      node-version: '20'
  - run: npm test
\`\`\`

## Matrix Strategy for Reusable Workflows

\`\`\`yaml
jobs:
  test-versions:
    strategy:
      matrix:
        node: ['18', '20', '22']
    uses: ./.github/workflows/build-and-test.yml
    with:
      node-version: \\\${{ matrix.node }}
\`\`\`
`,
        },
      ],
    },
    {
      id: "deployment-pipelines",
      title: "Deployment Pipelines",
      level: "advanced",
      description: "Build end-to-end deployment workflows with environments and approvals.",
      lessons: [
        {
          id: "environments-and-approvals",
          title: "Environments & Approvals",
          duration: 16,
          type: "lesson",
          description: "Use GitHub Environments to implement staging gates and production approvals.",
          objectives: [
            "Configure GitHub Environments with protection rules",
            "Require manual approvals before production deployments",
            "Use environment-specific secrets",
            "Implement a staging → production pipeline",
          ],
          content: `# Environments & Approvals

## GitHub Environments

Environments let you organize deployments into distinct stages (e.g., \`staging\`, \`production\`) with:
- **Required reviewers** — humans must approve before the job runs
- **Wait timers** — delay between stages
- **Environment secrets** — scoped to specific environments

## Configuring Environments

Go to **Settings → Environments → New environment** in GitHub, or use the API:

\`\`\`bash
gh api repos/{owner}/{repo}/environments/production \\
  --method PUT \\
  --field wait_timer=5 \\
  --field reviewers[][type]=User \\
  --field reviewers[][id]=<your-user-id>
\`\`\`

## A Complete Staging → Production Pipeline

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image: \\\${{ steps.build.outputs.image }}
    steps:
      - uses: actions/checkout@v4
      - id: build
        run: |
          IMAGE="ghcr.io/\\\${{ github.repository }}:\\\${{ github.sha }}"
          docker build -t "\\\$IMAGE" .
          docker push "\\\$IMAGE"
          echo "image=\\\$IMAGE" >> "\\\$GITHUB_OUTPUT"

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Deploy to staging
        env:
          KUBE_CONFIG: \\\${{ secrets.STAGING_KUBE_CONFIG }}
          IMAGE: \\\${{ needs.build.outputs.image }}
        run: |
          echo "\\\$KUBE_CONFIG" > kubeconfig.yaml
          kubectl --kubeconfig=kubeconfig.yaml set image \\
            deployment/api api="\\\$IMAGE" -n staging

  integration-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:e2e
        env:
          BASE_URL: https://staging.example.com

  deploy-production:
    needs: integration-tests
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Deploy to production
        env:
          KUBE_CONFIG: \\\${{ secrets.PROD_KUBE_CONFIG }}
          IMAGE: \\\${{ needs.build.outputs.image }}
        run: |
          echo "\\\$KUBE_CONFIG" > kubeconfig.yaml
          kubectl --kubeconfig=kubeconfig.yaml set image \\
            deployment/api api="\\\$IMAGE" -n production
\`\`\`

## Deployment Notifications

\`\`\`yaml
  - name: Notify Slack on success
    if: success()
    uses: slackapi/slack-github-action@v1
    with:
      payload: |
        {
          "text": "✅ *\\\${{ github.repository }}* deployed to production",
          "attachments": [{
            "color": "good",
            "fields": [
              {"title": "Deployed by", "value": "\\\${{ github.actor }}", "short": true},
              {"title": "Commit", "value": "\\\${{ github.sha }}", "short": true}
            ]
          }]
        }
    env:
      SLACK_WEBHOOK_URL: \\\${{ secrets.SLACK_WEBHOOK }}

  - name: Notify Slack on failure
    if: failure()
    uses: slackapi/slack-github-action@v1
    with:
      payload: |
        {
          "text": "❌ *\\\${{ github.repository }}* deployment FAILED",
          "attachments": [{"color": "danger", "text": "Check the workflow run for details."}]
        }
    env:
      SLACK_WEBHOOK_URL: \\\${{ secrets.SLACK_WEBHOOK }}
\`\`\`

## Rollback Strategy

\`\`\`yaml
  rollback:
    if: failure()
    needs: deploy-production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Rollback to previous image
        env:
          KUBE_CONFIG: \\\${{ secrets.PROD_KUBE_CONFIG }}
        run: |
          kubectl --kubeconfig=<(echo "\\\$KUBE_CONFIG") \\
            rollout undo deployment/api -n production
          kubectl --kubeconfig=<(echo "\\\$KUBE_CONFIG") \\
            rollout status deployment/api -n production
\`\`\`
`,
        },
      ],
    },
  ],
};
