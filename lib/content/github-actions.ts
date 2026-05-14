import type { Track } from "./types";

export const githubActionsTrack: Track = {
  id: "github-actions",
  title: "GitHub Actions",
  description: "Build production CI/CD pipelines with GitHub Actions",
  longDescription:
    "Master GitHub Actions from workflow syntax to advanced patterns — matrix builds, reusable workflows, security hardening, self-hosted runners, and enterprise-scale CI/CD.",
  icon: "Workflow",
  color: "#2088ff",
  gradient: "track-actions-gradient",
  tags: ["cicd", "automation", "devops", "github"],
  modules: [
    {
      id: "actions-fundamentals",
      title: "Actions Architecture & Core Concepts",
      level: "beginner",
      description: "Understand how GitHub Actions works under the hood.",
      lessons: [
        {
          id: "actions-architecture",
          title: "GitHub Actions Architecture",
          duration: 18,
          type: "lesson",
          description: "Understand runners, events, contexts, and how Actions executes workflows.",
          objectives: [
            "Explain the event → workflow → job → step execution model",
            "Understand runner types and environment isolation",
            "Read and write expressions and contexts",
            "Use the GITHUB_TOKEN for API authentication",
          ],
          content: `# GitHub Actions Architecture

## How GitHub Actions Works

\`\`\`
GitHub Event (push, PR, schedule, etc.)
    ↓
Workflow File (.github/workflows/ci.yml)
    ↓
Jobs (one or more, parallel by default)
    ↓
Runner (GitHub-hosted or self-hosted VM)
    ↓
Steps (shell commands or action calls)
    ↓
Actions (reusable units from Marketplace or your repo)
\`\`\`

When a trigger event fires, GitHub:
1. Evaluates which workflow files match the event
2. Creates a workflow run
3. Allocates a runner for each job
4. Each runner clones your repo, then executes steps sequentially

## Events — Workflow Triggers

\`\`\`yaml
on:
  # Push to specific branches:
  push:
    branches: [main, 'release/**']
    paths:                    # only run if these files change
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'               # ignore docs changes

  # Pull request events:
  pull_request:
    types: [opened, synchronize, reopened]  # default
    branches: [main]

  # Scheduled (cron):
  schedule:
    - cron: '0 2 * * 1'      # Mondays at 2 AM UTC

  # Manual trigger:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy to'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]
      dry_run:
        type: boolean
        default: false

  # Called by another workflow:
  workflow_call:
    inputs:
      version:
        required: true
        type: string
    secrets:
      deploy_key:
        required: true

  # Repository dispatch (external API trigger):
  repository_dispatch:
    types: [deploy-event]
\`\`\`

## Runners — Where Jobs Execute

\`\`\`yaml
jobs:
  test:
    # GitHub-hosted runners:
    runs-on: ubuntu-latest    # Ubuntu 22.04 LTS
    runs-on: ubuntu-22.04     # pinned version (preferred)
    runs-on: windows-latest
    runs-on: macos-14         # Apple Silicon!

    # Self-hosted runners:
    runs-on: [self-hosted, linux, x64, gpu]  # label matching

    # Matrix (multiple runners in parallel):
    strategy:
      matrix:
        os: [ubuntu-22.04, macos-14, windows-latest]
        node: [18, 20, 22]
    runs-on: \${{ matrix.os }}
\`\`\`

**GitHub-hosted runner specs:**
- Ubuntu/Windows: 4 vCPUs, 16GB RAM, 14GB SSD
- macOS: 3 vCPUs (Intel) or 3 vCPUs M1 (macos-14)
- Each job gets a fresh VM (isolated completely)
- 6-hour job timeout, 35-day log retention

## Contexts — Runtime Information

Contexts provide runtime values. They're objects you access with \`\${{ }}\`:

\`\`\`yaml
# github context — info about the trigger:
\${{ github.event_name }}        # "push", "pull_request", etc.
\${{ github.sha }}               # commit SHA (40 chars)
\${{ github.ref }}               # "refs/heads/main"
\${{ github.ref_name }}          # "main"
\${{ github.repository }}        # "owner/repo"
\${{ github.actor }}             # username who triggered
\${{ github.run_id }}            # unique run ID
\${{ github.run_number }}        # sequential run number

# env context — environment variables:
\${{ env.MY_VAR }}

# secrets context — encrypted secrets:
\${{ secrets.MY_SECRET }}
\${{ secrets.GITHUB_TOKEN }}     # automatically provided

# steps context — outputs from previous steps:
\${{ steps.my-step-id.outputs.version }}
\${{ steps.my-step-id.outcome }}  # success, failure, cancelled, skipped

# needs context — outputs from dependent jobs:
\${{ needs.build.outputs.image_tag }}

# inputs context (workflow_dispatch):
\${{ inputs.environment }}
\`\`\`

## GITHUB_TOKEN — Automatic Authentication

GitHub creates a short-lived token automatically for each workflow run:

\`\`\`yaml
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write      # push to repo, create releases
      packages: write      # push to GitHub Container Registry
      pull-requests: write # comment on PRs
      issues: write        # comment on issues
      id-token: write      # OIDC for cloud auth

    steps:
      - name: Create release
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: gh release create v1.0.0 --generate-notes
\`\`\`

**Permissions model:**
- Default: \`contents: read\` (safe, read-only)
- Minimum required permissions (principle of least privilege)
- Fork PRs get read-only GITHUB_TOKEN (security feature — untrusted code can't write)

## Expressions and Conditions

\`\`\`yaml
steps:
  # Conditional steps:
  - name: Deploy only on main
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    run: ./deploy.sh

  # Run even if previous steps fail:
  - name: Notify on failure
    if: failure()
    run: ./notify-slack.sh

  # Built-in functions:
  - name: Check branch pattern
    if: startsWith(github.ref, 'refs/heads/release/')
    run: echo "This is a release branch"

  # contains, startsWith, endsWith, format, join, toJSON, fromJSON
  - name: Debug context
    run: echo '\${{ toJSON(github) }}'

  # Expressions in environment variables:
  env:
    IMAGE_TAG: \${{ github.sha }}
    IS_PR: \${{ github.event_name == 'pull_request' }}
    DEPLOY_ENV: \${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
\`\`\`
`,
          interviewQuestions: [
            {
              question: "A pull request from a fork is failing with 'Resource not accessible by integration'. Why and how do you fix it?",
              difficulty: "mid",
              answer: `**Why it happens:** GitHub gives fork PRs a read-only GITHUB_TOKEN by default. This is a security measure — untrusted code (from a fork) cannot write to your repository, post comments, or access secrets.

**The error means the workflow is trying to:**
- Write comments to the PR
- Push to the repository
- Access repository secrets
- Create a release or package

**Solutions depending on use case:**

**Option A — Use pull_request_target (with care):**
\`\`\`yaml
on:
  pull_request_target:  # runs in context of BASE branch, not fork
    types: [opened, synchronize]
\`\`\`
⚠️ DANGEROUS: \`pull_request_target\` runs untrusted code with elevated permissions. Only use it if you don't checkout the PR code, or checkout only safe files.

**Option B — Two-workflow pattern (safe approach):**
\`\`\`yaml
# Workflow 1: runs on pull_request (read-only, on fork code)
# Saves artifacts, does not post results
name: Test
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
      - uses: actions/upload-artifact@v4
        with: {name: test-results, path: results/}

# Workflow 2: runs on workflow_run completion (has write access)
name: Post Results
on:
  workflow_run:
    workflows: ["Test"]
    types: [completed]
jobs:
  comment:
    permissions:
      pull-requests: write
    steps:
      - uses: actions/download-artifact@v4
      - run: gh pr comment \${{ ... }} --body-file results.txt
\`\`\`

**Option C — Explicit permission grant (for internal contributors):**
\`\`\`yaml
permissions:
  pull-requests: write
\`\`\`
This works for PRs from the same org, but NOT from forks.`,
            },
            {
              question: "How does OIDC authentication work in GitHub Actions, and why is it better than storing cloud credentials as secrets?",
              difficulty: "senior",
              answer: `**Traditional approach (credential-based):**
\`\`\`yaml
# Generate AWS access key, store as GitHub secret:
- uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}      # long-lived
    aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
\`\`\`
Problem: Long-lived credentials that can be leaked, stolen, forgotten to rotate.

**OIDC approach (identity federation):**
\`\`\`yaml
permissions:
  id-token: write  # required for OIDC
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789:role/github-actions-role
      aws-region: us-east-1
      # NO CREDENTIALS — uses OIDC instead
\`\`\`

**How it works:**
1. GitHub Actions requests a short-lived JWT from GitHub's OIDC provider
2. The JWT contains: repo name, branch, actor, workflow name (claims)
3. AWS (or GCP, Azure) receives the JWT and validates it with GitHub's JWKS endpoint
4. If the IAM role's trust policy matches the claims, AWS issues temporary credentials (15 min)
5. No credentials are stored anywhere

**AWS IAM trust policy:**
\`\`\`json
{
  "Effect": "Allow",
  "Principal": {"Federated": "arn:aws:iam::123456789:oidc-provider/token.actions.githubusercontent.com"},
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:myorg/myrepo:ref:refs/heads/main"
    }
  }
}
\`\`\`

**Why it's better:**
- No long-lived credentials to leak or rotate
- Automatic expiry (15 min)
- Auditable: exactly which repo/branch/workflow triggered the action
- Granular: different branches can assume different roles`,
            },
          ],
        },
        {
          id: "workflow-syntax",
          title: "Workflow Syntax & Best Practices",
          duration: 20,
          type: "lesson",
          description: "Write maintainable, efficient workflow files using all YAML features.",
          objectives: [
            "Use matrix strategies for parallel testing across environments",
            "Implement job dependencies and conditional execution",
            "Share data between jobs using artifacts and outputs",
            "Apply caching strategies to speed up workflows",
          ],
          content: `# Workflow Syntax & Best Practices

## Matrix Strategy — Parallel Test Grids

\`\`\`yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-22.04, windows-latest, macos-14]
        node: [18, 20, 22]
        # Generates 9 parallel jobs (3 OS × 3 Node versions)

      # Custom combinations:
      include:
        - os: ubuntu-22.04
          node: 20
          experimental: true   # extra config for this combo

      # Skip specific combinations:
      exclude:
        - os: windows-latest
          node: 18

      # Don't cancel other jobs if one fails:
      fail-fast: false

    runs-on: \${{ matrix.os }}
    name: Test (Node \${{ matrix.node }} on \${{ matrix.os }})
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - run: npm test
      continue-on-error: \${{ matrix.experimental }}
\`\`\`

## Job Dependencies

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      coverage: \${{ steps.coverage.outputs.percent }}
    steps:
      - run: npm test
      - id: coverage
        run: echo "percent=87" >> \$GITHUB_OUTPUT

  build:
    needs: test        # runs after 'test' completes successfully
    runs-on: ubuntu-latest
    steps:
      - run: echo "Coverage was \${{ needs.test.outputs.coverage }}%"

  deploy-staging:
    needs: [test, build]    # wait for both
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh staging

  deploy-prod:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'  # conditional job
    environment:
      name: production
      url: https://myapp.com
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh production
\`\`\`

## Artifacts — Sharing Files Between Jobs

\`\`\`yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output-\${{ github.sha }}
          path: dist/
          retention-days: 7          # auto-delete after 7 days
          compression-level: 6       # 0-9, balance speed vs size

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build-output-\${{ github.sha }}
          path: dist/

      - run: ./deploy.sh dist/
\`\`\`

## Caching — Dramatically Speed Up Workflows

\`\`\`yaml
steps:
  # Node.js — cache node_modules:
  - uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: npm                      # built-in npm caching
      cache-dependency-path: '**/package-lock.json'

  # Manual cache (for complex cases):
  - uses: actions/cache@v4
    id: npm-cache
    with:
      path: ~/.npm                    # npm cache directory
      key: npm-\${{ runner.os }}-\${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        npm-\${{ runner.os }}-       # fallback: partial match
        npm-

  - run: npm ci
    if: steps.npm-cache.outputs.cache-hit != 'true'

  # Go modules:
  - uses: actions/cache@v4
    with:
      path: |
        ~/go/pkg/mod
        ~/.cache/go-build
      key: go-\${{ runner.os }}-\${{ hashFiles('**/go.sum') }}
      restore-keys: go-\${{ runner.os }}-

  # Docker layer caching (with GitHub Container Registry):
  - uses: docker/build-push-action@v5
    with:
      cache-from: type=gha          # GitHub Actions cache
      cache-to: type=gha,mode=max
\`\`\`

## Environment Variables and Outputs

\`\`\`yaml
env:
  # Workflow-level env (available to all jobs):
  APP_ENV: production

jobs:
  example:
    runs-on: ubuntu-latest
    env:
      # Job-level env:
      DB_URL: postgresql://localhost/test
    steps:
      - name: Set dynamic output
        id: semver
        run: |
          VERSION="\$(git describe --tags --abbrev=0)"
          echo "version=\$VERSION" >> \$GITHUB_OUTPUT
          # GITHUB_OUTPUT replaces set-output (deprecated)

      - name: Use output
        run: echo "Deploying \${{ steps.semver.outputs.version }}"

      - name: Append to PATH
        run: echo "/custom/bin" >> \$GITHUB_PATH

      - name: Set env for subsequent steps
        run: echo "GENERATED_VALUE=abc123" >> \$GITHUB_ENV

      - name: Use the env set above
        run: echo "\$GENERATED_VALUE"
\`\`\`

## Composite Actions — Reusable Steps

\`\`\`yaml
# .github/actions/setup-env/action.yml
name: 'Setup Environment'
description: 'Install tools and configure environment'
inputs:
  node-version:
    required: false
    default: '20'
  python-version:
    required: false
    default: '3.12'
outputs:
  node-path:
    description: 'Path to node binary'
    value: \${{ steps.setup-node.outputs.node-path }}

runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      id: setup-node
      with:
        node-version: \${{ inputs.node-version }}
    - uses: actions/setup-python@v5
      with:
        python-version: \${{ inputs.python-version }}
    - shell: bash
      run: pip install --upgrade pip pre-commit
\`\`\`

\`\`\`yaml
# Using the composite action:
steps:
  - uses: ./.github/actions/setup-env
    with:
      node-version: '22'
\`\`\`
`,
          interviewQuestions: [
            {
              question: "How do you pass data between jobs in GitHub Actions? What are the trade-offs of each method?",
              difficulty: "junior",
              answer: `There are three ways to pass data between jobs:

**1. Job outputs (for small values like IDs, version strings):**
\`\`\`yaml
jobs:
  build:
    outputs:
      image_tag: \${{ steps.tag.outputs.value }}
    steps:
      - id: tag
        run: echo "value=\${{ github.sha }}" >> \$GITHUB_OUTPUT

  deploy:
    needs: build
    steps:
      - run: echo "Deploying \${{ needs.build.outputs.image_tag }}"
\`\`\`
✅ Simple, fast. ❌ Limited to strings, max size (~1MB for the whole outputs object)

**2. Artifacts (for files, build outputs):**
\`\`\`yaml
jobs:
  build:
    steps:
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: {name: dist, path: dist/}

  deploy:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with: {name: dist, path: dist/}
\`\`\`
✅ For large files. ❌ Adds upload/download time (30s+), costs storage, 90-day expiry by default.

**3. Cache (for reusable build dependencies):**
Not for passing data between jobs in the same run — cache is for sharing across runs.

**4. External storage (for large data, production patterns):**
Upload to S3/GCS in one job, download in another. More reliable for large datasets, survives across workflow runs.

**Rule of thumb:** job outputs for small values, artifacts for build products, external storage for large/critical data.`,
            },
            {
              question: "Your CI workflow takes 25 minutes per run. How do you reduce it to under 5 minutes?",
              difficulty: "mid",
              answer: `**Step 1 — Profile where the time goes:**
\`\`\`bash
# Look at the workflow run visualization in GitHub UI
# Or use: actionlint + timing data
\`\`\`

**Common bottlenecks and fixes:**

**1. Dependency installation (npm ci, pip install, go mod download):**
\`\`\`yaml
# Enable caching:
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm  # saves 2-5 minutes per run
\`\`\`

**2. Sequential jobs that could be parallel:**
\`\`\`yaml
# BAD: lint → test → build (sequential, 25 min total)
# GOOD: lint and test in parallel, then build
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]
  test:
    runs-on: ubuntu-latest
    steps: [...]
  build:
    needs: [lint, test]  # waits for both, but they ran in parallel
    steps: [...]
\`\`\`

**3. Slow tests — parallelize with matrix:**
\`\`\`yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]  # split test suite into 4 parallel shards
steps:
  - run: npx jest --shard=\${{ matrix.shard }}/4
\`\`\`

**4. Docker builds — use layer caching:**
\`\`\`yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
# Saves 5-15 minutes for builds with stable dependencies
\`\`\`

**5. Path-based filtering — skip irrelevant jobs:**
\`\`\`yaml
on:
  push:
    paths: ['src/**', 'package.json']  # ignore doc changes
\`\`\`

**6. Merge queue / batching:**
Instead of running CI on every push, use GitHub's merge queue to batch commits.

**Expected result:** With caching, parallelism, and sharding: 25 min → 3-5 min.`,
            },
          ],
        },
      ],
    },
    {
      id: "advanced-actions",
      title: "Advanced Patterns & Security",
      level: "advanced",
      description: "Reusable workflows, self-hosted runners, and supply chain security.",
      lessons: [
        {
          id: "reusable-workflows",
          title: "Reusable Workflows & Secrets Management",
          duration: 22,
          type: "lesson",
          description: "Build organization-wide CI/CD templates with reusable workflows.",
          objectives: [
            "Create and call reusable workflows with typed inputs and secrets",
            "Implement centralized workflow templates across an organization",
            "Use repository environments for deployment protection",
            "Apply branch protection rules with required status checks",
          ],
          content: `# Reusable Workflows & Organization Patterns

## Reusable Workflows

Reusable workflows let you DRY up CI/CD across repositories:

\`\`\`yaml
# .github/workflows/reusable-build.yml (in a central repo or same repo)
name: Reusable Build

on:
  workflow_call:
    inputs:
      image-name:
        required: true
        type: string
      push:
        required: false
        type: boolean
        default: false
      environment:
        required: false
        type: string
        default: staging
    secrets:
      registry-token:
        required: true
    outputs:
      image-tag:
        description: "The full image tag built"
        value: \${{ jobs.build.outputs.image-tag }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: \${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.registry-token }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/myorg/\${{ inputs.image-name }}
          tags: |
            type=sha
            type=ref,event=branch
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v5
        with:
          push: \${{ inputs.push }}
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
\`\`\`

\`\`\`yaml
# Calling the reusable workflow:
name: CI

on:
  push:
    branches: [main]

jobs:
  build-api:
    uses: myorg/.github/.github/workflows/reusable-build.yml@main
    with:
      image-name: api-service
      push: true
    secrets:
      registry-token: \${{ secrets.GITHUB_TOKEN }}

  deploy:
    needs: build-api
    runs-on: ubuntu-latest
    steps:
      - run: echo "Image: \${{ needs.build-api.outputs.image-tag }}"
\`\`\`

## Organization-Wide Workflow Templates

\`\`\`
myorg/.github repository (special repo):
├── workflow-templates/
│   ├── node-ci.yml           # template
│   └── node-ci.properties.json  # metadata
└── .github/workflows/
    └── reusable-*.yml        # reusable workflows
\`\`\`

\`\`\`json
// node-ci.properties.json
{
  "name": "Node.js CI",
  "description": "Standard Node.js CI with lint, test, and build",
  "iconName": "octicon package",
  "categories": ["JavaScript"]
}
\`\`\`

## Environment Protection Rules

\`\`\`yaml
jobs:
  deploy-production:
    environment:
      name: production
      url: https://myapp.com    # shown in workflow UI

    # Configured in GitHub Settings → Environments:
    # - Required reviewers (manual approval gate)
    # - Wait timer (15 min delay before deploy)
    # - Deployment branches (only 'main' can deploy)
    # - Environment-specific secrets
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
        env:
          PROD_KEY: \${{ secrets.PROD_DEPLOY_KEY }}  # environment secret
\`\`\`

## Security — Pinning Actions by SHA

\`\`\`yaml
steps:
  # BAD — tag can be force-pushed (supply chain attack):
  - uses: actions/checkout@v4

  # GOOD — SHA cannot be changed (immutable):
  - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
  - uses: actions/setup-node@cdca7365b2dadb8aad0a33bc7601856ffabcc48e  # v4.1.0

  # Use tools like Dependabot or Renovate to auto-update pinned SHAs
\`\`\`

\`\`\`yaml
# .github/dependabot.yml — auto-update action SHAs:
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    labels: ['dependencies', 'github-actions']
\`\`\`

## Secrets — Best Practices

\`\`\`yaml
# Secrets are masked in logs automatically
# But protect them in code:

steps:
  - name: Use secret safely
    env:
      # Always inject via env, not directly in run script
      API_KEY: \${{ secrets.API_KEY }}
    run: |
      # Good — env var, masked in logs
      curl -H "Authorization: Bearer \$API_KEY" https://api.example.com

      # BAD — would log the secret value:
      # curl -H "Authorization: Bearer \${{ secrets.API_KEY }}" ...

  - name: Don't echo secrets
    run: |
      # This leaks the secret even though it's "masked":
      # echo "\${{ secrets.API_KEY }}"
      # Masking isn't foolproof for all output patterns
\`\`\`

## Self-Hosted Runners

\`\`\`bash
# Register a self-hosted runner:
# 1. Go to Settings → Actions → Runners → Add runner
# 2. Follow instructions to install and configure

# Run as a service (Linux):
sudo ./svc.sh install
sudo ./svc.sh start

# Runner configuration (for ephemeral runners in Kubernetes):
# Use: actions-runner-controller (ARC)
\`\`\`

\`\`\`yaml
# Use self-hosted runners:
jobs:
  build:
    runs-on: [self-hosted, linux, x64, large]
    # 'large' is a custom label for high-resource runners

  gpu-test:
    runs-on: [self-hosted, gpu, linux]
\`\`\`

**Self-hosted runner security:**
\`\`\`yaml
# NEVER use self-hosted runners for public repositories
# An attacker can fork your repo and trigger workflows that run
# malicious code on your self-hosted runner

# Mitigation for public repos:
on:
  pull_request_target:
    # Only trigger if the PR author is a contributor, not an outsider
\`\`\`
`,
          interviewQuestions: [
            {
              question: "How do you prevent supply chain attacks in GitHub Actions workflows?",
              difficulty: "senior",
              answer: `Supply chain attacks in GitHub Actions occur when a malicious actor compromises an action you're using (e.g., via tag manipulation, typosquatting, or maintainer account compromise).

**Defense strategies:**

**1. Pin actions to commit SHA (not tags):**
\`\`\`yaml
# Attacker can push to v4 tag → your workflow runs malicious code
- uses: actions/checkout@v4  # vulnerable

# SHA is immutable — no one can change what this points to
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
\`\`\`

**2. Use Dependabot/Renovate to keep pinned SHAs updated:**
\`\`\`yaml
# .github/dependabot.yml
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule: {interval: weekly}
\`\`\`

**3. Restrict permissions (principle of least privilege):**
\`\`\`yaml
permissions:
  contents: read  # default — minimal access
# Only grant write when explicitly needed
\`\`\`

**4. Use only verified/trusted actions:**
- Prefer actions from github.com/actions/* (official)
- Check stars, activity, and code for third-party actions
- For critical workflows, vendor the action in your org

**5. Step Security Harden-Runner:**
\`\`\`yaml
- uses: step-security/harden-runner@v2
  with:
    egress-policy: audit  # block/audit unexpected network calls
    # Detects if an action tries to exfiltrate secrets
\`\`\`

**6. Audit logs:** Enable organization-level audit logs for all workflow runs.

**7. Secrets scanning:** Use GitHub Advanced Security or Gitleaks to ensure secrets don't leak into workflow outputs.

The most impactful single action: **pin all third-party actions by SHA**.`,
            },
            {
              question: "Design a CI/CD pipeline for a multi-service monorepo where each service should only deploy when its code changes.",
              difficulty: "senior",
              answer: `**The challenge:** A monorepo with services A, B, C — you don't want to deploy all services when only service A changed.

**Solution using path filtering and job outputs:**

\`\`\`yaml
name: Monorepo CI/CD

on:
  push:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      api: \${{ steps.changes.outputs.api }}
      frontend: \${{ steps.changes.outputs.frontend }}
      worker: \${{ steps.changes.outputs.worker }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # need previous commit for diff
      - uses: dorny/paths-filter@v3
        id: changes
        with:
          filters: |
            api:
              - 'services/api/**'
              - 'shared/lib/**'        # shared dep → rebuild api too
            frontend:
              - 'services/frontend/**'
              - 'shared/ui-components/**'
            worker:
              - 'services/worker/**'
              - 'shared/lib/**'

  build-api:
    needs: detect-changes
    if: needs.detect-changes.outputs.api == 'true'
    uses: ./.github/workflows/reusable-build.yml
    with:
      service: api
      push: true

  build-frontend:
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend == 'true'
    uses: ./.github/workflows/reusable-build.yml
    with:
      service: frontend
      push: true

  deploy:
    needs: [build-api, build-frontend, build-worker]
    if: always() && !failure() && !cancelled()
    runs-on: ubuntu-latest
    steps:
      - run: |
          # Only deploy changed services
          [[ "\${{ needs.build-api.result }}" == "success" ]] && ./deploy.sh api
          [[ "\${{ needs.build-frontend.result }}" == "success" ]] && ./deploy.sh frontend
\`\`\`

**Additional considerations:**
- **Shared libraries**: if \`shared/lib\` changes, rebuild ALL services that depend on it (handled by including it in each service's filter)
- **Deployment order**: if API has breaking changes and frontend must update together, use a combined deploy job
- **Rollback**: keep previous image tags in the registry, deploy script accepts version parameter
- **Integration tests**: run after all affected services deploy, against a staging environment`,
            },
          ],
        },
      ],
    },
  ],
};
