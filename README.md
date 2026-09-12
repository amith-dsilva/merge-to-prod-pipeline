# Merge-to-Production Pipeline Demo

This project demonstrates a simple, reliable CI/CD pipeline that replaces a manual deployment process based on SSH, `git pull`, and application restarts.

The goal is to demonstrate what happens between:

> **A pull request being opened → validation → merge → database migration → application deployment → health verification**

The implementation intentionally keeps the application small so the focus remains on CI/CD, deployment safety, database migrations, and failure handling.

---

## Tech Stack

### Application

* Node.js
* TypeScript
* Express.js
* PostgreSQL
* `pg` connection pooling
* Zod for request/environment validation

### Code Quality

* ESLint
* TypeScript type checking
* Vitest for unit testing

### Database Migration

* Flyway Community Edition
* Versioned SQL migrations
* Flyway schema history
* Grouped migrations using `group=true`

### Deployment

* Docker
* GitHub Actions
* GitHub self-hosted runner
* Application health check

---

# Architecture

The current local deployment architecture is:

```text
GitHub
   |
   | Pull Request / Push
   v
GitHub Actions
   |
   v
Self-hosted Runner
   |
   +-----------------------------+
   |                             |
   | CI Validation               | Deployment
   |                             |
   | npm ci                      | Flyway migration
   | ESLint                      | Docker build
   | TypeScript check            | Replace container
   | Unit tests                  | Start application
   | Build                       | Health check
   |                             |
   +-----------------------------+
                                 |
                                 v
                          Node.js Container
                                 |
                                 v
                           PostgreSQL
```

For this demo, PostgreSQL and Flyway run on the host machine while the Node.js application runs inside Docker.

---

# Project Structure

```text
merge-to-prod-pipeline/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
│
├── tests/
│   └── product.service.test.ts
│
├── migrations/
│   ├── V1__initial_schema.sql
│   ├── V2__add_product_category.sql
│   └── V3__add_product_sku.sql
│
├── .github/
│   └── workflows/
│       └── pipeline.yml
│
├── Dockerfile
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

# Application Design

The backend follows a simple layered structure:

```text
Request
   |
   v
Route
   |
   v
Controller
   |
   v
Service
   |
   v
Repository
   |
   v
PostgreSQL
```

This keeps HTTP handling, business logic, and database access separated.

Example APIs:

```text
GET  /api/v1/health

GET  /api/v1/products
GET  /api/v1/products/:id
POST /api/v1/products
```

The `/health` endpoint verifies that the application can also connect to PostgreSQL.

---

# Prerequisites

A clean Linux machine requires:

* Git
* Node.js 22+
* npm
* PostgreSQL 16+
* Flyway CLI
* Docker
* Docker Compose plugin (optional for the current implementation)
* GitHub self-hosted runner for local deployment automation

Verify installations:

```bash
git --version

node --version
npm --version

psql --version

flyway -v

docker --version
docker compose version
```

Docker should also work without `sudo`:

```bash
docker ps
```

If Docker requires `sudo`, add the current user to the Docker group:

```bash
sudo usermod -aG docker $USER
```

Then log out and log back in before continuing.

---

# Clone the Repository

```bash
git clone https://github.com/amith-dsilva/merge-to-prod-pipeline.git

cd merge-to-prod-pipeline
```

Install dependencies:

```bash
npm ci
```

---

# Environment Configuration

Create a local `.env` file based on:

```text
.env.example
```

Example:

```env
NODE_ENV=development
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=zenalyst_db
DB_USER=postgres
DB_PASSWORD=your_password
```

The `.env` file is intentionally excluded from Git.

Secrets used by GitHub Actions are stored using GitHub Repository Secrets instead of being committed to the repository.

Required repository secrets:

```text
DB_NAME
DB_USER
DB_PASSWORD
```

Configure them under:

```text
GitHub Repository
→ Settings
→ Secrets and variables
→ Actions
```

---

# Database Setup

Create the application database:

```bash
psql -U postgres
```

Then:

```sql
CREATE DATABASE zenalyst_db;
```

Exit PostgreSQL:

```sql
\q
```

---

# Database Migrations

Flyway is used for database versioning.

Migration files are stored in:

```text
migrations/
```

Example:

```text
V1__initial_schema.sql
V2__add_product_category.sql
V3__add_product_sku.sql
```

The initial migration:

* creates the `products` table
* inserts sample product data

Run migrations:

```bash
flyway \
  -url=jdbc:postgresql://localhost:5432/zenalyst_db \
  -user=postgres \
  -password=YOUR_PASSWORD \
  -locations=filesystem:./migrations \
  -group=true \
  migrate
```

Flyway automatically creates:

```text
flyway_schema_history
```

This table records which migrations have already been executed.

Migration status can be inspected using:

```bash
flyway \
  -url=jdbc:postgresql://localhost:5432/zenalyst_db \
  -user=postgres \
  -password=YOUR_PASSWORD \
  -locations=filesystem:./migrations \
  info
```

---

# Migration Failure Handling

A key requirement of this assignment is assuming that:

> A database migration will eventually fail.

Flyway is executed with:

```text
group=true
```

For PostgreSQL transactional migrations, this groups pending migrations into a single transaction.

For example:

```text
Current database:

V1 ✅

Pending:

V2 ✅
V3 ❌
```

If `V3` fails:

```text
BEGIN

V2 ✅
V3 ❌

ROLLBACK
```

The database remains at:

```text
V1
```

instead of leaving the schema partially migrated.

The CI/CD pipeline also stops immediately when Flyway returns a failure.

Therefore:

```text
Migration success
       |
       v
Continue deployment


Migration failure
       |
       v
Stop pipeline
       |
       v
Do NOT deploy new application
```

This prevents an application version that expects a new schema from being deployed against an incompatible database.

For destructive or complex schema changes in a real production system, I would additionally use backward-compatible migrations and an **expand → migrate → contract** strategy rather than relying only on rollback.

---

# Run Locally Without Docker

Start the application:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

Example response:

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

---

# Code Quality

## ESLint

Run linting:

```bash
npm run lint
```

Automatically fix supported lint issues:

```bash
npm run lint:fix
```

The ESLint configuration checks for issues such as:

* unused variables
* unused parameters
* unnecessary `var`
* variables that should use `const`
* explicit `any`
* common JavaScript mistakes
* common TypeScript mistakes
* selected stylistic consistency rules

Lint failures return a non-zero exit code, causing CI validation to fail.

---

# Type Checking

Run:

```bash
npm run typecheck
```

This executes:

```text
tsc --noEmit
```

TypeScript validates the application without generating build output.

---

# Unit Tests

Vitest is used for unit testing.

Run:

```bash
npm test
```

The current implementation contains unit tests around the product service.

Examples include:

```text
Get all products

Get a product by ID

Return 404 when a product does not exist

Create a product
```

The repository layer is mocked so these tests validate service behavior independently from PostgreSQL.

---

# Build

Compile TypeScript:

```bash
npm run build
```

Compiled JavaScript is generated under:

```text
dist/
```

Run the compiled application:

```bash
npm start
```

---

# Docker

The Node.js application is packaged using a multi-stage Docker build.

Build the image:

```bash
docker build \
  -t merge-to-prod-pipeline .
```

For this local Linux demo, the application container uses host networking so it can connect to PostgreSQL running directly on the machine.

Run:

```bash
docker run -d \
  --name merge-to-prod-pipeline \
  --network host \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DB_HOST=127.0.0.1 \
  -e DB_PORT=5432 \
  -e DB_NAME=zenalyst_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=YOUR_PASSWORD \
  merge-to-prod-pipeline
```

Check container status:

```bash
docker ps
```

Check logs:

```bash
docker logs merge-to-prod-pipeline
```

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

---

# CI/CD Pipeline

The workflow is stored in:

```text
.github/workflows/pipeline.yml
```

The workflow supports two major scenarios.

## Pull Request

When a pull request targets `master`:

```text
Pull Request
     |
     v
Checkout
     |
     v
Install dependencies
     |
     v
ESLint
     |
     v
TypeScript check
     |
     v
Unit tests
     |
     v
Application build
     |
     v
Validation complete
```

If any step fails:

```text
CI fails
```

and the PR should not be merged.

Branch protection can be configured to require this workflow to pass before merging.

---

## Merge / Push to Master

After a PR is merged into `master`:

```text
Push to master
      |
      v
Validation
      |
      v
Flyway migrations
      |
      v
Docker build
      |
      v
Remove previous container
      |
      v
Start new container
      |
      v
Health check
      |
      v
Deployment successful
```

If Flyway fails:

```text
Flyway ❌
   |
   v
Pipeline stops

Docker deployment is skipped
```

---

# GitHub Self-Hosted Runner

The deployment job runs on a GitHub self-hosted runner installed on the Linux machine.

The runner is intentionally kept outside the repository:

```text
~/Learning/
│
├── actions-runner/
│
└── merge-to-prod-pipeline/
```

To start the runner manually:

```bash
cd ~/Learning/actions-runner

./run.sh
```

Expected output:

```text
Connected to GitHub

Listening for Jobs
```

For a production setup, the runner should run as a system service instead of being started manually.

---

# Assumptions

For this assignment I made the following assumptions:

1. The goal is to demonstrate a reliable deployment lifecycle rather than build a feature-complete business application.

2. The demo runs on a Linux machine.

3. PostgreSQL and Flyway are installed on the host machine.

4. The Node.js application is packaged and deployed as a Docker container.

5. A GitHub self-hosted runner is used so GitHub Actions can demonstrate deployment to the local machine.

6. `master` represents the production branch for this simplified implementation.

7. Pull requests are the expected way to introduce changes to `master`.

8. PostgreSQL is used because it supports transactional DDL for the migration scenarios demonstrated here.

9. GitHub repository secrets are used for database credentials.

10. Database migrations are executed before the new application container is promoted.

---

# What I Intentionally Left Out

## QA and UAT environments

A production organization would usually have environments such as:

```text
Development
QA
UAT / Staging
Production
```

For this assignment, I used only `master` and a local production-like environment to keep the implementation focused and reproducible.

The same workflow could later be extended with GitHub Environments and deployment approvals.

---

## Kubernetes

Kubernetes was intentionally not introduced.

For a team of approximately eight engineers and a small application, it would add significant operational complexity without improving the core CI/CD demonstration.

A managed container platform such as ECS would be a more pragmatic next step for a cloud deployment.

---

## Terraform

Terraform was not included because this implementation does not provision cloud infrastructure.

If the system were deployed to AWS, Terraform could manage resources such as:

```text
VPC
ECR
ECS
RDS
Load Balancer
IAM
Secrets
Monitoring
```

---

## Jenkins

Jenkins was not added because GitHub Actions already provides the required CI/CD functionality.

Using both GitHub Actions and Jenkins would unnecessarily duplicate responsibilities for this project.

---

## Docker Compose

Docker Compose is installed and available, but it is not required by the current implementation because PostgreSQL and Flyway already run directly on the host machine.

If the objective were to make the complete stack fully containerized and portable, Docker Compose would be a logical next step:

```text
API
PostgreSQL
Flyway
```

could then be started together.

---

## Full Integration Test Suite

The current implementation includes a focused unit test suite.

Given the time and scope of the assignment, I prioritized demonstrating automated test enforcement in CI over building a large test suite.

A production implementation should additionally include:

* repository integration tests
* API integration tests
* database migration tests
* smoke tests
* potentially end-to-end tests

# Key Design Goal

The main objective of this implementation is to move deployment from:

```text
Someone remembers to test
        |
        v
SSH into server
        |
        v
git pull
        |
        v
restart
```

to:

```text
Pull Request
      |
      v
Automated validation
      |
      v
Review / merge
      |
      v
Database migration
      |
      v
Immutable Docker build
      |
      v
Deployment
      |
      v
Health verification
```

The pipeline is designed to fail early and stop deployment whenever validation, migration, build, or application health checks fail.
