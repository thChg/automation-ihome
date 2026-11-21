# Project Memory

## 1. Project overview and goals

Build and deploy a low-cost, maintainable backend system using NestJS and PostgreSQL on a single AWS EC2 instance. The initial stage prioritizes simplicity and operational reliability over high availability.

Primary objectives:
- Run a Node.js 24 / NestJS backend.
- Use PostgreSQL as the only primary database.
- Use Drizzle ORM and explicit Drizzle migrations.
- Package backend and database with Docker Compose.
- Deploy images through AWS ECR and GitHub Actions using AWS SSM and OIDC.
- Back up PostgreSQL to AWS S3 and document restore procedures.
- Avoid exposing PostgreSQL to the public Internet.

## 2. Technology stack and agreed versions

- Runtime: Node.js 24 (exact patch version to be finalized and pinned in the Docker image).
- Backend framework: NestJS (major/minor versions to be pinned after project initialization).
- Frontend: Vite with React, TypeScript, and React DOM.
- Frontend build tooling: Vite 8 and TypeScript 7 in the generated scaffold.
- Frontend API calls: Axios; endpoint definitions live in `frontend/src/api/`.
- ORM: Drizzle ORM with a PostgreSQL driver.
- Database: PostgreSQL (exact major/minor version to be finalized during implementation).
- Containers: Docker and Docker Compose.
- Reverse proxy: Nginx is optional in the initial deployment and should only be added if HTTPS/public routing is required.
- Cloud: AWS EC2, EBS, ECR, S3, IAM, SSM, and optionally CloudWatch.
- CI/CD: GitHub Actions with OIDC authentication.

Status: Planned. No application or infrastructure implementation exists yet; this is an empty repository.

## 3. Current architecture

```text
Developer -> GitHub Repository -> GitHub Actions
                                      |
                                      v
                                    AWS ECR
                                      |
                                      v
                         AWS EC2 via AWS SSM
                                      |
                           Docker Compose network
                       +----------+----------+
                       |                     |
                   NestJS Backend       PostgreSQL
                       |                     |
                   health endpoint      Docker volume
                                           on EBS

                                Optional Nginx
                         (public HTTP/HTTPS reverse proxy)
```

Database traffic stays on the Docker Compose internal network. PostgreSQL 5432 is not published to the EC2 host or Internet.

## 4. PostgreSQL deployment strategy

- Status: Planned.
- Deploy exactly one PostgreSQL container for the initial stage.
- Store data in a Docker named volume backed by persistent EC2/EBS storage.
- Configure a container health check and restart policy.
- Provide database credentials only through environment variables or a secrets mechanism.
- Do not expose PostgreSQL's 5432 port publicly.
- Database connection is restricted to the backend container via the Compose network and firewall rules.
- A single PostgreSQL instance is accepted as the availability model for stage 1.

Deferred and explicitly not planned for stage 1:
- PostgreSQL replication.
- Primary/replica or primary/standby topology.
- PostgreSQL clusters.
- Patroni.
- etcd.
- HAProxy for database traffic.
- Automatic database failover.
- Multi-AZ deployment.

## 5. Docker Compose architecture and networking

Compose configuration is split:
- `compose.yaml`: shared PostgreSQL service and persistent volume/network; PostgreSQL has no published host port.
- `compose.dev.yaml`: development-only NestJS backend using the Node 24 image, source bind mount, named `node_modules` volume, and `nest start --watch`.
- `compose.prod.yaml`: production backend image and one-shot migration service.
- Optional `nginx`: public reverse proxy for HTTP/HTTPS if required.

Development commands:
- `npm run docker:dev`: start PostgreSQL and the watched backend.
- `npm run docker:migrate`: run migrations through the production migration target.
- `npm run docker:prod`: recreate PostgreSQL-shared production services with immutable-style backend images.

Planned networks:
- An internal Compose network for backend/database traffic; PostgreSQL is attached only to this network.
- A separate public ingress network for backend host ports/Nginx.
- A public-facing port on backend/Nginx only, unless a non-HTTP deployment mechanism is chosen later.

Planned operational constraints:
- Database container is not recreated or removed during backend-only deployments.
- A one-shot migration service or explicitly locked migration command runs migrations separately.
- Compose configuration separates development behavior from production configuration where useful.
- Secrets are supplied at runtime and are not committed to Compose files or source code.

## 6. AWS infrastructure decisions

- EC2 instance size and AWS region remain workload-dependent decisions and are not assumed in implementation.
- PostgreSQL data uses an EBS-backed persistent volume; the volume must be included in backup and recovery planning.
- ECR stores versioned backend Docker images.
- S3 stores PostgreSQL logical backups and backup metadata.
- EC2 uses an IAM role for least-privilege ECR pull and S3 backup permissions.
- GitHub Actions authenticates with AWS using OIDC; long-lived AWS access keys are not used.
- GitHub Actions connects to EC2 through AWS Systems Manager Session Manager/SSM commands, not SSH.
- Security groups allow only required public ports, such as 80/443 through Nginx or the backend public endpoint, and required management traffic. PostgreSQL 5432 is not publicly allowed.
- Basic monitoring should cover EC2 CPU, RAM, disk, database connections, container health, and application health.
- Disk-space alerts are required before production data is accepted.

## 7. CI/CD workflow

Planned pipeline:
1. On push, run lint and tests.
2. Build and test the Docker image.
3. Push an immutable image tag to ECR.
4. Assume an AWS deployment role through GitHub OIDC.
5. Send an SSM command to the EC2 instance.
6. Pull the new image and verify its availability.
7. Run database migrations once using a deployment lock or one-shot migration job.
8. Recreate only the backend container and preserve the PostgreSQL container and volume.
9. Check the backend health endpoint.
10. Keep the previous backend image tag for rollback.
11. On migration or health failure, stop deployment and restore the previous backend image. Database rollback is handled separately and only where a migration is safely reversible.

Deployment concurrency must be prevented so migrations or backend deployments cannot run simultaneously from multiple workflow runs or replicas.

## 8. Environment variables and secrets

No secret values are stored in this repository.

Planned environment variables include:
- Database host, port, name, application user, and application password.
- AWS region and optional S3 backup configuration.
- Backend runtime environment and public listen port.
- Optional Nginx/TLS configuration.
- `AUTH_BOOTSTRAP_EMAIL` and `AUTH_BOOTSTRAP_PASSWORD` for the initial database-backed admin account.
- `JWT_SECRET` for JWT signing and `JWT_EXPIRES_IN` for token lifetime.

Recommended secret sources:
- AWS SSM Parameter Store (SecureString) or AWS Secrets Manager for EC2 runtime secrets.
- GitHub Actions OIDC role for deployment credentials.
- A protected `.env` file on EC2 with restrictive permissions only for Compose runtime injection.
- `.env.example` may contain variable names only and must never contain real secrets.

Secret lifecycle:
- Rotate database credentials periodically.
- Restrict read permissions to the EC2 IAM role and deployment automation as appropriate.
- Never print secret values in logs or workflow output.

## 9. Database migration, backup and restore strategy

### Migrations
- Drizzle schema migrations are source-controlled.
- Migrations run only in the deployment process, never automatically during every backend container startup.
- Exactly one migration job runs per deployment.
- Migration execution must be serialized using repository/workflow concurrency controls and ideally a database deployment lock.
- Forward migrations should be reviewed for reversibility and compatibility with the prior application image.

### Backup
- Planned backup mechanism: scheduled logical PostgreSQL dumps (for example `pg_dump`) compressed and uploaded to S3.
- Backups run outside application startup and include timestamps and/or immutable identifiers.
- S3 retention, lifecycle transitions, and encryption settings must be approved before production use.
- EC2 IAM permissions are limited to required ECR and S3 operations.

### Restore
- Planned restore process:
  1. Stop backend traffic and application writes.
  2. Preserve or snapshot the existing data volume.
  3. Provision an isolated database/restore target.
  4. Restore the selected dump into PostgreSQL.
  5. Verify schema, critical data, application health, and row counts.
  6. Resume traffic only after validation.
- A restoration runbook will be committed and must be tested regularly.

Status: Planned, not yet implemented or validated.

## 10. Architecture decisions and deferred options

Confirmed decisions:
- Simple single-EC2, single-PostgreSQL deployment in stage 1.
- Docker Compose is used rather than Kubernetes or managed database infrastructure.
- PostgreSQL data is persistent on EBS through a Docker volume.
- Drizzle migrations run separately from application startup.
- GitHub Actions uses OIDC and AWS SSM for deployment.
- ECR is the backend image registry and S3 is the database backup store.
- PostgreSQL is not published outside the Compose network.

Deferred until workload, availability, or compliance requirements justify it:
- RDS or other managed PostgreSQL.
- PostgreSQL replication and HA.
- Multi-EC2 and Multi-AZ deployments.
- Kubernetes or ECS.
- Redis/cache tier.
- Queue workers and asynchronous infrastructure.
- HAProxy/database proxy.
- TLS/certificate automation if Nginx is not initially required.

## 11. Implementation status

- Completed: persistent project memory and architecture confirmation.
- In Progress: NestJS project and Drizzle integration.
- Completed: PostgreSQL schema seed and initial Drizzle migration generation.
- Completed: Dockerfile and separated development/production Compose configurations.
- Completed: Vite + React + TypeScript frontend scaffold in `frontend/`.
- Completed: initial frontend dependency installation and build/lint validation.
- Completed: Vite development proxy from `/api` to the local NestJS backend health endpoint.
- Completed: frontend backend-health status card.
- Completed: backend users table and bootstrap admin seeding from environment variables.
- Completed: JWT login/logout/session endpoints with HTTP-only cookies.
- Completed: frontend login screen and authenticated dashboard shell.
- Completed: frontend API layer refactor with Axios and centralized endpoint definitions.
- Completed: frontend auth and dashboard UI separated into feature folders.
- Completed: global frontend user/session state managed by `AuthContext` and `useAuth`.
- In Progress: local end-to-end validation.
- Not started: AWS EC2, EBS, ECR, S3, IAM, and Security Group setup.
- Not started: first EC2 deployment.
- Not started: GitHub Actions CI/CD.
- Not started: database backup and restore automation.
- Not started: deployment, rollback, and recovery validation.

Repository state: reorganized as a monorepo. `backend/` contains the NestJS, Drizzle, Docker, migration, test, and documentation implementation. `frontend/` contains a generated Vite + React + TypeScript application.

## 12. Important technical issues and constraints

- A single PostgreSQL instance has no automatic failover. EC2/EBS recovery and restore procedures are mandatory.
- EBS storage is not a substitute for tested database backups.
- The database container must never be recreated by a backend-only deployment.
- Migration failures can make application rollout unsafe; migrations need validation and deployment sequencing.
- Docker named volumes preserve database data across container recreation but not EC2 loss or accidental volume deletion.
- Host RAM and disk capacity must be considered because PostgreSQL, Node.js, Docker, and optional Nginx share the instance.
- EC2 instance type and region must be chosen from actual workload and budget estimates.
- Node.js 24 and final framework/library versions must be pinned reproducibly before implementation.
- PostgreSQL major version upgrades require a separate, tested migration strategy; Docker Compose should pin the major version.
- S3 backup retention, encryption, restore testing, and deletion protection require explicit policy decisions.
- GitHub Actions concurrency and database migration locking are required to prevent simultaneous deployments.
- Health checks must verify application readiness, including database reachability, without exposing sensitive details.
