import type { Track } from "./types";

export const kubernetesTrack: Track = {
  id: "kubernetes",
  title: "Kubernetes",
  description: "Master container orchestration from pods to production clusters",
  longDescription:
    "Go from zero to hero with Kubernetes — understanding the control plane, workloads, networking, storage, security, and GitOps. Learn how Google, Airbnb, Uber, and Netflix run Kubernetes at massive scale.",
  icon: "Layers",
  color: "#326ce5",
  gradient: "track-kubernetes-gradient",
  tags: ["containers", "orchestration", "devops", "cloud-native", "k8s"],
  modules: [
    {
      id: "kubernetes-foundations",
      title: "Kubernetes Architecture",
      level: "beginner",
      description: "Understand why Kubernetes exists and how its components work together.",
      lessons: [
        {
          id: "why-kubernetes",
          title: "Why Kubernetes Exists",
          duration: 18,
          type: "lesson",
          description: "Understand the problems Kubernetes solves that Docker alone cannot.",
          objectives: [
            "Explain why container orchestration is needed at scale",
            "Describe the Kubernetes control plane and worker node components",
            "Read a Kubernetes architecture diagram",
            "Explain what happens when you run kubectl apply",
          ],
          content: `# Why Kubernetes Exists

## The Problem Docker Alone Can't Solve

Docker is excellent for running one container on one machine. But real production systems run hundreds or thousands of containers across many machines. Docker alone gives you no answer for:

- **Scheduling**: Which machine should run this container?
- **Health**: If a container crashes, who restarts it?
- **Scaling**: If traffic spikes, how do you add more containers?
- **Discovery**: How does Service A find Service B when IPs change?
- **Rolling updates**: How do you deploy v2 without downtime?

**Real scale:** Google runs 2 billion containers per week using Borg (the system that directly inspired Kubernetes). Airbnb migrated from EC2 to Kubernetes and reduced infrastructure costs by 25%. Uber runs 4,000+ microservices on Kubernetes. Netflix uses Kubernetes for its streaming backend across 230 million subscribers.

Kubernetes (K8s) was open-sourced by Google in 2014 and is now the de facto standard for container orchestration.

## Kubernetes Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    CONTROL PLANE                         │
│                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ kube-apiserver│  │  etcd    │  │ kube-scheduler    │  │
│  │ (REST API)  │  │(key-value│  │ (places pods on   │  │
│  │             │  │  store)  │  │  nodes)           │  │
│  └─────────────┘  └──────────┘  └───────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         kube-controller-manager                  │   │
│  │  (node controller, replicaset controller, etc.)  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──┐ ┌───────▼────┐ ┌────▼───────┐
    │  WORKER 1  │ │  WORKER 2  │ │  WORKER 3  │
    │            │ │            │ │            │
    │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │
    │ │kubelet │ │ │ │kubelet │ │ │ │kubelet │ │
    │ │kube-   │ │ │ │kube-   │ │ │ │kube-   │ │
    │ │proxy   │ │ │ │proxy   │ │ │ │proxy   │ │
    │ │contai- │ │ │ │contai- │ │ │ │contai- │ │
    │ │nerd    │ │ │ │nerd    │ │ │ │nerd    │ │
    │ └────────┘ │ │ └────────┘ │ │ └────────┘ │
    └────────────┘ └────────────┘ └────────────┘
\`\`\`

### Control Plane Components

**kube-apiserver** — The front door to Kubernetes. Every kubectl command, every controller, every kubelet talks to the API server. It validates and stores all cluster state.

**etcd** — The cluster's brain. A distributed key-value store that holds all cluster state. If etcd dies without a backup, your cluster is gone. This is why etcd backup is a critical SRE responsibility.

**kube-scheduler** — Watches for new pods with no node assigned, selects the best node based on resource requests, affinity rules, and taints/tolerations.

**kube-controller-manager** — Runs a loop of controllers: ReplicaSet controller (ensures desired pod count), Node controller (handles node failures), Endpoints controller, etc.

### Worker Node Components

**kubelet** — The agent on each node. Talks to the API server, receives pod specs, tells the container runtime (containerd) to start/stop containers, reports health back.

**kube-proxy** — Implements Service networking on each node. Manages iptables or IPVS rules to route traffic to the right pod IPs.

**containerd** — The container runtime. Actually pulls images and runs containers. Docker Engine uses containerd internally; Kubernetes talks to it directly via the Container Runtime Interface (CRI).

## What Happens When You Run kubectl apply

\`\`\`bash
kubectl apply -f deployment.yaml
\`\`\`

1. **kubectl** reads the YAML and sends a REST request to the API server
2. **kube-apiserver** authenticates (Who are you?), authorizes (Are you allowed?), validates the schema
3. **etcd** persists the desired state
4. **kube-controller-manager** notices the Deployment object → creates a ReplicaSet → creates Pod objects
5. **kube-scheduler** notices pods in Pending state → assigns each to a node
6. **kubelet** on the assigned node notices the pod → tells containerd to pull the image and start the container
7. **kubelet** reports pod status back → visible in kubectl get pods
\`\`\`

## Common Mistakes

- **Confusing Docker and Kubernetes**: Docker builds and runs containers on ONE machine. Kubernetes orchestrates containers across MANY machines.
- **Thinking control plane nodes run your workloads**: By default, the control plane has a taint that prevents user pods from being scheduled there.
- **Underestimating etcd**: etcd needs regular backups (daily minimum). A lost etcd = lost cluster.
`,
          interviewQuestions: [
            {
              question: "What problem does Kubernetes solve that Docker Compose can't?",
              difficulty: "junior" as const,
              answer: `Docker Compose manages multiple containers on a SINGLE machine. It has no concept of multiple nodes, no automatic rescheduling if a node dies, no built-in load balancing across machines, and no horizontal scaling across a fleet.

Kubernetes solves:
- **Multi-node scheduling**: Decides which of N machines should run each container based on resources, affinity, and taints
- **Self-healing**: If a pod crashes or a node goes down, K8s reschedules the pods automatically
- **Horizontal scaling**: HPA can scale from 3 to 30 replicas based on CPU/memory/custom metrics
- **Service discovery**: A Service object gives pods a stable DNS name even as pod IPs change
- **Rolling deployments**: Zero-downtime updates by gradually replacing old pods with new ones

Real example: When an AWS availability zone fails, Kubernetes detects the unreachable nodes and reschedules the pods on healthy nodes in other AZs — automatically, without human intervention.`,
            },
            {
              question: "What is etcd and why is it the most critical Kubernetes component?",
              difficulty: "mid" as const,
              answer: `etcd is a distributed key-value store that holds ALL Kubernetes cluster state: every Pod, Deployment, Service, ConfigMap, Secret, and more. It uses the Raft consensus algorithm to remain consistent across its cluster members (typically 3 or 5 nodes).

Why it's the most critical component:
- **Single source of truth**: If etcd says a Deployment has 3 replicas, that's what Kubernetes works toward, regardless of what's actually running
- **No backup = no recovery**: If etcd data is lost (hardware failure, corrupted disk), you cannot restore the cluster. The nodes are still running their containers, but the control plane has no state to reconcile against
- **Total cluster loss risk**: Unlike losing the API server (temporary disruption), losing etcd without a backup means you must rebuild the cluster from scratch

Best practices:
\`\`\`bash
# Backup etcd (run on a control plane node)
ETCDCTL_API=3 etcdctl snapshot save backup.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

# Verify the backup
etcdctl snapshot status backup.db
\`\`\`

In managed K8s (EKS, GKE, AKS), the cloud provider manages etcd for you and takes responsibility for backups — a major reason teams use managed K8s.`,
            },
            {
              question: "Walk me through exactly what happens when a pod gets scheduled onto a node.",
              difficulty: "senior" as const,
              answer: `Full lifecycle from kubectl apply to container running:

1. **kubectl apply** → API server receives the Deployment manifest
2. **API server** validates (schema check), runs admission webhooks (e.g., OPA/Kyverno policies), then writes to etcd
3. **Deployment controller** (in kube-controller-manager) watches etcd, sees the new Deployment, creates a ReplicaSet object
4. **ReplicaSet controller** watches the ReplicaSet, sees 0 of 3 pods exist, creates 3 Pod objects (status: Pending, nodeName: "")
5. **Scheduler** watches for pods with empty nodeName. For each pod, it:
   - Runs **filter plugins**: eliminates nodes with insufficient CPU/memory, wrong taints, affinity mismatches
   - Runs **score plugins**: ranks remaining nodes by available resources, spreading constraints, etc.
   - Assigns the highest-scoring node by setting pod.spec.nodeName
6. **kubelet** on the assigned node watches for pods assigned to it. It:
   - Calls the container runtime (containerd via CRI) to pull the image
   - Creates the pod sandbox (network namespace)
   - Calls the CNI plugin to assign an IP and set up networking
   - Starts the init containers (if any), then the main containers
7. **kubelet** reports container status back to the API server
8. **Pod status** transitions: Pending → ContainerCreating → Running
9. **kube-proxy** on all nodes updates iptables/IPVS rules to include the new pod's IP in any Services that select it

Total time in a healthy cluster: typically 5–30 seconds depending on image pull time.`,
            },
          ],
        },
        {
          id: "kubernetes-objects",
          title: "Pods, Labels & Namespaces",
          duration: 15,
          type: "lesson",
          description: "Master the fundamental building blocks of Kubernetes.",
          objectives: [
            "Explain why Kubernetes uses Pods instead of running containers directly",
            "Use labels and selectors to group and query resources",
            "Organize workloads with namespaces",
            "Write a basic Pod manifest",
          ],
          content: `# Pods, Labels & Namespaces

## Why Pods, Not Containers?

Kubernetes doesn't schedule containers directly — it schedules **Pods**. A Pod is a group of one or more containers that:
- Share a **network namespace** (same IP address, same localhost)
- Share **storage volumes**
- Are always scheduled together on the same node

The most common pattern is **one container per pod**. Multi-container pods use the **sidecar pattern**: a main container plus helpers (log shipper, proxy, secrets agent).

\`\`\`yaml
# Minimal pod manifest
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
    tier: frontend
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
\`\`\`

\`\`\`bash
kubectl apply -f pod.yaml
kubectl get pods
kubectl describe pod nginx     # full details including events
kubectl logs nginx             # container stdout
kubectl exec -it nginx -- bash # shell into the container
kubectl delete pod nginx
\`\`\`

## Labels and Selectors

Labels are key-value pairs attached to any Kubernetes object. They're how Services find pods, how Deployments track their pods, and how you query the cluster.

\`\`\`bash
# Query by label
kubectl get pods -l app=nginx
kubectl get pods -l "tier in (frontend,backend)"
kubectl get pods -l app=nginx,tier=frontend  # AND

# Add a label to a running pod
kubectl label pod nginx version=v2

# Remove a label
kubectl label pod nginx version-
\`\`\`

## Namespaces: Logical Clusters

Namespaces partition a physical cluster into virtual ones. Use them to separate environments (dev/staging) or teams.

\`\`\`bash
kubectl get namespaces
# NAME              STATUS
# default           Active   ← where you work by default
# kube-system       Active   ← Kubernetes internal components
# kube-public       Active   ← publicly readable config
# kube-node-lease   Active   ← node heartbeats

# Create and use namespaces
kubectl create namespace team-payments
kubectl get pods -n team-payments
kubectl get pods --all-namespaces    # or -A

# Set default namespace for your session
kubectl config set-context --current --namespace=team-payments
\`\`\`

## The Object Model

Every Kubernetes resource has the same four top-level fields:

\`\`\`yaml
apiVersion: apps/v1   # Which API group and version
kind: Deployment      # What type of object
metadata:             # Name, namespace, labels, annotations
  name: my-app
  namespace: production
  labels:
    app: my-app
spec:                 # Desired state (what YOU want)
  replicas: 3
# status:            # Current state (what K8s observes) - managed by K8s
\`\`\`

The **reconciliation loop**: Kubernetes constantly compares \`spec\` (desired) with \`status\` (actual). If they differ, controllers take action to close the gap. This is the core of how Kubernetes works.
`,
          interviewQuestions: [
            {
              question: "Why does Kubernetes use Pods instead of running containers directly?",
              difficulty: "junior" as const,
              answer: `Pods exist for several important reasons:

1. **Sidecar pattern support**: Some applications need helper containers that share the same network and filesystem. Example: an nginx pod + a sidecar that syncs config from git. These must share localhost — only possible if they're in the same network namespace (same pod).

2. **Atomic scheduling unit**: The scheduler needs to place related containers together. If containers were scheduled independently, the nginx and its config-sync sidecar might land on different nodes.

3. **Shared fate**: All containers in a pod live and die together. If the pod is deleted, all containers are stopped simultaneously.

4. **Resource grouping**: Requests and limits are set per container but are accounted for at the pod level for scheduling purposes.

Real-world example: Istio, the service mesh used by Airbnb and Lyft, injects an Envoy proxy container as a sidecar into every application pod. The sidecar intercepts all network traffic without the application knowing. This only works because pod containers share a network namespace.`,
            },
            {
              question: "What's the difference between labels and annotations?",
              difficulty: "junior" as const,
              answer: `**Labels** are for selection and grouping. Kubernetes uses them internally:
- Services use label selectors to find their pods
- Deployments use label selectors to own their pods
- Kubectl can filter by labels: \`kubectl get pods -l app=nginx\`
- Labels must be short and optimized for querying

**Annotations** are for metadata that tools read but Kubernetes doesn't query on:
- Build info: \`git-commit: abc123\`, \`build-date: 2024-01-15\`
- Tool configuration: Prometheus scraping (\`prometheus.io/scrape: "true"\`)
- Owner info: \`owner: team-payments@company.com\`
- Annotations can hold larger values (up to 256KB)

\`\`\`yaml
metadata:
  labels:
    app: payments        # K8s uses this for selection
    version: v2
  annotations:
    git-commit: "abc1234"           # tools read this
    prometheus.io/scrape: "true"    # Prometheus reads this
    description: "Long description that would be too verbose for a label"
\`\`\``,
            },
          ],
        },
      ],
    },
    {
      id: "core-workloads",
      title: "Core Workloads",
      level: "intermediate",
      description: "Master Deployments, StatefulSets, and DaemonSets for every production use case.",
      lessons: [
        {
          id: "deployments-deep-dive",
          title: "Deployments & Health Probes",
          duration: 22,
          type: "lesson",
          description: "Run stateless applications reliably with rolling updates and health checks.",
          objectives: [
            "Write a production-grade Deployment manifest",
            "Configure liveness, readiness, and startup probes",
            "Perform rolling updates and rollbacks",
            "Debug CrashLoopBackOff, OOMKilled, and Pending pod states",
          ],
          content: `# Deployments & Health Probes

## Why Deployments, Not Pods Directly?

Never run pods directly in production. If a pod crashes, it's gone. A **Deployment** ensures a desired number of pod replicas always run. It also manages rolling updates — replacing old pods with new ones gradually to achieve zero downtime.

\`\`\`
Deployment
└── ReplicaSet (v2)          ← current
    ├── Pod (v2, running)
    ├── Pod (v2, running)
    └── Pod (v2, running)
└── ReplicaSet (v1)          ← previous (kept for rollback)
    └── (scaled to 0)
\`\`\`

## A Production-Grade Deployment

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payments-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payments-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1           # can have 1 extra pod during update
      maxUnavailable: 0     # never go below desired count (zero-downtime)
  template:
    metadata:
      labels:
        app: payments-api
        version: v2
    spec:
      containers:
      - name: payments-api
        image: mycompany/payments:v2.1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /healthz
            port: 8080
          failureThreshold: 30
          periodSeconds: 10   # gives up to 5min for slow startup
\`\`\`

## Health Probes Explained

**Liveness probe** — Is the container alive? If this fails 3 times, Kubernetes kills and restarts the container. Use for deadlock detection.

**Readiness probe** — Is the container ready to serve traffic? If this fails, the pod is removed from Service endpoints (no traffic sent). The container keeps running. Use for: waiting for DB connection, warming up caches.

**Startup probe** — Is the container done starting? Disables liveness and readiness probes until it succeeds. Use for slow-starting applications (Java with long JVM init, loading ML models).

\`\`\`
Without startup probe:
  App starts (takes 60s) → liveness probe fires at 10s → KILL → infinite restart loop

With startup probe:
  App starts (takes 60s) → startup probe polls every 10s, succeeds at 60s → 
  liveness/readiness probes activate → normal operation
\`\`\`

## Rolling Updates & Rollbacks

\`\`\`bash
# Deploy a new image version
kubectl set image deployment/payments-api payments-api=mycompany/payments:v2.2.0

# Watch the rollout
kubectl rollout status deployment/payments-api

# View rollout history
kubectl rollout history deployment/payments-api

# Rollback to previous version
kubectl rollout undo deployment/payments-api

# Rollback to specific revision
kubectl rollout undo deployment/payments-api --to-revision=3
\`\`\`

## Debugging Common Pod States

\`\`\`bash
# Pod not starting? Check events first
kubectl describe pod <pod-name>
# Look for: Image pull errors, OOM, scheduling failures

# CrashLoopBackOff: container keeps crashing
kubectl logs <pod-name>                    # current logs
kubectl logs <pod-name> --previous         # logs from last crash

# OOMKilled: container exceeded memory limit
kubectl describe pod <pod-name> | grep -A5 "Last State"
# Shows: Reason: OOMKilled → increase memory limit

# Pending: pod can't be scheduled
kubectl describe pod <pod-name> | grep -A10 Events
# Common causes:
#   Insufficient CPU/memory on all nodes
#   No nodes match the affinity/taint requirements
#   PVC not bound

# ImagePullBackOff: can't pull the image
kubectl describe pod <pod-name>
# Check: image name typo, registry auth (imagePullSecrets), private registry
\`\`\`
`,
          interviewQuestions: [
            {
              question: "A pod is in CrashLoopBackOff. Walk me through your debugging process.",
              difficulty: "mid" as const,
              answer: `CrashLoopBackOff means the container starts, crashes, and Kubernetes keeps restarting it with exponential backoff (10s, 20s, 40s, up to 5 minutes).

**Step 1: Get logs from the crash**
\`\`\`bash
kubectl logs <pod-name> --previous   # logs from the crashed instance
kubectl logs <pod-name>              # current instance (may be starting)
\`\`\`

**Step 2: Check events**
\`\`\`bash
kubectl describe pod <pod-name>
# Look at Events section at the bottom
\`\`\`

**Common root causes and fixes:**

1. **Application error on startup**: The app exits with non-zero code. Fix: check logs for exception/error, fix the application code or config
2. **Missing environment variables**: App requires DB_URL but it's not set. Fix: add the env var to the deployment
3. **OOMKilled**: Memory limit too low. Fix: increase memory limit or fix memory leak
4. **Liveness probe too aggressive**: Probe fires before app is ready → kills it → loop. Fix: add a startup probe or increase initialDelaySeconds
5. **Wrong command/entrypoint**: ENTRYPOINT in Dockerfile is wrong. Fix: test with \`kubectl run debug --image=myimage --command -- /bin/sh\`
6. **Config file missing**: App expects /etc/config/app.yaml but ConfigMap not mounted. Fix: verify volume mounts

**Quick diagnostic**:
\`\`\`bash
# If logs are empty (crashes too fast), override the entrypoint
kubectl run debug-pod --image=mycompany/payments:v2 \
  --command -- sleep 3600
kubectl exec -it debug-pod -- bash
# Then manually run the entrypoint to see the error
\`\`\``,
            },
            {
              question: "What's the difference between liveness, readiness, and startup probes?",
              difficulty: "junior" as const,
              answer: `All three are health checks, but they serve different purposes and trigger different actions:

**Liveness probe**: "Is this container alive?" → failing kills and restarts the container
- Use: detect deadlocks (app is running but stuck, not processing requests)
- Example: HTTP endpoint that checks internal goroutine health

**Readiness probe**: "Is this container ready to receive traffic?" → failing removes pod from Service endpoints (traffic stops going to it, container keeps running)
- Use: DB connection pool not ready, cache warming, during rolling restart
- Example: check if DB connection is alive before accepting requests

**Startup probe**: "Has the container finished starting?" → disables liveness/readiness until it passes
- Use: slow-starting apps (Java, large ML models, Elasticsearch)
- Example: failureThreshold: 30, periodSeconds: 10 = up to 5 minutes to start

**Practical example**: Without startup probes, a Java Spring Boot app that takes 90 seconds to start will be killed by the liveness probe (set to fire at 30s) before it's even ready, creating an infinite restart loop. The startup probe solves this.`,
            },
            {
              question: "Your deployment has 3 replicas but traffic is only going to 2 of them. Why?",
              difficulty: "mid" as const,
              answer: `The most common reason: **one pod is failing its readiness probe**.

When a pod's readiness probe fails, Kubernetes removes it from the Service's Endpoints list. Traffic only goes to pods with passing readiness checks.

**Debug steps:**
\`\`\`bash
# Check pod status
kubectl get pods -l app=payments-api
# You'll see one pod with READY: 0/1 despite STATUS: Running

# Check readiness probe failures
kubectl describe pod <failing-pod>
# Events: Readiness probe failed: HTTP probe failed...

# Check what the probe is hitting
kubectl exec -it <failing-pod> -- curl localhost:8080/ready
# This shows you what Kubernetes sees

# Check Service endpoints
kubectl get endpoints payments-api-service
# Will show only 2 pod IPs, not 3
\`\`\`

Other possible causes:
- Pod is in **Pending** state (not scheduled yet)
- Pod is in **ContainerCreating** (image still pulling)
- Pod is **Terminating** (being replaced during a rollout)
- **PodDisruptionBudget** limiting how many pods can be unavailable`,
            },
          ],
        },
        {
          id: "statefulsets-and-daemonsets",
          title: "StatefulSets & DaemonSets",
          duration: 18,
          type: "lesson",
          description: "Run stateful applications and node-level daemons reliably.",
          objectives: [
            "Explain when to use StatefulSet vs Deployment",
            "Deploy a database with a StatefulSet and persistent storage",
            "Use DaemonSets for node-level agents",
            "Understand ordered pod creation and stable network identities",
          ],
          content: `# StatefulSets & DaemonSets

## StatefulSets: For Stateful Applications

Deployments treat pods as interchangeable — any pod can be replaced by any other. StatefulSets give pods **stable, unique identities** that persist across restarts.

**Use StatefulSet when your app needs:**
- Stable network identity (pod-0, pod-1, pod-2 — not random names)
- Stable storage (each pod gets its own PVC that follows it)
- Ordered deployment/scaling (pod-0 must be Running before pod-1 starts)
- Ordered rolling updates

**Real-world users:**
- **Elastic** runs Elasticsearch on StatefulSets (master-0, data-0, data-1, data-2)
- **Cassandra** clusters use StatefulSets for stable node naming
- **Kafka** brokers use StatefulSets (broker-0, broker-1, broker-2)
- **PostgreSQL** with streaming replication

\`\`\`yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: "postgres"   # headless service name
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:    # Each pod gets its own PVC
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: gp2
      resources:
        requests:
          storage: 50Gi
\`\`\`

This creates:
- \`postgres-0\`, \`postgres-1\`, \`postgres-2\` (stable names)
- \`data-postgres-0\`, \`data-postgres-1\`, \`data-postgres-2\` (dedicated PVCs)
- DNS: \`postgres-0.postgres.default.svc.cluster.local\`

## DaemonSets: One Pod Per Node

A DaemonSet ensures one pod runs on every node (or a subset matching a node selector). When new nodes join the cluster, the DaemonSet pod is automatically created there.

**Use DaemonSets for:**
- Log collectors (Fluentd, Filebeat, Promtail)
- Monitoring agents (Datadog Agent, Prometheus Node Exporter)
- Network plugins (CNI plugins, Cilium)
- Security scanners (Falco)

**Real-world:** Datadog runs its agent as a DaemonSet on every node in your cluster. Netflix runs their Metaflow log collection as a DaemonSet.

\`\`\`yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      name: fluentd
  template:
    metadata:
      labels:
        name: fluentd
    spec:
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule            # run on control plane nodes too
      containers:
      - name: fluentd
        image: fluent/fluentd-kubernetes-daemonset:v1
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
\`\`\`
`,
          interviewQuestions: [
            {
              question: "When would you use a StatefulSet instead of a Deployment?",
              difficulty: "mid" as const,
              answer: `Use **StatefulSet** when your application needs any of:

1. **Stable network identity**: Each pod gets a predictable DNS name (postgres-0, postgres-1). With a Deployment, pod names are random hashes. Kafka brokers need to know each other's addresses; they can't work with random pod names.

2. **Stable storage (one PVC per pod)**: StatefulSets use \`volumeClaimTemplates\` — each pod gets its own PersistentVolumeClaim. If postgres-1 is rescheduled to another node, it reconnects to the same PVC with its data intact. With a Deployment, all pods share one PVC (or each pod uses a new empty PVC on every restart).

3. **Ordered startup**: For a 3-node Elasticsearch cluster, the master node (es-0) must be Running before data nodes (es-1, es-2) start. StatefulSets guarantee this ordering.

4. **Ordered rolling updates**: Updates go in reverse order (pod-2 first, then pod-1, then pod-0), so primary/master nodes are updated last.

**Use Deployment for**: stateless services (web servers, APIs, workers) where any replica is identical and interchangeable.

**Common mistake**: Using a Deployment for PostgreSQL and sharing one PVC across all pods — this causes data corruption as all pods write to the same volume simultaneously.`,
            },
            {
              question: "Why would you use a DaemonSet instead of a Deployment with enough replicas?",
              difficulty: "junior" as const,
              answer: `A Deployment with replicas doesn't guarantee coverage across all nodes. The scheduler places pods where there are available resources, so you might get 3 monitoring agents all on node-1 and none on node-2 and node-3.

DaemonSet guarantees **exactly one pod per node** (matching the node selector):
- **New nodes automatically get the daemon**: When cluster autoscaler adds a node, the DaemonSet controller immediately creates the pod there. With a Deployment, you'd have to manually scale up.
- **No resource-based scheduling**: DaemonSet pods are placed on nodes even if they're "full" for normal pods (they bypass normal scheduling, with resource constraints still applying).
- **Node-local data access**: Log collectors need to read \`/var/log\` on the specific node. A Deployment replica scheduled to the wrong node can't access another node's logs.

Example: If you have a 100-node cluster and deploy Datadog Agent as a DaemonSet vs a Deployment with replicas=100, the Deployment might cluster all 100 agents on 20 nodes, leaving 80 nodes unmonitored.`,
            },
          ],
        },
      ],
    },
    {
      id: "kubernetes-networking",
      title: "Kubernetes Networking",
      level: "intermediate",
      description: "Master Services, Ingress, and Network Policies for secure cluster networking.",
      lessons: [
        {
          id: "services-and-ingress",
          title: "Services & Ingress",
          duration: 22,
          type: "lesson",
          description: "Expose applications inside and outside the cluster.",
          objectives: [
            "Explain ClusterIP, NodePort, and LoadBalancer Service types",
            "Configure an Ingress with TLS termination",
            "Understand how kube-proxy implements service routing",
            "Debug service connectivity issues",
          ],
          content: `# Services & Ingress

## Why Services Exist

Pods are ephemeral — they die and get new IP addresses. A **Service** gives you a stable IP and DNS name that automatically routes to healthy pods.

\`\`\`
Without Service:
  Pod (10.0.1.5) → crashes → new Pod (10.0.1.23)
  Caller has hardcoded 10.0.1.5 → broken

With Service:
  Service (10.96.0.100, DNS: payments-api) → always routes to healthy pods
  Caller uses service name → always works
\`\`\`

## Service Types

### ClusterIP (default)
Internal-only. Reachable only from within the cluster. Use for pod-to-pod communication.

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: payments-api
spec:
  type: ClusterIP       # default if omitted
  selector:
    app: payments-api   # routes to pods with this label
  ports:
  - port: 80            # service port
    targetPort: 8080    # container port
\`\`\`

### NodePort
Exposes the service on a port on every node (30000–32767). Traffic to any-node-IP:nodePort reaches the service. Rarely used directly in production (use Ingress instead).

### LoadBalancer
Creates a cloud load balancer (AWS NLB/ELB, GCP LB). Each LoadBalancer service gets its own cloud LB = expensive at scale.

\`\`\`yaml
spec:
  type: LoadBalancer
  # Result: an AWS NLB is created, you get an external IP
\`\`\`

## Ingress: One Load Balancer for All Services

Instead of one LoadBalancer per service (expensive), use one Ingress controller that routes traffic based on hostname and path.

\`\`\`
Internet → AWS ALB (1 LB, cost-efficient)
              │
    ┌─────────┼─────────┐
    │         │         │
  /api      /app      /admin
    │         │         │
 api-svc  app-svc  admin-svc
\`\`\`

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.mycompany.com
    secretName: api-tls-cert
  rules:
  - host: api.mycompany.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: payments-api
            port:
              number: 80
      - path: /health
        pathType: Exact
        backend:
          service:
            name: healthcheck
            port:
              number: 8080
\`\`\`

## How Services Work (kube-proxy)

kube-proxy runs on every node and watches the API server for Service and Endpoints changes. It programs **iptables rules** (or IPVS) to redirect traffic:

\`\`\`bash
# When you hit the ClusterIP (10.96.0.100:80), iptables rewrites it:
# → 10.0.1.5:8080 (pod 1) with probability 1/3
# → 10.0.1.6:8080 (pod 2) with probability 1/2
# → 10.0.1.7:8080 (pod 3) with probability 1

# See the iptables rules on a node:
sudo iptables -t nat -L KUBE-SERVICES | grep payments
\`\`\`

## Debugging Service Connectivity

\`\`\`bash
# Step 1: Can you reach the service DNS?
kubectl exec -it debug-pod -- nslookup payments-api
kubectl exec -it debug-pod -- nslookup payments-api.default.svc.cluster.local

# Step 2: Is the service sending traffic to pods?
kubectl get endpoints payments-api
# If ENDPOINTS is <none>, your selector doesn't match any pods

# Step 3: Do the pod labels match the service selector?
kubectl get pods -l app=payments-api  # should show your pods

# Step 4: Can you reach the pod directly?
kubectl exec -it debug-pod -- curl 10.0.1.5:8080

# Step 5: Check service port mapping
kubectl describe service payments-api
# Verify Port and TargetPort match your container
\`\`\`
`,
          interviewQuestions: [
            {
              question: "Your service is unreachable from within the cluster. How do you debug it?",
              difficulty: "mid" as const,
              answer: `Systematic debugging approach:

**1. Check if the service exists and has correct configuration**
\`\`\`bash
kubectl get service my-service
kubectl describe service my-service
# Check: selector, port, targetPort
\`\`\`

**2. Check if endpoints are populated**
\`\`\`bash
kubectl get endpoints my-service
# If <none>: service selector doesn't match any pod labels
# Fix: compare service selector with pod labels
kubectl get pods --show-labels | grep app=my-service
\`\`\`

**3. Test DNS resolution**
\`\`\`bash
kubectl run debug --image=busybox --rm -it --restart=Never -- sh
nslookup my-service
nslookup my-service.default.svc.cluster.local
# If this fails: CoreDNS issue
kubectl get pods -n kube-system | grep coredns
\`\`\`

**4. Test direct pod connectivity**
\`\`\`bash
# Bypass the service, hit the pod directly
kubectl get pod my-pod -o wide  # get pod IP
curl <pod-ip>:<container-port>
# If this works but service doesn't: kube-proxy issue
\`\`\`

**5. Check NetworkPolicy**
\`\`\`bash
kubectl get networkpolicy
# A deny-all policy blocking traffic?
\`\`\`

Most common root cause: **selector mismatch** — the service has \`app: my-app\` but pods have \`app: myapp\` (typo).`,
            },
            {
              question: "Why use Ingress instead of a LoadBalancer Service for each microservice?",
              difficulty: "junior" as const,
              answer: `**Cost**: Each LoadBalancer Service creates a cloud load balancer. On AWS, an NLB costs ~$16/month + data processing fees. If you have 20 microservices, that's $320+/month just for load balancers. One Ingress controller = one LB = ~$16/month for all 20 services.

**Features**: Ingress provides:
- **Host-based routing**: api.mycompany.com → api service, app.mycompany.com → app service
- **Path-based routing**: /api → api service, /static → frontend service
- **TLS termination**: Manage one certificate at the ingress, not in each service
- **Rate limiting, auth**: Nginx Ingress annotations, OAuth2 proxy patterns

**Example cost comparison for Airbnb-scale (hundreds of services)**:
- LoadBalancer per service: 200 services × $16 = $3,200/month
- Ingress controllers: 3 ingress controllers (HA) × $16 = $48/month

**When to use LoadBalancer directly**: For TCP/UDP services that aren't HTTP (databases, game servers, gRPC with specific requirements), since Ingress is HTTP/HTTPS-only.`,
            },
          ],
        },
        {
          id: "network-policies",
          title: "Network Policies",
          duration: 15,
          type: "lesson",
          description: "Implement zero-trust networking with NetworkPolicy.",
          objectives: [
            "Explain why default Kubernetes networking is permissive",
            "Write NetworkPolicy to isolate workloads",
            "Implement a deny-all baseline with selective allow rules",
            "Apply NetworkPolicy for compliance requirements",
          ],
          content: `# Network Policies

## The Problem: Kubernetes Is Open By Default

By default, every pod in a Kubernetes cluster can talk to every other pod — across namespaces. If an attacker compromises your frontend pod, they can directly connect to your database pod.

This is a critical security risk for:
- **PCI DSS compliance** (payment card data must be isolated)
- **HIPAA** (healthcare data isolation)
- **SOC 2** (access controls)

\`\`\`
Default K8s:
  frontend-pod → database-pod ✓
  frontend-pod → payments-service ✓
  frontend-pod → internal-admin-api ✓  ← dangerous!
\`\`\`

## NetworkPolicy: Kubernetes Firewall

NetworkPolicy is a Kubernetes object that defines ingress (incoming) and egress (outgoing) rules for pods.

**Important**: NetworkPolicy requires a CNI plugin that supports it (Calico, Cilium, Weave). The default CNI (Flannel) does NOT enforce NetworkPolicy. EKS uses VPC CNI (which needs Calico for NetworkPolicy), GKE uses its own, AKS supports Calico or Azure NetworkPolicy.

### Step 1: Deny All (Zero-Trust Baseline)

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  podSelector: {}    # applies to ALL pods in this namespace
  policyTypes:
  - Ingress
  - Egress
  # No ingress or egress rules = deny everything
\`\`\`

### Step 2: Allow What's Needed

\`\`\`yaml
# Allow frontend to talk to payments API
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-payments
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: payments-api     # this policy applies to payments pods
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend     # only allow from frontend pods
    ports:
    - protocol: TCP
      port: 8080
---
# Allow payments API to reach postgres
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-payments-to-db
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: payments-api
    ports:
    - protocol: TCP
      port: 5432
---
# Allow DNS resolution (required for everything to work)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
\`\`\`

## Cross-Namespace Policies

\`\`\`yaml
# Allow monitoring namespace to scrape metrics from production
spec:
  podSelector:
    matchLabels:
      app: payments-api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          purpose: monitoring   # namespace must have this label
      podSelector:
        matchLabels:
          app: prometheus       # AND pod must have this label
    ports:
    - port: 9090
\`\`\`
`,
          interviewQuestions: [
            {
              question: "By default, can a pod in namespace A talk to a pod in namespace B?",
              difficulty: "junior" as const,
              answer: `**Yes** — by default, Kubernetes applies no network restrictions. All pods can communicate with all other pods across all namespaces, regardless of namespace boundaries.

This is why NetworkPolicy is critical for production security:

\`\`\`bash
# Without NetworkPolicy, this works by default:
kubectl exec -it frontend-pod -n frontend -- \
  curl http://payments-db.backend.svc.cluster.local:5432
\`\`\`

To achieve namespace isolation:
1. Apply a \`deny-all\` NetworkPolicy in each namespace
2. Then selectively allow required communication

**Important caveat**: NetworkPolicy only works if your CNI plugin supports it. Flannel (the simplest CNI) doesn't enforce NetworkPolicy. Calico, Cilium, and Weave do.

For compliance requirements (PCI DSS, HIPAA), namespace isolation via NetworkPolicy is usually required. Many companies implement it as: frontend namespace can only talk to API namespace, API namespace can talk to database namespace, nothing can bypass these boundaries.`,
            },
            {
              question: "You applied a deny-all NetworkPolicy and now your app can't resolve DNS. What happened?",
              difficulty: "mid" as const,
              answer: `DNS in Kubernetes is served by CoreDNS pods in the \`kube-system\` namespace, on port 53 (UDP/TCP). When you apply a deny-all Egress policy, you also block DNS queries — so no service names resolve.

**Fix: Add an explicit egress rule for DNS**

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
spec:
  podSelector: {}        # all pods
  policyTypes:
  - Egress
  egress:
  - ports:               # allow DNS
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
\`\`\`

This is one of the most common NetworkPolicy mistakes. The correct pattern is:
1. Apply deny-all (ingress + egress)
2. Immediately apply allow-dns
3. Then add your specific application rules

Without DNS, \`kubectl exec -- curl my-service\` fails with "Name or service not known" even if you've allowed the service port, because the pod can't resolve \`my-service\` to an IP.`,
            },
          ],
        },
      ],
    },
    {
      id: "config-and-storage",
      title: "Config & Storage",
      level: "intermediate",
      description: "Manage configuration and persistent data in Kubernetes.",
      lessons: [
        {
          id: "configmaps-and-secrets",
          title: "ConfigMaps & Secrets",
          duration: 18,
          type: "lesson",
          description: "Decouple configuration from container images.",
          objectives: [
            "Create ConfigMaps and mount them as files or env vars",
            "Understand why Secrets are not secure by default",
            "Use Sealed Secrets or External Secrets for production",
            "Rotate secrets without restarting pods",
          ],
          content: `# ConfigMaps & Secrets

## ConfigMaps: Non-Sensitive Configuration

A ConfigMap stores key-value pairs decoupled from the container image. Use for: environment names, feature flags, configuration files.

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  app.properties: |
    server.port=8080
    cache.ttl=300
    feature.payments=true
\`\`\`

### Using ConfigMaps

\`\`\`yaml
spec:
  containers:
  - name: app
    image: myapp:v1
    # Method 1: individual env vars
    env:
    - name: APP_ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: APP_ENV
    # Method 2: all keys as env vars
    envFrom:
    - configMapRef:
        name: app-config
    # Method 3: mount as files
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
\`\`\`

## Secrets: Sensitive Data (With a Critical Warning)

Secrets store sensitive data (passwords, tokens, certs). They look like ConfigMaps but with base64-encoded values.

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:              # K8s base64-encodes these automatically
  username: myuser
  password: supersecret
\`\`\`

**CRITICAL WARNING: Kubernetes Secrets are NOT encrypted by default.**

Base64 is encoding, not encryption. Anyone with kubectl access can decode them:
\`\`\`bash
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d
# Outputs: supersecret
\`\`\`

Secrets are stored in etcd in plaintext (base64 encoded) unless you configure **encryption at rest**.

## Production Secret Management

### Option 1: Encrypt etcd at rest (minimum baseline)
\`\`\`yaml
# /etc/kubernetes/encryption-config.yaml on control plane
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources:
  - secrets
  providers:
  - aescbc:
      keys:
      - name: key1
        secret: <base64-encoded-32-byte-key>
  - identity: {}
\`\`\`

### Option 2: Sealed Secrets (GitOps-friendly)
\`\`\`bash
# Encrypt a secret with the cluster's public key
kubeseal --format yaml < secret.yaml > sealed-secret.yaml
# sealed-secret.yaml can safely be committed to git
# Only the cluster's private key can decrypt it
\`\`\`

### Option 3: External Secrets Operator (recommended for production)
Syncs secrets from AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager into Kubernetes Secrets.

\`\`\`yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: ClusterSecretStore
  target:
    name: db-credentials   # creates this K8s Secret
  data:
  - secretKey: password
    remoteRef:
      key: prod/database/credentials
      property: password
\`\`\`
`,
          interviewQuestions: [
            {
              question: "Kubernetes Secrets are not secure by default. What does that mean and how do you fix it?",
              difficulty: "senior" as const,
              answer: `**The problem**: Kubernetes stores Secret objects in etcd as base64-encoded strings. Base64 is encoding (reversible transformation), not encryption. Anyone who can:
- Run \`kubectl get secret -o yaml\` → reads the base64 value
- Access etcd directly → reads the plaintext data
- Access an etcd snapshot/backup → reads all secrets

**Layers of protection to add:**

**1. Encrypt etcd at rest** (must-have baseline)
Configure the API server with an encryption provider (AES-CBC, AES-GCM, or KMS). Then secrets in etcd are encrypted.
\`\`\`bash
# Verify encryption is active
ETCDCTL_API=3 etcdctl get /registry/secrets/default/my-secret \
  --prefix | hexdump -C
# Should see encrypted bytes, not readable text
\`\`\`

**2. RBAC**: Restrict who can \`get secrets\`. Developers shouldn't need to read production secrets.
\`\`\`yaml
rules:
- resources: ["secrets"]
  verbs: ["list"]   # can list secret names, not read values
  # NOT: ["get", "list", "watch"]
\`\`\`

**3. External secrets management** (best practice): Use AWS Secrets Manager, Vault, or GCP Secret Manager as the source of truth. Secrets Manager has audit logging, automatic rotation, and fine-grained access control. The External Secrets Operator syncs them to K8s Secrets.

**4. Audit logging**: Enable K8s audit logs for secret access. Know who read which secrets.

At companies like Stripe and Lyft, Vault is the standard: all secrets live in Vault, pods authenticate with their ServiceAccount, and the Vault agent sidecar injects secrets into the pod at runtime — secrets never touch etcd at all.`,
            },
          ],
        },
        {
          id: "persistent-storage",
          title: "Persistent Storage",
          duration: 18,
          type: "lesson",
          description: "Manage persistent data with PersistentVolumes, PVCs, and StorageClasses.",
          objectives: [
            "Explain the PV/PVC/StorageClass relationship",
            "Provision storage dynamically with StorageClasses",
            "Choose the right access mode for your use case",
            "Debug storage binding failures",
          ],
          content: `# Persistent Storage

## The PV/PVC/StorageClass Model

\`\`\`
StorageClass (gp2, gp3, efs)
    ↓ provisions
PersistentVolume (the actual disk)
    ↑ claims
PersistentVolumeClaim (what your pod requests)
    ↑ mounts
Pod
\`\`\`

**PersistentVolume (PV)**: The actual storage resource (an EBS volume, NFS share, etc.). Created by an admin or dynamically by a StorageClass.

**PersistentVolumeClaim (PVC)**: A request for storage by a pod. "I need 10Gi of ReadWriteOnce storage." Kubernetes binds it to a matching PV.

**StorageClass**: A template for dynamic PV provisioning. When a PVC references a StorageClass, K8s automatically creates a PV.

## Dynamic Provisioning with StorageClasses

\`\`\`yaml
# StorageClass (usually pre-configured on managed K8s)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
reclaimPolicy: Retain    # Delete | Retain | Recycle
volumeBindingMode: WaitForFirstConsumer  # wait until pod is scheduled
\`\`\`

\`\`\`yaml
# PVC requesting 20Gi from the fast-ssd class
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 20Gi
\`\`\`

\`\`\`yaml
# Pod using the PVC
spec:
  containers:
  - name: postgres
    volumeMounts:
    - name: data
      mountPath: /var/lib/postgresql/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: postgres-data
\`\`\`

## Access Modes

| Mode | Abbreviation | Meaning | Example |
|------|-------------|---------|---------|
| ReadWriteOnce | RWO | One node reads+writes | Database, single-instance app |
| ReadOnlyMany | ROX | Many nodes read | Shared config files |
| ReadWriteMany | RWX | Many nodes read+write | Shared file storage, EFS |

**EBS volumes (gp2/gp3)**: Only RWO — one node at a time
**EFS (AWS)**: Supports RWX — multiple pods across multiple nodes can write simultaneously

**Real-world:** Uber uses StatefulSets with SSD-backed PVCs (gp3) for their trip data store. For shared ML model storage, they use EFS with RWX access so multiple inference pods can read the same model files.

## Reclaim Policy

When a PVC is deleted:
- **Delete**: The PV and underlying storage (EBS volume) are deleted. Use for ephemeral dev environments.
- **Retain**: The PV stays, data preserved. Requires manual cleanup. Use for production databases.

\`\`\`bash
# Check PVC status
kubectl get pvc
# NAME           STATUS   VOLUME    CAPACITY   ACCESS MODES   STORAGECLASS
# postgres-data  Bound    pvc-abc   20Gi       RWO            fast-ssd

# If stuck in Pending:
kubectl describe pvc postgres-data
# Common causes:
#   - No PV available matching the request
#   - StorageClass doesn't exist
#   - WaitForFirstConsumer: waiting for pod to be scheduled first
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What's the difference between RWO and RWX access modes, and when does it matter?",
              difficulty: "mid" as const,
              answer: `**ReadWriteOnce (RWO)**: The volume can be mounted as read-write by a SINGLE NODE at a time. Multiple pods on the same node can use it, but if your pods are on different nodes, only one node can mount it.

**ReadWriteMany (RWX)**: The volume can be mounted as read-write by MULTIPLE NODES simultaneously.

**When it matters**: With a Deployment of 3 replicas using RWO storage, if the pods are scheduled on 3 different nodes, only the first pod that mounts the volume gets read-write access — the other two fail to start. This is why databases use StatefulSets with \`volumeClaimTemplates\` (one PVC per pod) rather than sharing one RWO PVC.

**Storage that supports RWX** (on AWS):
- **EFS (NFS)**: Supports RWX. Use for shared content — multiple pods on multiple nodes read/write the same filesystem (static assets, ML models, shared uploads)
- **EBS (gp2/gp3)**: Only RWO. Block storage physically attached to one EC2 instance at a time

**Common mistake**: Deploying a stateless app with 3 replicas, giving it an EBS PVC for shared file storage, then wondering why 2 of the 3 pods are stuck in ContainerCreating. Fix: use EFS (RWX) for shared storage, or move the storage to S3 and access it via the AWS SDK instead.`,
            },
          ],
        },
      ],
    },
    {
      id: "kubernetes-operations",
      title: "Operations & Helm",
      level: "advanced",
      description: "Master kubectl for debugging and Helm for package management.",
      lessons: [
        {
          id: "kubectl-mastery",
          title: "kubectl Mastery",
          duration: 20,
          type: "lesson",
          description: "Essential kubectl commands for production Kubernetes operations.",
          objectives: [
            "Use kubectl get, describe, logs, exec efficiently",
            "Debug pods with port-forward and temporary debug containers",
            "Query resources with JSONPath and custom columns",
            "Use kubectx and kubens for multi-cluster management",
          ],
          content: `# kubectl Mastery

## Essential Commands

\`\`\`bash
# Get resources — most common
kubectl get pods                        # default namespace
kubectl get pods -n production          # specific namespace
kubectl get pods -A                     # all namespaces
kubectl get pods -o wide                # show node, IP
kubectl get pods -l app=nginx           # filter by label
kubectl get pods --sort-by=.status.startTime

# Describe — full details including events
kubectl describe pod my-pod
kubectl describe node my-node           # node conditions, capacity
kubectl describe service my-service     # endpoints, selectors

# Logs
kubectl logs my-pod                     # stdout
kubectl logs my-pod -c sidecar          # specific container
kubectl logs my-pod --previous          # previous crash
kubectl logs my-pod -f                  # follow/stream
kubectl logs -l app=nginx               # all pods matching label
kubectl logs my-pod --tail=100          # last 100 lines
kubectl logs my-pod --since=1h          # last 1 hour
\`\`\`

## Debugging Commands

\`\`\`bash
# Execute commands in a running pod
kubectl exec -it my-pod -- bash
kubectl exec -it my-pod -c sidecar -- sh
kubectl exec my-pod -- env | grep DB

# Port forward to local machine (bypasses service, connects directly to pod)
kubectl port-forward pod/my-pod 8080:8080
kubectl port-forward service/my-service 8080:80
# Then: curl localhost:8080

# Copy files
kubectl cp my-pod:/var/log/app.log ./app.log
kubectl cp ./config.yaml my-pod:/etc/config/

# Resource usage
kubectl top pods                        # requires metrics-server
kubectl top pods --sort-by=memory
kubectl top nodes

# Events (great for debugging scheduling issues)
kubectl get events --sort-by=.lastTimestamp
kubectl get events -n production --field-selector reason=OOMKilling
\`\`\`

## Advanced Querying

\`\`\`bash
# JSONPath — extract specific fields
kubectl get pod my-pod -o jsonpath='{.status.podIP}'
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[-1].type}{"\n"}{end}'

# Custom columns
kubectl get pods -o custom-columns='NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName'

# Get all images running in the cluster
kubectl get pods -A -o jsonpath='{range .items[*]}{.spec.containers[*].image}{"\n"}{end}' | sort -u

# Find pods that are not Running
kubectl get pods -A --field-selector=status.phase!=Running
\`\`\`

## Multi-Cluster Management

\`\`\`bash
# Built-in context management
kubectl config get-contexts             # list all clusters
kubectl config use-context prod-cluster # switch cluster
kubectl config current-context

# kubectx + kubens (much faster)
brew install kubectx    # installs both kubectx and kubens

kubectx                 # list contexts
kubectx prod            # switch to prod context
kubectx -               # switch to previous context

kubens                  # list namespaces
kubens production       # switch default namespace
\`\`\`

## The Debugging Workflow

\`\`\`bash
# Pod not starting?
kubectl get pod my-pod                        # check STATUS, READY, RESTARTS
kubectl describe pod my-pod                   # check Events section
kubectl logs my-pod --previous                # if CrashLoopBackOff

# Service not reachable?
kubectl get endpoints my-service              # check pod IPs listed
kubectl exec -it debug-pod -- curl my-service # test from inside cluster

# Node issue?
kubectl describe node my-node                 # check conditions, pressure
kubectl get events --field-selector involvedObject.name=my-node

# Resource constraints?
kubectl describe pod my-pod | grep -A5 Requests
kubectl top pod my-pod
\`\`\`
`,
          interviewQuestions: [
            {
              question: "How do you debug a pod that's running but your application isn't responding?",
              difficulty: "mid" as const,
              answer: `**Step 1: Check pod health indicators**
\`\`\`bash
kubectl get pod my-pod
# Check READY column: 0/1 means readiness probe failing
# Check RESTARTS: high number = repeatedly crashing
\`\`\`

**Step 2: Check application logs**
\`\`\`bash
kubectl logs my-pod
kubectl logs my-pod --previous  # if restarting
\`\`\`

**Step 3: Test the application directly (bypass service routing)**
\`\`\`bash
kubectl port-forward pod/my-pod 8080:8080
curl localhost:8080/health
\`\`\`

**Step 4: Exec into the pod and test locally**
\`\`\`bash
kubectl exec -it my-pod -- bash
curl localhost:8080/health    # from inside the container
env | grep -E "DB|API|SECRET"  # check env vars
cat /etc/config/app.yaml       # check mounted configs
\`\`\`

**Step 5: Check for resource pressure**
\`\`\`bash
kubectl top pod my-pod          # current CPU/memory usage
kubectl describe pod my-pod | grep -A10 "Limits\|Requests"
# OOMKilled? Increase memory limits
# CPU throttled? Increase CPU limits
\`\`\`

**Step 6: Check service and network**
\`\`\`bash
kubectl get endpoints my-service   # is this pod's IP in the list?
kubectl describe service my-service  # selector matches pod labels?
\`\`\``,
            },
            {
              question: "How do you quickly check what's happening across all namespaces in a cluster?",
              difficulty: "junior" as const,
              answer: `\`\`\`bash
# Get all non-running pods across the cluster
kubectl get pods -A --field-selector=status.phase!=Running

# Get recent events across all namespaces (sorted by time)
kubectl get events -A --sort-by=.lastTimestamp | tail -20

# Get all pods with their nodes (spot scheduling issues)
kubectl get pods -A -o wide

# Check node status
kubectl get nodes
# Look for: NotReady, SchedulingDisabled

# Quick health overview
kubectl get pods -A | grep -v Running | grep -v Completed

# Check resource usage
kubectl top nodes
kubectl top pods -A --sort-by=memory | head -20
\`\`\`

For regular operations, I also recommend:
- **k9s**: Terminal UI for Kubernetes — real-time view of all resources, logs, and events. Much faster than kubectl for exploration.
- **Lens**: Desktop GUI for multi-cluster management.

In an incident: first \`kubectl get events -A --sort-by=.lastTimestamp | tail -30\` to see what's been happening recently — this usually surfaces the root cause faster than checking individual pods.`,
            },
          ],
        },
        {
          id: "helm-package-manager",
          title: "Helm Package Manager",
          duration: 20,
          type: "lesson",
          description: "Package, version, and deploy Kubernetes applications with Helm.",
          objectives: [
            "Understand Helm charts, values, and releases",
            "Install, upgrade, and rollback Helm releases",
            "Override values for different environments",
            "Find and use community Helm charts",
          ],
          content: `# Helm Package Manager

## What is Helm?

Helm is the package manager for Kubernetes — like apt for Ubuntu or brew for macOS. It lets you:
- **Package** Kubernetes manifests into a reusable chart
- **Version** your deployments
- **Template** manifests with environment-specific values
- **Share** charts (Bitnami publishes 100+ production-ready charts)

**Real-world scale**: Bitnami Helm charts are downloaded 10M+ times per month. Fortune 500 companies use Bitnami's PostgreSQL, Redis, Kafka charts rather than writing their own Kubernetes manifests.

## Helm Concepts

\`\`\`
Chart
├── Chart.yaml          # chart metadata (name, version, description)
├── values.yaml         # default values (overridable)
├── templates/          # Kubernetes manifest templates
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── _helpers.tpl    # reusable template snippets
└── charts/             # chart dependencies
\`\`\`

A **Release** is a deployed instance of a chart. You can deploy the same chart multiple times with different names and values (dev-nginx, staging-nginx, prod-nginx).

## Essential Helm Commands

\`\`\`bash
# Add a chart repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search for charts
helm search repo postgres
helm search hub nginx           # search Artifact Hub (public charts)

# Install a chart
helm install my-postgres bitnami/postgresql \
  --namespace production \
  --set auth.postgresPassword=secret123 \
  --set primary.persistence.size=50Gi

# Install with a values file (better for production)
helm install my-postgres bitnami/postgresql \
  -f postgres-values-prod.yaml \
  --namespace production

# List releases
helm list -A

# Check release status
helm status my-postgres -n production

# Upgrade a release
helm upgrade my-postgres bitnami/postgresql \
  -f postgres-values-prod.yaml \
  --namespace production

# Upgrade with atomic (rollback on failure)
helm upgrade my-postgres bitnami/postgresql \
  -f postgres-values-prod.yaml \
  --atomic \
  --timeout 5m

# Rollback
helm rollback my-postgres 1    # rollback to revision 1
helm history my-postgres       # show revision history

# Uninstall
helm uninstall my-postgres -n production

# Dry run (see what will be applied)
helm upgrade my-postgres bitnami/postgresql \
  -f postgres-values-prod.yaml \
  --dry-run
\`\`\`

## values.yaml: Environment Configuration

\`\`\`yaml
# values-prod.yaml — production overrides
replicaCount: 3

image:
  repository: mycompany/payments
  tag: "v2.1.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
  - host: api.mycompany.com
    paths:
    - path: /
      pathType: Prefix
  tls:
  - secretName: api-tls
    hosts:
    - api.mycompany.com

resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
\`\`\`

\`\`\`bash
# Apply different configs for dev vs prod
helm upgrade payments ./payments-chart -f values-prod.yaml
helm upgrade payments-dev ./payments-chart -f values-dev.yaml
\`\`\`

## Template Syntax

\`\`\`yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-app
  labels:
    app: {{ .Chart.Name }}
    version: {{ .Chart.Version }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        {{- if .Values.resources }}
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
        {{- end }}
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What's the difference between helm install and helm upgrade --install?",
              difficulty: "junior" as const,
              answer: `**helm install**: Creates a new release. Fails if the release already exists.

**helm upgrade --install**: Installs if the release doesn't exist, upgrades if it does. This is idempotent and the pattern used in CI/CD pipelines — you don't need to check whether it's a first deploy or an update.

\`\`\`bash
# CI/CD pipeline — works for both first deploy and updates:
helm upgrade --install payments ./payments-chart \
  -f values-prod.yaml \
  --namespace production \
  --create-namespace \   # create namespace if it doesn't exist
  --atomic \             # roll back if deployment fails
  --timeout 5m \
  --wait                 # wait for all pods to be ready
\`\`\`

**--atomic**: If the upgrade fails (pods fail to become ready), automatically rolls back to the previous release. Essential for production CD pipelines.

**--wait**: Blocks until all Deployments, StatefulSets have their desired pod count ready. Without this, the pipeline thinks the deploy succeeded even if pods are still starting.`,
            },
            {
              question: "How do you manage secrets with Helm? You can't commit passwords to values.yaml.",
              difficulty: "senior" as const,
              answer: `Several approaches, in order of preference:

**1. Helm + External Secrets Operator (best for production)**
Don't put secrets in Helm values at all. Use External Secrets to sync from AWS Secrets Manager:
\`\`\`yaml
# In your chart's templates/external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
spec:
  secretStoreRef:
    name: aws-secretsmanager
  target:
    name: {{ .Release.Name }}-db-secret
  data:
  - secretKey: password
    remoteRef:
      key: "{{ .Values.secretsManager.path }}"
\`\`\`

**2. helm-secrets plugin (git-friendly)**
Encrypts values files using SOPS + KMS/age:
\`\`\`bash
helm secrets enc secrets-prod.yaml   # encrypt
helm upgrade payments ./chart \
  -f values-prod.yaml \
  -f secrets://secrets-prod.yaml    # helm-secrets decrypts on the fly
\`\`\`

**3. CI/CD --set flag (simple but less auditable)**
\`\`\`bash
helm upgrade payments ./chart \
  -f values-prod.yaml \
  --set database.password=\${DB_PASSWORD}  # injected from CI secret store
\`\`\`

**What NOT to do**: Never put plaintext passwords in values.yaml and commit to git. This is one of the most common secret leak vectors — git history is forever.`,
            },
          ],
        },
      ],
    },
    {
      id: "production-kubernetes",
      title: "Production Kubernetes",
      level: "advanced",
      description: "Autoscaling, security hardening, and GitOps with ArgoCD.",
      lessons: [
        {
          id: "autoscaling",
          title: "Autoscaling Strategies",
          duration: 22,
          type: "lesson",
          description: "Scale pods and nodes automatically based on demand.",
          objectives: [
            "Configure HPA for CPU and custom metrics",
            "Understand VPA for right-sizing resource requests",
            "Use KEDA for event-driven autoscaling",
            "Configure Cluster Autoscaler for node scaling",
          ],
          content: `# Autoscaling Strategies

## The Four Scaling Dimensions

\`\`\`
┌─────────────────────────────────────────────────┐
│  Cluster Autoscaler → Add/Remove Nodes          │
│    ┌────────────────────────────────────┐        │
│    │  HPA → Scale Pod Replicas          │        │
│    │    ┌──────────────────────────┐    │        │
│    │    │  VPA → Resize Pod CPU/  │    │        │
│    │    │        Memory Requests  │    │        │
│    │    └──────────────────────────┘    │        │
│    └────────────────────────────────────┘        │
│  KEDA → Scale to Zero / Event-Driven            │
└─────────────────────────────────────────────────┘
\`\`\`

## HPA: Horizontal Pod Autoscaler

HPA scales replicas based on CPU, memory, or custom metrics.

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payments-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payments-api
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70    # scale when avg CPU > 70%
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60     # wait 60s before scaling up again
      policies:
      - type: Percent
        value: 100                        # max double the replicas at once
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300    # wait 5min before scaling down
      policies:
      - type: Pods
        value: 1                          # remove max 1 pod per 60s
        periodSeconds: 60
\`\`\`

\`\`\`bash
kubectl get hpa                           # current state
kubectl describe hpa payments-api-hpa     # see scaling events
\`\`\`

**Critical prerequisite**: HPA requires metrics-server to be installed. Without it, HPA shows "unknown" for current metrics and won't scale.

\`\`\`bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
\`\`\`

## VPA: Vertical Pod Autoscaler

VPA analyzes historical CPU/memory usage and recommends (or automatically applies) better resource requests.

\`\`\`yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: payments-api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payments-api
  updatePolicy:
    updateMode: "Off"    # Off (recommend only), Initial, Auto
\`\`\`

\`\`\`bash
# See recommendations without changing anything
kubectl describe vpa payments-api-vpa
# Output shows:
#   Lower bound: requests you can safely reduce to
#   Target: recommended requests
#   Upper bound: maximum you might need
\`\`\`

**Don't use HPA and VPA together** on the same CPU/memory metrics — they conflict. Use VPA to right-size requests, then HPA for replica count.

## KEDA: Event-Driven Autoscaling

KEDA extends HPA to scale on external events — SQS queue depth, Kafka lag, HTTP request rate, cron schedules.

\`\`\`yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor
spec:
  scaleTargetRef:
    name: order-processor
  minReplicaCount: 0    # scale to ZERO when no messages
  maxReplicaCount: 100
  triggers:
  - type: aws-sqs-queue
    metadata:
      queueURL: https://sqs.us-east-1.amazonaws.com/123456789/orders
      queueLength: "10"    # 1 pod per 10 messages in queue
      awsRegion: us-east-1
\`\`\`

**Scale to zero**: KEDA can scale deployments to 0 replicas when idle. No messages in queue → 0 pods (save cost). First message arrives → KEDA scales to 1+ pod. This is how serverless-style workloads run on Kubernetes.

## Cluster Autoscaler

Adds nodes when pods are Pending due to insufficient resources. Removes nodes when they're underutilized (< 50% for 10 minutes).

\`\`\`bash
# On EKS, deploy the Cluster Autoscaler
helm repo add autoscaler https://kubernetes.github.io/autoscaler
helm install cluster-autoscaler autoscaler/cluster-autoscaler \
  --set autoDiscovery.clusterName=my-cluster \
  --set awsRegion=us-east-1

# Check CA logs to see scaling decisions
kubectl logs -n kube-system -l app=cluster-autoscaler -f
\`\`\`
`,
          interviewQuestions: [
            {
              question: "Your HPA is set up but pods aren't scaling despite high CPU. What do you check?",
              difficulty: "mid" as const,
              answer: `**Step 1: Check HPA status**
\`\`\`bash
kubectl describe hpa my-hpa
# Look for:
#   Conditions: ScalingActive False → metrics not available
#   Current replicas vs desired replicas
#   Last scale event
\`\`\`

**Step 2: Check if metrics-server is running**
\`\`\`bash
kubectl get pods -n kube-system | grep metrics-server
kubectl top pods    # if this fails, metrics-server is down
\`\`\`

**Step 3: Check if resource requests are set**
HPA calculates utilization as \`actual_usage / requested_amount\`. If requests are not set, HPA can't calculate a percentage.
\`\`\`bash
kubectl describe pod my-pod | grep -A5 Requests
# If empty → set resource requests in the Deployment
\`\`\`

**Step 4: Check stabilization window**
HPA has a 5-minute scale-down stabilization window by default. For scale-up, check the behavior configuration.

**Step 5: Check maxReplicas**
Already at maxReplicas? Add more nodes (Cluster Autoscaler) or increase maxReplicas.

**Step 6: Check scaleTargetRef**
The HPA must reference the exact deployment name. A typo means it's watching a non-existent deployment.

Most common cause: **resource requests not set** — HPA shows "unknown/70%" for current metrics.`,
            },
            {
              question: "What's the difference between HPA and KEDA?",
              difficulty: "mid" as const,
              answer: `**HPA (Horizontal Pod Autoscaler)**:
- Native Kubernetes feature
- Scales on: CPU utilization, memory utilization, custom metrics via metrics-server/Prometheus adapter
- Minimum replicas: 1 (can't scale to zero)
- Works well for: web servers, APIs where CPU/memory is the bottleneck

**KEDA (Kubernetes Event-Driven Autoscaling)**:
- External operator that extends/replaces HPA
- Scales on: 60+ event sources — SQS queue depth, Kafka consumer lag, Redis list length, HTTP requests/second, Azure Service Bus, cron schedules
- Minimum replicas: **0** — can completely scale down to zero pods
- Works well for: batch processors, queue workers, scheduled jobs

**Example where KEDA shines**: You have an order processing service that reads from an SQS queue. At midnight, no orders → 0 pods running (no cost). At noon on Black Friday, 10,000 messages → KEDA scales to 100 pods.

With HPA, you'd need at least 1 pod always running (watching the queue), and CPU might not correlate with queue depth at all (the worker might be idle while the queue grows).

Many teams use both: KEDA for event-driven workloads, HPA for request-serving APIs.`,
            },
          ],
        },
        {
          id: "kubernetes-security",
          title: "Security: RBAC & Pod Security",
          duration: 22,
          type: "lesson",
          description: "Secure your Kubernetes cluster with RBAC, Pod Security Standards, and policy enforcement.",
          objectives: [
            "Design RBAC roles for least-privilege access",
            "Apply Pod Security Standards to prevent privilege escalation",
            "Integrate Vault for dynamic secret management",
            "Implement admission control with OPA/Kyverno",
          ],
          content: `# Kubernetes Security

## RBAC: Role-Based Access Control

Kubernetes RBAC controls who can do what. The model:

\`\`\`
User/ServiceAccount → RoleBinding/ClusterRoleBinding → Role/ClusterRole → Permissions
\`\`\`

**Role** (namespace-scoped) vs **ClusterRole** (cluster-wide):

\`\`\`yaml
# Role: developer can view pods and logs in production namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer-read
  namespace: production
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch"]
---
# RoleBinding: attach role to a user
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: alice-developer
  namespace: production
subjects:
- kind: User
  name: alice@mycompany.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer-read
  apiGroup: rbac.authorization.k8s.io
\`\`\`

\`\`\`bash
# Check what a user can do
kubectl auth can-i get pods --as=alice@mycompany.com -n production
kubectl auth can-i delete pods --as=alice@mycompany.com -n production
# Output: yes / no

# See all permissions for a service account
kubectl auth can-i --list --as=system:serviceaccount:production:payments-sa
\`\`\`

## ServiceAccounts for Pod Identity

Pods use ServiceAccounts to authenticate to the K8s API (and via IRSA, to AWS).

\`\`\`yaml
# Create a dedicated service account for payments
apiVersion: v1
kind: ServiceAccount
metadata:
  name: payments-sa
  namespace: production
  annotations:
    # IRSA: this SA can assume the AWS IAM role
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/payments-role
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: payments-role
  namespace: production
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["payments-db-secret"]  # only THIS secret
  verbs: ["get"]
---
# Assign SA to the deployment
spec:
  serviceAccountName: payments-sa
\`\`\`

## Pod Security Standards

Kubernetes has three built-in security profiles:

| Standard | Description | Blocks |
|----------|-------------|--------|
| **Privileged** | No restrictions | Nothing |
| **Baseline** | Minimal restrictions | Privileged containers, hostNetwork, hostPID |
| **Restricted** | Heavily restricted | + must run as non-root, no privilege escalation |

\`\`\`yaml
# Apply to a namespace
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/audit: restricted
\`\`\`

\`\`\`yaml
# Pod that passes restricted standard
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
\`\`\`

## Admission Control with Kyverno

Kyverno lets you write policies as Kubernetes resources:

\`\`\`yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-resource-limits
spec:
  rules:
  - name: check-container-resources
    match:
      resources:
        kinds: ["Pod"]
    validate:
      message: "Resource limits are required"
      pattern:
        spec:
          containers:
          - resources:
              limits:
                memory: "?*"
                cpu: "?*"
\`\`\`
`,
          interviewQuestions: [
            {
              question: "A pod keeps getting OOMKilled in production. Walk me through the debugging and fix.",
              difficulty: "mid" as const,
              answer: `OOMKilled means the container exceeded its memory limit — the kernel killed it.

**Step 1: Confirm OOMKilled**
\`\`\`bash
kubectl describe pod my-pod
# Last State: Terminated
#   Reason: OOMKilled
#   Exit Code: 137   ← 128 + 9 (SIGKILL)
\`\`\`

**Step 2: Check current limits and actual usage**
\`\`\`bash
kubectl describe pod my-pod | grep -A10 "Limits\|Requests"
kubectl top pod my-pod   # current memory usage
\`\`\`

**Step 3: Check historical usage (if you have Prometheus)**
\`\`\`
container_memory_working_set_bytes{pod=~"my-pod.*"}
\`\`\`

**Step 4: Determine root cause**
- **Legitimate growth**: App needs more memory → increase limit
- **Memory leak**: Memory grows until OOM → fix the leak (profile with pprof/heap dump)
- **Limit too aggressive**: Was set too low without profiling → use VPA recommendations

**Step 5: Fix**
\`\`\`yaml
resources:
  requests:
    memory: "256Mi"    # what the scheduler uses for placement
  limits:
    memory: "1Gi"      # increase from 512Mi if OOMKilled at 512Mi
\`\`\`

**Step 6: Prevent recurrence**
- Set up a Prometheus alert: \`container_memory_working_set_bytes / container_spec_memory_limit_bytes > 0.8\` → alert at 80% of limit
- Use VPA in "Off" mode to get recommendations without auto-applying

**Caution**: Don't set limits too high to avoid OOM — this causes other pods to be starved of memory. Find the right size.`,
            },
            {
              question: "How do you prevent containers from running as root in Kubernetes?",
              difficulty: "mid" as const,
              answer: `**Three layers of enforcement:**

**1. Pod Security Standards (cluster-level, built-in)**
\`\`\`yaml
# Label the namespace to enforce restricted standard
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
\`\`\`
The "restricted" standard requires \`runAsNonRoot: true\`.

**2. SecurityContext (pod/container level)**
\`\`\`yaml
spec:
  securityContext:
    runAsNonRoot: true      # any non-zero UID
    runAsUser: 1000         # specific UID
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]       # remove all Linux capabilities
\`\`\`

**3. Admission policy (Kyverno or OPA Gatekeeper)**
\`\`\`yaml
# Kyverno policy — reject any pod running as root
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-root-user
spec:
  rules:
  - name: check-runAsNonRoot
    match:
      resources:
        kinds: ["Pod"]
    validate:
      message: "Containers must not run as root"
      pattern:
        spec:
          containers:
          - =(securityContext):
              runAsNonRoot: true
\`\`\`

**In practice**: Start with Pod Security Standards (easier to enable), add Kyverno for more specific policies, and update Dockerfiles to use non-root users:
\`\`\`dockerfile
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser
\`\`\``,
            },
            {
              question: "Explain Kubernetes RBAC and how you'd restrict a developer's access to only view pods in one namespace.",
              difficulty: "junior" as const,
              answer: `RBAC (Role-Based Access Control) controls what API operations a subject (user, group, or service account) can perform on which resources.

**Components:**
- **Role/ClusterRole**: Defines permissions (what verbs on what resources)
- **RoleBinding/ClusterRoleBinding**: Grants a Role to a subject

**For a read-only developer in the "staging" namespace:**

\`\`\`yaml
# Step 1: Create a Role with only get/list/watch on pods
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-viewer
  namespace: staging
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]

---
# Step 2: Bind the Role to the developer
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: alice-pod-viewer
  namespace: staging
subjects:
- kind: User
  name: alice@mycompany.com   # from their identity provider
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-viewer
  apiGroup: rbac.authorization.k8s.io
\`\`\`

**Verify:**
\`\`\`bash
kubectl auth can-i get pods --as=alice@mycompany.com -n staging    # yes
kubectl auth can-i delete pods --as=alice@mycompany.com -n staging # no
kubectl auth can-i get pods --as=alice@mycompany.com -n production # no
\`\`\`

**Key principle**: Use Role (not ClusterRole + ClusterRoleBinding) to keep access namespaced. ClusterRoleBindings grant access cluster-wide — a developer with a ClusterRoleBinding for pod-viewer can read pods in all namespaces including kube-system.`,
            },
          ],
        },
        {
          id: "gitops-and-argocd",
          title: "GitOps & ArgoCD",
          duration: 22,
          type: "lesson",
          description: "Implement GitOps to manage Kubernetes deployments through Git.",
          objectives: [
            "Explain GitOps principles and why they improve reliability",
            "Deploy and configure ArgoCD",
            "Create ArgoCD Applications for automated sync",
            "Implement the App of Apps pattern for multi-cluster management",
          ],
          content: `# GitOps & ArgoCD

## What is GitOps?

GitOps is an operating model where **Git is the single source of truth** for infrastructure and application configuration. Every change to the cluster goes through a Git pull request.

**Four core principles (OpenGitOps):**
1. **Declarative**: The system is described declaratively (YAML, Helm values)
2. **Versioned**: All state is version-controlled (git history = audit log)
3. **Automatic**: Approved changes are applied automatically
4. **Continuous**: The system continuously ensures actual state matches desired state

**Why GitOps improves reliability:**
- **Audit trail**: Every change has a commit, a PR, a reviewer, a timestamp
- **Rollback**: \`git revert\` undoes any deployment in seconds
- **Consistency**: No snowflake configs — the cluster always matches git
- **Security**: Developers never need kubectl access to production

**Real-world:** Intuit uses ArgoCD to manage 50+ Kubernetes clusters across multiple AWS accounts. Weaveworks (creators of the GitOps pattern) uses it for all their production deployments.

## ArgoCD Architecture

\`\`\`
Git Repository
     │
     │ watches (webhook / polling)
     ▼
┌─────────────────────────────────────┐
│           ArgoCD                     │
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │  API Server  │ │  Repository  │  │
│  │  (UI + CLI)  │ │  Server      │  │
│  └──────────────┘ └──────────────┘  │
│  ┌──────────────────────────────┐   │
│  │  Application Controller      │   │
│  │  (reconciliation loop)       │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
     │
     │ applies manifests
     ▼
Kubernetes Cluster
\`\`\`

## Installing ArgoCD

\`\`\`bash
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access the UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Login via CLI
argocd login localhost:8080 --username admin --password <password>
\`\`\`

## Creating an ArgoCD Application

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payments-api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/mycompany/k8s-manifests
    targetRevision: main           # branch, tag, or commit SHA
    path: apps/payments/production # folder with K8s manifests
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true       # delete resources removed from git
      selfHeal: true    # revert manual kubectl changes
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
\`\`\`

## App of Apps Pattern

For managing many applications, use a "root" application that manages other Application objects:

\`\`\`
apps/
├── root-application.yaml      ← ArgoCD manages this
└── applications/
    ├── payments-app.yaml      ← ArgoCD App for payments
    ├── inventory-app.yaml     ← ArgoCD App for inventory
    └── auth-app.yaml          ← ArgoCD App for auth
\`\`\`

\`\`\`yaml
# root-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/mycompany/k8s-manifests
    path: applications/          # directory of Application manifests
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
\`\`\`

## The GitOps Workflow

\`\`\`
Developer → PR: update payments:v2 → v3
    ↓
Code Review + CI tests pass
    ↓
PR merged to main
    ↓
ArgoCD detects change (webhook or 3-min polling)
    ↓
ArgoCD syncs: runs kubectl apply with new manifests
    ↓
Kubernetes performs rolling update
    ↓
ArgoCD reports: Healthy + Synced
\`\`\`

\`\`\`bash
# Manual sync (if not automated)
argocd app sync payments-api

# Check sync status
argocd app get payments-api
argocd app list

# Rollback via git
git revert HEAD
git push origin main
# ArgoCD auto-syncs back to previous version
\`\`\`
`,
          interviewQuestions: [
            {
              question: "What is GitOps and how does it differ from traditional CI/CD?",
              difficulty: "mid" as const,
              answer: `**Traditional CI/CD (push model)**:
\`\`\`
Developer commits → CI builds image → CD pipeline runs kubectl apply → cluster updated
\`\`\`
The CD pipeline has kubectl/kubeconfig credentials and actively pushes changes to the cluster.

**GitOps (pull model)**:
\`\`\`
Developer commits → CI builds image + updates manifest in git → 
ArgoCD detects git change → ArgoCD pulls and applies → cluster updated
\`\`\`
The cluster's GitOps operator (ArgoCD/Flux) pulls desired state from git. No external system needs cluster credentials.

**Key differences:**

| Aspect | Traditional CD | GitOps |
|--------|---------------|--------|
| Credentials | CD system has kubectl access | ArgoCD runs inside the cluster |
| Audit trail | CI logs (ephemeral) | Git commits (permanent) |
| Drift detection | None — runs once | Continuous — reverts unauthorized changes |
| Rollback | Re-run old pipeline | \`git revert\` or click in ArgoCD UI |
| Source of truth | Whatever is running | Git repository |

**Self-healing**: If someone runs \`kubectl scale deployment payments --replicas=0\` in production, ArgoCD (with selfHeal: true) detects the drift within 3 minutes and applies the git-defined value back. This prevents snowflake configurations.`,
            },
            {
              question: "How do you handle a situation where ArgoCD has synced a bad deployment and the app is down?",
              difficulty: "senior" as const,
              answer: `**Immediate response (first 2 minutes):**

**Option 1: Revert in git (preferred — maintains GitOps)**
\`\`\`bash
git revert HEAD --no-edit
git push origin main
# ArgoCD auto-syncs → Kubernetes rolls back
# Downtime limited to ArgoCD polling interval (default 3 min) or use webhook for instant sync
\`\`\`

**Option 2: ArgoCD history rollback (faster but creates git drift)**
\`\`\`bash
argocd app history payments-api  # find the last healthy revision
argocd app rollback payments-api <revision-number>
\`\`\`
This deploys the previous git commit's state but doesn't change git HEAD — creates drift. Follow up with a git revert to sync them.

**Option 3: Emergency kubectl (last resort)**
\`\`\`bash
kubectl rollout undo deployment/payments-api -n production
\`\`\`
This will be reverted by ArgoCD on next sync (selfHeal: true). Disable auto-sync first:
\`\`\`bash
argocd app set payments-api --sync-policy none
\`\`\`

**Root cause prevention:**
1. **Progressive delivery**: Use Argo Rollouts (canary/blue-green) so bad deploys only hit 5% of traffic before full rollout
2. **Health checks**: ArgoCD won't mark a sync as Healthy until pods are Ready
3. **Sync windows**: Block auto-sync during business hours, only allow off-peak
4. **Required PR approval**: Enforce CODEOWNERS so production manifests need a second reviewer`,
            },
          ],
        },
      ],
    },
  ],
};
