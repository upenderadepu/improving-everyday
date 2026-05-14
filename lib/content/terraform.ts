import type { Track } from "./types";

export const terraformTrack: Track = {
  id: "terraform",
  title: "Terraform",
  description: "Infrastructure as Code from fundamentals to production",
  longDescription:
    "Master Terraform from HCL syntax to production-scale patterns — state management, modules, workspaces, CI/CD integration, and managing real cloud infrastructure on AWS/GCP/Azure.",
  icon: "Server",
  color: "#7c3aed",
  gradient: "track-terraform-gradient",
  tags: ["iac", "devops", "cloud", "automation"],
  modules: [
    {
      id: "iac-foundations",
      title: "Infrastructure as Code Fundamentals",
      level: "beginner",
      description: "Understand IaC principles and Terraform's architecture.",
      lessons: [
        {
          id: "what-is-iac",
          title: "What is Infrastructure as Code?",
          duration: 15,
          type: "lesson",
          description: "Understand why IaC exists, its benefits, and how Terraform fits in.",
          objectives: [
            "Explain the problems IaC solves vs. manual provisioning",
            "Compare Terraform to CloudFormation, Pulumi, and Ansible",
            "Understand Terraform's declarative model and idempotency",
            "Describe the Terraform workflow: write → plan → apply",
          ],
          content: `# Infrastructure as Code

## The Problem Before IaC

Before IaC, infrastructure was managed manually:

\`\`\`
Week 1: Engineer SSHes into server, installs packages, edits config files
Week 4: Another engineer SSHes in, changes some settings (undocumented)
Week 8: Server crashes. How do you rebuild it exactly?

Problems:
- Snowflake servers (each one is unique, undocumented)
- No version history ("who changed the firewall rule?")
- Slow scaling (manual steps take hours/days)
- Drift (what the docs say ≠ what's actually deployed)
- No testing ("hope it works" deployment strategy)
\`\`\`

## IaC Principles

**Declarative vs. Imperative:**

\`\`\`python
# Imperative (how): step-by-step instructions
server = create_server("t3.micro")
attach_security_group(server, create_sg([80, 443]))
attach_eip(server)

# Declarative (what): describe desired state
resource "aws_instance" "web" {
  instance_type = "t3.micro"
  security_groups = [aws_security_group.web.id]
}
# Terraform figures out HOW to make it happen
\`\`\`

**Idempotency**: Running Terraform 10 times produces the same result. If the infrastructure already matches the code, nothing changes.

**Immutability**: Rather than modifying servers in place (mutable), IaC creates new infrastructure and destroys the old. This eliminates configuration drift.

## Terraform vs. Alternatives

| Tool | Approach | Language | State | Use Case |
|------|----------|----------|-------|----------|
| Terraform | Declarative | HCL | Yes (remote) | Multi-cloud infra |
| CloudFormation | Declarative | JSON/YAML | Managed by AWS | AWS-only |
| Pulumi | Declarative | TypeScript/Python/Go | Yes | Developers prefer code over DSL |
| Ansible | Imperative | YAML | No (agentless) | Config mgmt, post-provisioning |
| CDK | Declarative | TypeScript/Python | Via CF | AWS, generates CF templates |

**When to use Terraform:**
- Multi-cloud or cloud-agnostic requirements
- Complex dependency graphs between resources
- Team already using HCL
- Need robust state management and import capabilities

## The Terraform Workflow

\`\`\`bash
# 1. Write — create .tf files describing desired state
# 2. Init — download providers and modules
terraform init

# 3. Plan — diff current state vs. desired state
terraform plan
# Shows: what will be created (+), changed (~), or destroyed (-)
# ALWAYS review before applying

# 4. Apply — execute the changes
terraform apply       # prompts for approval
terraform apply -auto-approve  # CI/CD (dangerous without plan review)

# 5. Destroy — tear everything down
terraform destroy
\`\`\`

## Terraform Architecture

\`\`\`
┌──────────────────────────────────────────┐
│           Your .tf Files (HCL)           │
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│         Terraform Core                    │
│  - Plan engine (dependency graph)         │
│  - State management                       │
│  - Module resolution                      │
└────────────────────┬─────────────────────┘
                     │ Provider API
┌────────────────────▼─────────────────────┐
│         Providers (plugins)               │
│  hashicorp/aws, hashicorp/google,         │
│  hashicorp/azurerm, hashicorp/kubernetes  │
└────────────────────┬─────────────────────┘
                     │ SDK calls
┌────────────────────▼─────────────────────┐
│         Cloud APIs (AWS, GCP, Azure)      │
└──────────────────────────────────────────┘
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What is the difference between declarative and imperative IaC? Which is Terraform?",
              difficulty: "junior",
              answer: `**Imperative IaC** describes the *steps* to reach a desired state — like a recipe. You write "create server, then attach security group, then configure load balancer." If you run it twice, it creates two servers.

**Declarative IaC** describes the *desired end state*. You write "I want a server with these properties and this security group." The tool figures out how to get there from the current state. Running it twice is a no-op if the state already matches.

**Terraform is declarative.** You describe what you want:
\`\`\`hcl
resource "aws_instance" "web" {
  instance_type = "t3.micro"
  ami           = "ami-abc123"
}
\`\`\`

Terraform compares this to the current state (what's actually in AWS) and calculates the minimal set of changes to reach the desired state. If the instance already exists with those properties, nothing changes (idempotency).

**The key benefit of declarative:** Infrastructure code becomes self-documenting — the code IS the documentation of what exists. With imperative scripts, you'd need to run them and check what they created.

**Comparison:**
- Ansible: primarily imperative (though it tries to be idempotent)
- CloudFormation: declarative
- Terraform: declarative
- Shell scripts: imperative`,
            },
            {
              question: "What happens when Terraform has a plan that destroys a production database? How do you prevent accidental destruction?",
              difficulty: "mid",
              answer: `**Prevention strategies:**

**1. lifecycle prevent_destroy:**
\`\`\`hcl
resource "aws_db_instance" "production" {
  identifier = "prod-postgres"
  # ...
  lifecycle {
    prevent_destroy = true  # Terraform errors if anything tries to destroy this
  }
}
\`\`\`
Terraform will refuse to plan a destroy of this resource with an error message.

**2. Automated plan review in CI/CD:**
\`\`\`yaml
- name: Check for destructive changes
  run: |
    terraform plan -out=plan.tfplan
    terraform show -json plan.tfplan | jq '
      .resource_changes[] | 
      select(.change.actions[] == "delete") |
      "DESTRUCTION: \(.address)"
    '
    # Fail the pipeline if any deletions are detected for protected resources
\`\`\`

**3. Separate state for databases:**
Keep long-lived stateful resources (DBs, S3 buckets) in a separate state file from application infrastructure. They have different lifecycles and destruction risk profiles.

**4. Required manual approval in CI:**
\`\`\`yaml
environment:
  name: production
# GitHub Environment requires human approval before apply runs
\`\`\`

**5. Delete protection at cloud level:**
- AWS RDS: enable deletion protection in the resource AND in the console
- S3: enable MFA delete
- AWS: use SCPs (Service Control Policies) to deny delete actions on tagged critical resources

**6. Backup and recovery:**
Even with all protections, always have automated snapshots: RDS automated backups, S3 versioning, regular pg_dump to a separate location.

**If you see a destruction in plan and it's unexpected:** Stop, investigate why Terraform thinks it needs to destroy. Often it's a \`name\` or \`identifier\` change that forces recreation. Use \`terraform state mv\` or add lifecycle \`ignore_changes\` to prevent.`,
            },
          ],
        },
        {
          id: "hcl-syntax",
          title: "HCL Syntax Deep Dive",
          duration: 20,
          type: "lesson",
          description: "Master HCL — resources, variables, locals, data sources, and expressions.",
          objectives: [
            "Write resources, variables, outputs, and locals",
            "Use data sources to query existing infrastructure",
            "Apply for_each and count for resource repetition",
            "Write dynamic blocks for complex nested configurations",
          ],
          content: `# HCL Syntax Deep Dive

## Core Resource Syntax

\`\`\`hcl
# resource "<provider>_<type>" "<local_name>" { }
resource "aws_instance" "web_server" {
  # Required arguments:
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  # Optional arguments:
  tags = {
    Name        = "web-\${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  # Nested blocks:
  root_block_device {
    volume_size = 20
    encrypted   = true
  }

  lifecycle {
    create_before_destroy = true  # blue-green replacement
    prevent_destroy       = false
    ignore_changes        = [tags["LastUpdated"]]  # ignore specific tag changes
  }
}

# Reference another resource's attribute:
resource "aws_eip" "web" {
  instance = aws_instance.web_server.id   # implicit dependency
  domain   = "vpc"
}
\`\`\`

## Variables

\`\`\`hcl
# variables.tf
variable "environment" {
  description = "Deployment environment (dev/staging/prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_types" {
  type = map(string)
  default = {
    dev     = "t3.micro"
    staging = "t3.small"
    prod    = "t3.large"
  }
}

variable "allowed_cidrs" {
  type    = list(string)
  default = ["10.0.0.0/8"]
}

variable "db_config" {
  type = object({
    instance_class    = string
    allocated_storage = number
    multi_az          = bool
  })
  sensitive = true  # masked in plan output and logs
}
\`\`\`

\`\`\`bash
# Set variable values (multiple methods, in priority order):
# 1. CLI flag (highest priority):
terraform apply -var="environment=prod"
terraform apply -var-file="prod.tfvars"

# 2. terraform.tfvars (auto-loaded):
# environment = "staging"

# 3. *.auto.tfvars (auto-loaded):
# any file ending in .auto.tfvars

# 4. TF_VAR_ environment variables:
export TF_VAR_environment=prod

# 5. Default in variable block (lowest priority)
\`\`\`

## Locals — Computed Values

\`\`\`hcl
locals {
  # Computed from variables:
  instance_type = var.instance_types[var.environment]
  
  # Standardized naming:
  name_prefix = "\${var.project}-\${var.environment}"
  
  # Common tags applied everywhere:
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Repo        = "github.com/myorg/infra"
  }
  
  # Complex expressions:
  az_count = length(data.aws_availability_zones.available.names)
}

resource "aws_instance" "web" {
  instance_type = local.instance_type
  tags          = merge(local.common_tags, { Name = "\${local.name_prefix}-web" })
}
\`\`\`

## Data Sources — Query Existing Resources

\`\`\`hcl
# Query existing resources (not managed by this Terraform):
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical's AWS account

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-22.04-amd64-server-*"]
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_vpc" "default" {
  default = true
}

data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state"
    key    = "network/terraform.tfstate"
    region = "us-east-1"
  }
}

# Use data source outputs:
resource "aws_instance" "web" {
  ami               = data.aws_ami.ubuntu.id
  availability_zone = data.aws_availability_zones.available.names[0]
  subnet_id         = data.terraform_remote_state.network.outputs.public_subnet_ids[0]
}
\`\`\`

## count and for_each — Resource Repetition

\`\`\`hcl
# count — simple repetition (use for identical resources):
resource "aws_instance" "workers" {
  count         = var.worker_count
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  
  tags = {
    Name = "worker-\${count.index}"  # worker-0, worker-1, ...
  }
}

# Reference: aws_instance.workers[0].id, aws_instance.workers[*].id

# for_each — distinct named resources (preferred for maps/sets):
variable "subnets" {
  default = {
    "public-a"  = { cidr = "10.0.1.0/24", az = "us-east-1a" }
    "public-b"  = { cidr = "10.0.2.0/24", az = "us-east-1b" }
    "private-a" = { cidr = "10.0.11.0/24", az = "us-east-1a" }
  }
}

resource "aws_subnet" "subnets" {
  for_each          = var.subnets
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az
  
  tags = {
    Name = each.key  # "public-a", "public-b", "private-a"
  }
}

# Reference: aws_subnet.subnets["public-a"].id
# List all IDs: [for k, v in aws_subnet.subnets : v.id]
\`\`\`

## Outputs

\`\`\`hcl
# outputs.tf
output "instance_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web_server.public_ip
}

output "db_endpoint" {
  description = "Database connection endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true  # masked in output, but still in state
}

output "subnet_ids" {
  value = [for k, v in aws_subnet.subnets : v.id if startswith(k, "public")]
}
\`\`\`

## Dynamic Blocks

\`\`\`hcl
variable "ingress_rules" {
  default = [
    { port = 80, protocol = "tcp", cidrs = ["0.0.0.0/0"] },
    { port = 443, protocol = "tcp", cidrs = ["0.0.0.0/0"] },
    { port = 22, protocol = "tcp", cidrs = ["10.0.0.0/8"] },
  ]
}

resource "aws_security_group" "web" {
  name   = "web-sg"
  vpc_id = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidrs
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
\`\`\`
`,
          interviewQuestions: [
            {
              question: "When would you use count vs for_each? What are the dangers of count?",
              difficulty: "mid",
              answer: `**Use count when:** Resources are truly identical and only differ in number. Example: 3 identical worker nodes.

**Use for_each when:** Resources are named/distinct and differ in properties. Example: subnets in different AZs with different CIDR blocks.

**The danger of count — index-based addressing:**

With \`count = 3\`, Terraform tracks resources as:
- \`aws_instance.workers[0]\`
- \`aws_instance.workers[1]\`
- \`aws_instance.workers[2]\`

If you remove the middle worker (now count = 2), Terraform:
- Keeps \`[0]\` unchanged
- **Destroys \`[2]\`** (old worker-2)
- **Recreates \`[1]\`** with what was worker-2's config

This is dangerous — removing one resource in the middle destroys and recreates all subsequent resources.

**with for_each — name-based addressing:**
\`\`\`hcl
for_each = toset(["worker-a", "worker-b", "worker-c"])
# Tracked as: workers["worker-a"], workers["worker-b"], workers["worker-c"]
\`\`\`
Removing "worker-b" only destroys "worker-b". "worker-a" and "worker-c" are untouched.

**Rule of thumb:** Default to for_each. Use count only for truly interchangeable resources (like copies of a load balancer target) or when creating zero or one resource conditionally:
\`\`\`hcl
count = var.create_bastion ? 1 : 0  # conditional creation
\`\`\``,
            },
            {
              question: "Explain Terraform data sources. When do you use them vs. resource references?",
              difficulty: "junior",
              answer: `**Data sources** let you query existing infrastructure that is NOT managed by the current Terraform configuration — they are read-only.

**Use data sources when:**
1. Infrastructure was created manually or by another team/tool
2. Resources are shared across Terraform configurations (e.g., a VPC managed by a network team)
3. You need dynamic values from the cloud provider (latest AMI, available AZs)
4. Reading outputs from another Terraform state

\`\`\`hcl
# Query the latest Amazon Linux 2023 AMI:
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# Use in a resource:
resource "aws_instance" "web" {
  ami = data.aws_ami.al2023.id  # always gets latest
}
\`\`\`

**Use resource references when:** The infrastructure IS managed by this Terraform config:
\`\`\`hcl
resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id  # reference, not data source
}
\`\`\`

**Key difference:** Data sources create an implicit read-only reference. Resource references create a dependency and Terraform manages the lifecycle. If you accidentally use a data source for something Terraform owns, you'll break the dependency graph and Terraform won't know to wait for the resource to exist before referencing it.`,
            },
          ],
        },
      ],
    },
    {
      id: "terraform-core",
      title: "State Management & Providers",
      level: "intermediate",
      description: "Master Terraform state, remote backends, and provider configuration.",
      lessons: [
        {
          id: "state-management",
          title: "Terraform State Deep Dive",
          duration: 22,
          type: "lesson",
          description: "Understand Terraform state, remote backends, and state file operations.",
          objectives: [
            "Explain what Terraform state contains and why it's essential",
            "Configure remote backends (S3, Terraform Cloud) with locking",
            "Use terraform state commands for surgery",
            "Handle state corruption and recovery",
          ],
          content: `# Terraform State Deep Dive

## What is Terraform State?

State is a JSON file that maps your HCL resources to real-world infrastructure:

\`\`\`json
{
  "version": 4,
  "terraform_version": "1.6.0",
  "resources": [
    {
      "type": "aws_instance",
      "name": "web_server",
      "provider": "provider[\\"registry.terraform.io/hashicorp/aws\\"]",
      "instances": [
        {
          "attributes": {
            "id": "i-0a1b2c3d4e5f",
            "ami": "ami-0c55b159cbfafe1f0",
            "instance_type": "t3.micro",
            "public_ip": "54.201.3.100",
            "private_ip": "10.0.1.50",
            "tags": {"Name": "web-prod"},
            ...
          }
        }
      ]
    }
  ]
}
\`\`\`

**Why state is critical:**
- Maps resource addresses (e.g., \`aws_instance.web_server\`) to real IDs (e.g., \`i-0a1b2c3d4e5f\`)
- Tracks resource metadata not in the plan
- Enables dependency graph construction
- Enables change detection (current state vs. desired state)
- Without state: Terraform would try to create everything fresh every apply

## Remote Backends

Local state (\`terraform.tfstate\`) is a disaster waiting to happen in teams:
- Multiple engineers can apply simultaneously → corruption
- State file contains sensitive values → security risk
- No audit trail of who applied what

**S3 Backend with DynamoDB Locking:**

\`\`\`hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/web/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true         # SSE-S3 encryption
    kms_key_id     = "arn:aws:kms:..."  # SSE-KMS for better audit
    
    # DynamoDB for state locking (prevents concurrent applies):
    dynamodb_table = "terraform-state-lock"
    
    # Optional: versioning (enable on the S3 bucket for state history)
  }
  
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # allow 5.x, not 6.x
    }
  }
}
\`\`\`

\`\`\`bash
# Bootstrap state infrastructure (chicken-and-egg: use CLI first):
aws s3 mb s3://mycompany-terraform-state --region us-east-1
aws s3api put-bucket-versioning --bucket mycompany-terraform-state \\
  --versioning-configuration Status=Enabled

aws dynamodb create-table \\
  --table-name terraform-state-lock \\
  --attribute-definitions AttributeName=LockID,AttributeType=S \\
  --key-schema AttributeName=LockID,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST

# Migrate local state to remote:
terraform init  # detects new backend, prompts to migrate
\`\`\`

## State Commands — Surgery

\`\`\`bash
# List all resources in state:
terraform state list
# aws_instance.web_server
# aws_s3_bucket.assets
# module.vpc.aws_vpc.main

# Show details of a resource in state:
terraform state show aws_instance.web_server

# Move a resource (rename in HCL without destroying):
terraform state mv aws_instance.web aws_instance.web_server
# Use case: you renamed a resource in HCL

# Remove from state without destroying (let someone else manage it):
terraform state rm aws_instance.web_server
# The EC2 instance still exists, Terraform just stops tracking it

# Import existing infrastructure into state:
terraform import aws_instance.web_server i-0a1b2c3d4e5f
# Brings unmanaged resource under Terraform management

# Pull state to local file:
terraform state pull > backup.tfstate

# Push state from file (DANGEROUS — overwrites remote):
terraform state push backup.tfstate
\`\`\`

## State Workspaces

\`\`\`bash
# Workspaces = separate state files in the same backend
terraform workspace new staging
terraform workspace new production
terraform workspace list
# * default
#   staging
#   production

terraform workspace select production
terraform apply  # applies against production state

# Use in code:
locals {
  env = terraform.workspace  # "production", "staging", "default"
}

resource "aws_instance" "web" {
  instance_type = local.env == "production" ? "t3.large" : "t3.micro"
}
\`\`\`

## Sensitive State Values

\`\`\`bash
# State files contain ALL resource attributes including secrets!
# Database passwords, private keys, etc. are in state in plaintext

# Always:
# 1. Encrypt state backend (S3 SSE-KMS)
# 2. Restrict access to state bucket (IAM policies)
# 3. Enable S3 access logging
# 4. Never commit state files to git

# Check for sensitive values:
terraform state show aws_db_instance.main | grep password
# If it shows, the state has the password. Encrypt your backend!
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What happens if two engineers run terraform apply simultaneously without state locking?",
              difficulty: "mid",
              answer: `**State corruption scenario:**

1. Engineer A runs \`terraform apply\` — reads state, starts creating resources
2. Engineer B runs \`terraform apply\` simultaneously — reads the SAME state (doesn't know about A's changes)
3. Both write their results back to state
4. The last write wins — one engineer's changes are lost from state
5. State now doesn't match reality — some resources exist but aren't in state

**Consequences:**
- Orphaned resources (exist in AWS but not in state → Terraform will try to create duplicates next run)
- Duplicate resources (Terraform creates new ones, not knowing old ones exist)
- Resource conflicts (two instances with the same name)
- Failed plans (state references resources that were already deleted)

**State locking prevents this:**
\`\`\`hcl
backend "s3" {
  dynamodb_table = "terraform-state-lock"  # atomic lock
}
\`\`\`

When Engineer A applies, DynamoDB creates a lock record. Engineer B's apply sees the lock and waits (or fails with "state is locked by another process"). After A finishes, the lock is released.

**Lock details in DynamoDB:**
\`\`\`bash
# Check current lock status:
aws dynamodb get-item \\
  --table-name terraform-state-lock \\
  --key '{"LockID": {"S": "mycompany-terraform-state/prod/terraform.tfstate"}}'

# Force-unlock (if a process died and left a stale lock):
terraform force-unlock <lock-id>  # use with extreme caution
\`\`\``,
            },
            {
              question: "How do you import existing AWS resources into Terraform without destroying them?",
              difficulty: "mid",
              answer: `**The import workflow:**

**Step 1 — Write the HCL resource block first:**
\`\`\`hcl
resource "aws_instance" "legacy_server" {
  ami           = "ami-abc123"  # fill in the actual values
  instance_type = "t3.large"
  tags          = { Name = "legacy-server" }
}
\`\`\`

**Step 2 — Import the resource:**
\`\`\`bash
# Find the resource ID (from AWS console or CLI):
aws ec2 describe-instances --filters Name=tag:Name,Values=legacy-server \\
  --query 'Reservations[].Instances[].InstanceId' --output text
# i-0a1b2c3d4e5f

# Import:
terraform import aws_instance.legacy_server i-0a1b2c3d4e5f
# Fetches all attributes from AWS and adds to state
\`\`\`

**Step 3 — Fix drift (the tricky part):**
\`\`\`bash
# Run plan to see differences between your HCL and actual resource:
terraform plan
# Shows: ~ aws_instance.legacy_server (change security_group from [...] to [...])
# You need to update your HCL to match reality, or accept the changes

# Iteratively update your HCL until plan shows "No changes"
\`\`\`

**Terraform 1.5+ Import Block (modern approach):**
\`\`\`hcl
# import.tf — declarative import
import {
  to = aws_instance.legacy_server
  id = "i-0a1b2c3d4e5f"
}

# Can also auto-generate the resource configuration:
\`\`\`
\`\`\`bash
terraform plan -generate-config-out=generated.tf
# Generates HCL from the actual AWS resource — a great starting point
\`\`\`

**Importing modules:**
\`\`\`bash
terraform import 'module.vpc.aws_vpc.main' vpc-0a1b2c3d
\`\`\`

**Important:** Never use \`terraform state push\` to manually add resources to state — that bypasses validation and can corrupt the state.`,
            },
          ],
        },
        {
          id: "variables-outputs",
          title: "Variables, Outputs & Modules",
          duration: 18,
          type: "lesson",
          description: "Structure Terraform code with modules for reusability.",
          objectives: [
            "Build reusable modules with versioned interfaces",
            "Use the Terraform Registry and version constraints",
            "Implement module composition patterns",
            "Understand provider inheritance in modules",
          ],
          content: `# Terraform Modules

Modules are reusable, versioned infrastructure components — Terraform's equivalent of functions or packages.

## Module Structure

\`\`\`
modules/
└── vpc/
    ├── main.tf         # resources
    ├── variables.tf    # inputs
    ├── outputs.tf      # outputs
    ├── versions.tf     # required_providers
    └── README.md       # documentation
\`\`\`

\`\`\`hcl
# modules/vpc/variables.tf
variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  
  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "Must be a valid CIDR block."
  }
}

variable "enable_nat_gateway" {
  description = "Create NAT gateways for private subnets"
  type        = bool
  default     = true
}

variable "azs" {
  description = "Availability zones to use"
  type        = list(string)
}
\`\`\`

\`\`\`hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "\${var.name}-vpc"
  }
}

resource "aws_subnet" "public" {
  for_each = toset(var.azs)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.cidr_block, 8, index(var.azs, each.value))
  availability_zone = each.value
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}
\`\`\`

\`\`\`hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = [for s in aws_subnet.public : s.id]
}
\`\`\`

## Using Modules

\`\`\`hcl
# Root module / main.tf

# Local module:
module "vpc" {
  source = "./modules/vpc"
  
  name       = "prod"
  cidr_block = "10.0.0.0/16"
  azs        = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = true
}

# Public registry module:
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"   # SemVer constraint: 6.x only, not 7.x
  
  identifier     = "prod-postgres"
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.medium"
  
  db_name  = "appdb"
  username = "dbadmin"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = module.vpc.database_subnet_group_name
}

# Use module outputs:
resource "aws_instance" "app" {
  subnet_id = module.vpc.public_subnet_ids[0]
}

output "db_endpoint" {
  value = module.rds.db_instance_endpoint
}
\`\`\`

## Version Constraints

\`\`\`hcl
# ~> 5.0   = >= 5.0.0, < 6.0.0 (patch and minor updates)
# ~> 5.20  = >= 5.20.0, < 5.21.0 (patch updates only)
# >= 5.0   = any version >= 5.0
# >= 5.0, < 6.0  = explicit range (same as ~> 5.0)

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
\`\`\`

\`\`\`bash
# Update providers (respecting version constraints):
terraform init -upgrade

# Lock file (.terraform.lock.hcl) pins exact versions:
# Commit this file to git for reproducible builds!
cat .terraform.lock.hcl
# provider "registry.terraform.io/hashicorp/aws" {
#   version     = "5.31.0"
#   constraints = "~> 5.0"
#   hashes = [...]
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What is the Terraform lock file (.terraform.lock.hcl) and why should you commit it?",
              difficulty: "junior",
              answer: `The lock file (\`.terraform.lock.hcl\`) pins the exact versions of all providers used in a Terraform configuration, along with cryptographic hashes to verify integrity.

**Why it exists:** Version constraints like \`~> 5.0\` are ranges, not exact versions. Without a lock file, \`terraform init\` might download 5.20.0 today and 5.31.0 next month — different behavior from the same code.

**Why commit it to git:**
1. **Reproducibility**: Every engineer and CI/CD run uses exactly the same provider version
2. **Security**: Hashes prevent supply chain attacks (a compromised provider binary won't match the recorded hash)
3. **Auditability**: See exactly which provider version was introduced when

\`\`\`
# .terraform.lock.hcl
provider "registry.terraform.io/hashicorp/aws" {
  version     = "5.31.0"          # exact version pinned
  constraints = "~> 5.0"          # original constraint
  hashes = [
    "h1:abc123...",                # hash of the zip for this platform
    "zh:def456...",                # SHA256 of the zip (multi-platform)
  ]
}
\`\`\`

**Updating providers:**
\`\`\`bash
# Update to latest allowed by constraints:
terraform init -upgrade
# Updates .terraform.lock.hcl with new version and hashes
# Review the diff, commit the updated lock file
\`\`\`

**What NOT to commit:** \`.terraform/\` directory (downloaded providers/modules — these are large and platform-specific). Only the lock file goes to git.`,
            },
          ],
        },
      ],
    },
    {
      id: "terraform-cicd",
      title: "Terraform in CI/CD",
      level: "advanced",
      description: "Automate Terraform with CI/CD pipelines and policy enforcement.",
      lessons: [
        {
          id: "terraform-pipelines",
          title: "Terraform CI/CD Pipelines",
          duration: 25,
          type: "lesson",
          description: "Build safe, reviewable Terraform automation in GitHub Actions.",
          objectives: [
            "Implement the plan-then-apply pattern with manual approval",
            "Use Atlantis or Terraform Cloud for PR-based workflows",
            "Apply policy enforcement with OPA or Sentinel",
            "Handle multiple environments with workspaces or separate states",
          ],
          content: `# Terraform CI/CD Pipelines

## The Core Problem — Automation vs. Safety

Running \`terraform apply\` automatically is dangerous:
- Unexpected changes could destroy production
- No code review of the infrastructure changes
- No audit trail of what was applied and when

**The safe pattern:**
1. Developer opens PR with Terraform changes
2. CI runs \`terraform plan\` and posts the plan as a PR comment
3. Team reviews the plan (like reviewing a diff)
4. After approval, merge to main triggers \`terraform apply\`

## GitHub Actions Pipeline

\`\`\`yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths: ['infra/**']
  push:
    branches: [main]
    paths: ['infra/**']

permissions:
  contents: read
  pull-requests: write
  id-token: write  # for OIDC auth with AWS

env:
  TF_VERSION: "1.6.0"
  AWS_REGION: "us-east-1"

jobs:
  terraform:
    name: Terraform Plan / Apply
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: infra/

    steps:
      - uses: actions/checkout@v4

      # OIDC auth with AWS (no stored credentials):
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-terraform-role
          aws-region: \${{ env.AWS_REGION }}

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: \${{ env.TF_VERSION }}

      - name: Terraform Init
        id: init
        run: terraform init

      - name: Terraform Validate
        id: validate
        run: terraform validate -no-color

      - name: Terraform Plan
        id: plan
        if: github.event_name == 'pull_request'
        run: terraform plan -no-color -out=plan.tfplan
        continue-on-error: true  # post plan even if it fails

      - name: Post Plan to PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const output = \`#### Terraform Plan
            \\\`\\\`\\\`
            \${{ steps.plan.outputs.stdout }}
            \\\`\\\`\\\`
            *Pushed by: @\${{ github.actor }}*\`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

      - name: Terraform Plan Status
        if: steps.plan.outcome == 'failure'
        run: exit 1

      # Apply only on merge to main:
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve
\`\`\`

## Policy as Code — OPA / Sentinel

\`\`\`hcl
# OPA policy: prevent unencrypted S3 buckets
# policies/s3_encryption.rego

package terraform.s3

deny[msg] {
  resource := input.planned_values.root_module.resources[_]
  resource.type == "aws_s3_bucket"
  
  # Find the encryption config
  not resource_has_encryption(resource)
  
  msg := sprintf("S3 bucket '%v' must have server-side encryption enabled", [resource.address])
}

resource_has_encryption(resource) {
  input.planned_values.root_module.resources[_].type == "aws_s3_bucket_server_side_encryption_configuration"
}
\`\`\`

\`\`\`bash
# Run OPA against terraform plan:
terraform show -json plan.tfplan > plan.json
opa eval --data policies/ --input plan.json "data.terraform.s3.deny" | jq '.'

# Integrate into CI:
- name: Policy Check
  run: |
    terraform show -json plan.tfplan > plan.json
    VIOLATIONS=\$(opa eval --data policies/ --input plan.json "data.terraform.deny" --format raw)
    if [ "\$VIOLATIONS" != "[]" ]; then
      echo "Policy violations found:"
      echo \$VIOLATIONS
      exit 1
    fi
\`\`\`

## Multi-Environment Pattern

\`\`\`
infra/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── backend.tf      # state: s3://bucket/dev/terraform.tfstate
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── backend.tf      # state: s3://bucket/staging/terraform.tfstate
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── backend.tf      # state: s3://bucket/prod/terraform.tfstate
│       └── terraform.tfvars
└── modules/
    ├── vpc/
    ├── eks/
    └── rds/
\`\`\`

\`\`\`hcl
# environments/production/main.tf
module "vpc" {
  source = "../../modules/vpc"
  # Use production-sized config:
  cidr_block         = "10.0.0.0/16"
  enable_nat_gateway = true
  single_nat_gateway = false  # HA: one per AZ
}
\`\`\`

## Drift Detection

\`\`\`yaml
# Scheduled workflow to detect drift (someone changed infra outside Terraform):
name: Drift Detection
on:
  schedule:
    - cron: '0 6 * * 1-5'  # Monday-Friday at 6 AM UTC

jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for drift
        run: |
          terraform plan -detailed-exitcode
          # Exit code 0 = no changes
          # Exit code 1 = error
          # Exit code 2 = changes detected (drift!)
        continue-on-error: true

      - name: Alert on drift
        if: steps.drift.outcome == 'failure'
        run: |
          # Send Slack notification, create GitHub issue, etc.
          gh issue create --title "Infrastructure drift detected" \\
            --body "Terraform plan shows differences in production"
\`\`\`
`,
          interviewQuestions: [
            {
              question: "Walk me through how you would set up a safe Terraform CI/CD pipeline that prevents accidental production changes.",
              difficulty: "senior",
              answer: `**The design goals:**
- No one can apply without a reviewed plan
- Plan is visible to reviewers (not just "trust me")
- Production requires human approval
- Credentials are never stored as long-lived secrets

**Pipeline design:**

\`\`\`
PR opened
  ↓
terraform validate + tfsec/checkov (static analysis)
  ↓
terraform plan (per environment affected)
  ↓
Plan posted as PR comment (human readable)
  ↓
Code review (both code diff AND plan diff)
  ↓
PR approved + merged to main
  ↓
Dev/Staging: terraform apply (automatic)
  ↓
Production: GitHub Environment approval gate (manual)
  ↓
terraform apply (production)
  ↓
Slack notification with apply summary
\`\`\`

**Key implementation details:**

1. **Saved plan file**: Plan is saved with \`-out=plan.tfplan\` and apply uses the saved plan (\`terraform apply plan.tfplan\`). This ensures what was reviewed is exactly what gets applied.

2. **OIDC auth**: No long-lived AWS credentials. GitHub OIDC → IAM role assumption with conditions:
\`\`\`json
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:sub": "repo:myorg/infra:ref:refs/heads/main"
  }
}
\`\`\`

3. **Separate roles per environment**: Dev GitHub Actions role has no access to production state. Production role only assumable from \`refs/heads/main\`.

4. **Policy checks before apply**:
\`\`\`bash
terraform show -json plan.tfplan | opa eval --data policies/ --input -
\`\`\`

5. **Blast radius limits**: Production Terraform role has explicit deny on delete actions for critical resources (via SCP or IAM boundary).

6. **Audit trail**: Every apply creates a GitHub Actions run log. State versioning in S3 shows before/after. CloudTrail shows actual API calls.`,
            },
          ],
        },
      ],
    },
  ],
};
