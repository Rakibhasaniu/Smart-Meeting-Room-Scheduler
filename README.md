# Smart Meeting Room Scheduler

> An intelligent meeting room scheduling system eliminating time clashes and optimizing resource utilization with AI-based algorithms.

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-hasan456%2Fmeeting--room--scheduler-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/hasan456/meeting-room-scheduler)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/Rakibhasaniu/Smart-Meeting-Room-Scheduler/actions)
[![Tests](https://img.shields.io/badge/Tests-45%20passing-success?logo=jest)](https://github.com/Rakibhasaniu/Smart-Meeting-Room-Scheduler)
[![Coverage](https://img.shields.io/badge/Coverage-56%25-yellow)](https://github.com/Rakibhasaniu/Smart-Meeting-Room-Scheduler)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🚀 Quick Start

**Deploy in 30 seconds:**
```bash
docker pull hasan456/meeting-room-scheduler:latest && docker-compose up -d
```

**Default Admin Account** (Auto-created on first run):
```
📧 Email:    rakib@gmail.com
🔑 Password: admin12345
```



## ???? Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Testing](#-testing)
- [Docker & Containerization](#-docker--containerization)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
---

##  The Problem

A typical tech firm with 10 meeting rooms faces these everyday problems:

- 30 minutes wasted daily** per employee searching for vacant meeting rooms
- Over-booking disputes** causing schedule chaos and frustration
- Resource wastage** booking huge meeting rooms for tiny meetings
- No visibility** of room availability across floors
- Manual coordination** and hence double bookings and confusion
---

##  Our Solution

Smart Meeting Room Scheduler uses an intelligent allocation algorithm which:

 **Identifies ideal rooms** in seconds based on size, equipment, and budget
 **Prevents conflicts** with automatic overlap detection
 **Saves costs** by suggesting appropriately-sized rooms
 **Suggests alternatives** if preferred dates are not available
 **Auto-releases** unused bookings automatically
 **Accommodates prioritizing** based on seniority (CEO gets top priority)
**Outcome:** Reduce scheduling time from 30 minutes to **30 seconds** ⚡
---

## ✨ Key Features

###  Intelligent Room Allocation

Our sophisticated scoring algorithm considers many factors:

- Capacity Optimization (30% weight) -rooms
- Equipment Matching (25% weight) - Projectors, whiteboard, video conferencing
- Cost Minimization (20% weight) - cost
- Location Preference (15% weight) - preference room if choice is blocked
- Time Flexibility (10% weight) -  best available time

###  Role-Based Access Control

Four user roles with fine-grained permissions:

- ** USER** - Book rooms, view own bookings
- ** MANAGER** - See team bookings, create reports
- ** CEO** - Highest priority, all privileges
- ** ADMIN** - Full system control, administer rooms and users

###  Smart Features

- **15-minute buffer** between meetings for room cleaning
- **Auto-release** of unused bookings
- **Alternative suggestions** when there are conflicts
- **Cost optimization** recommendations
- **Conflict resolution** with priority-based allocation
---
## Tech Stack

### Backend

- **Runtime:** Node.js  with TypeScript
- **Framework:** Express.js (RESTful API)
- **Database:** MongoDB  with Mongoose 
- **Authentication:** JWT 
- **Validation:** Zod schema validation
- **Documentation:** Swagger

### Testing & Quality

- **Testing:** Jest + Supertest (45 integration tests)
- **Coverage:** 56% code coverage
- **Linting:** ESLint + Prettier

### DevOps & Deployment

- **Containerization:** Docker + Docker Compose (Multi-stage builds)
- **CI/CD:** GitHub Actions (Test-first deployment)
- **Registry:** Docker Hub (Automated image publishing)
- **Monitoring:** Health checks + logging

**Deployment Flow:**
```
Code Push → Run 45 Tests → Build Docker Image → Push to Docker Hub
           ✅ 100% Pass   ✅ Multi-stage      ✅ hasan456/meeting-room-scheduler
```
---

##  Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (recommended)

### Option 1: Docker (Recommended)

# 1. Clone repository
git clone https://github.com/Rakibhasaniu/Smart-Meeting-Room-Scheduler.git
cd "Smart Meeting Room Scheduler"

# 2. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 3. Start with Docker
npm run docker:dev:build

# 4. Access the application
# API: http://localhost:5005
# Swagger Docs: http://localhost:5005/api-docs


### Option 2: Local Development


# 1. Clone repository
git clone https://github.com/Rakibhasaniu/Smart-Meeting-Room-Scheduler.git
cd "Smart Meeting Room Scheduler"

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# Edit .env with your MongoDB URL and secrets

# 4. Run development server
npm run start:dev

# 5. Access at http://localhost:5005

---
##  API Documentation

**Swagger UI:** http://localhost:5005/api-docs


#### Authentication
```
POST /api/auth/register      # Register new user
POST /api/auth/login         # Login (get tokens)
POST /api/auth/change-password  # Change password
```

#### Intelligent Allocation
```
POST /api/room-allocation/find-optimal  # Find best room

```

**Request Example:**
```json
{
  "attendees": ["user1@example.com", "user2@example.com"],
  "duration": 60,
  "requiredEquipment": ["projector", "whiteboard"],
  "preferredStartTime": "2025-10-30T10:00:00Z",
  "flexibility": 30,
  "priority": "high"
}
```

#### Rooms
```
GET    /api/rooms           # Get all rooms
POST   /api/rooms           # Create room (Admin)
```
PATCH /api/rooms/:id       # Update room (Admin)
DELETE /api/rooms/:id       # Delete room (Admin)
```

#### Bookings
```
GET    /api/bookings        # Get bookings
POST   /api/bookings        # Create booking
DELETE /api/bookings/:id    # Cancel booking
```
---
## ????️ Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete documentation.

```
Client → Express API → Business Logic → MongoDB
        (Auth/RBAC)   (Services)      (Collections)
```

---

## ???? Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

**Coverage:**
- Overall: 56.48%
- Auth Module: 73.07%
- Room Module: 86.17%
- Allocation Module: 83.33%

**Integration Tests:** 45 tests covering authentication, room management, and booking workflows

---

## 🐳 Docker & Containerization

### Why Docker?

This project is **fully containerized** for consistent deployment across all environments:

✅ **Multi-stage builds** - Optimized production images (~150MB)
✅ **Non-root user** - Enhanced security with dedicated nodejs user
✅ **Health checks** - Automatic container health monitoring
✅ **Docker Compose** - One-command setup for dev and production

### Quick Start with Docker

```bash
# Development environment (with hot reload)
npm run docker:dev:build

# Production environment (optimized)
npm run docker:prod:build

# View logs
npm run docker:logs

# Stop all containers
npm run docker:down
```

### Pull Pre-built Image

```bash
# Pull from Docker Hub
docker pull hasan456/meeting-room-scheduler:latest

# Run the container
docker run -p 5005:5005 --env-file .env hasan456/meeting-room-scheduler:latest
```

**Docker Hub:** [`hasan456/meeting-room-scheduler`](https://hub.docker.com/r/hasan456/meeting-room-scheduler)

---

## 🔄 CI/CD Pipeline

### Automated Test-First Deployment

Every code push triggers our **GitHub Actions pipeline** with 4 stages:

```
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: TEST (3m 26s total)                               │
├─────────────────────────────────────────────────────────────┤
│  ✅ Run 45 integration tests with MongoDB                   │
│  ✅ Generate code coverage report                           │
│  ✅ Lint code with ESLint                                   │
│  ❌ FAIL → Pipeline stops, no deployment                    │
│  ✅ PASS → Continue to build                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: BUILD DOCKER IMAGE                                │
├─────────────────────────────────────────────────────────────┤
│  🐳 Build multi-stage Docker image                          │
│  🏷️  Tag: latest, git-sha                                   │
│  📦 Optimize layers for faster builds                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: PUSH TO DOCKER HUB                                │
├─────────────────────────────────────────────────────────────┤
│  🚀 Push to hasan456/meeting-room-scheduler                 │
│  ✅ Image available for deployment                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: DOCKER COMPOSE VERIFICATION                       │
├─────────────────────────────────────────────────────────────┤
│  🔍 Test docker-compose.yml syntax                          │
│  ✅ Verify container startup                                │
│  📝 Generate deployment notification                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Benefits:**
- 🛡️ **Zero failed tests in production** - Tests must pass before deployment
- ⚡ **Fast feedback** - Know within 3.5 minutes if your code is deployable
- 🔄 **Automated versioning** - Git SHA tags for every build
- 📦 **Ready to deploy** - Every commit creates a production-ready Docker image

**Pipeline Configuration:** See [CI-CD.md](CI-CD.md) for complete documentation

---

## 🚢 Deployment

### Environment Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit with your credentials
nano .env

# 3. Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

**Documentation:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design patterns
- [DATABASE.md](DATABASE.md) - MongoDB schema and indexes
- [ROADMAP.md](ROADMAP.md) - Future features and timeline
- [RISK-ASSESSMENT.md](RISK-ASSESSMENT.md) - Security and operational risks

---

## ???? Project Structure

```
src/
├── app/
│   ├── modules/          # Feature modules
│   │   ├── Auth/         # Authentication
│   │   ├── Room/         # Room CRUD
```
│   │   ├── Booking/      # Bookings
│   │   └── RoomAllocation/  # AI allocation
│   ├── middlewares/      # Auth, validation
│   └── services/         # Background jobs
├── __tests__/            # Integration tests
└── swagger.ts            # API docs
```

---

