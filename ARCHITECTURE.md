# 🏗️ System Architecture

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Components](#system-components)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability](#scalability)

---

## Architecture Overview

Smart Meeting Room Scheduler follows a **layered architecture pattern** with clear separation of concerns, enabling maintainability, testability, and scalability.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐       │
│  │  Web App   │  │ Mobile App │  │  API Clients     │       │
│  │  (Future)  │  │  (Future)  │  │  (Postman/etc)   │       │
│  └────────────┘  └────────────┘  └──────────────────┘       │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ JSON REST API
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Application Server (Node.js 18+)         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Middlewares:                                         │   │
│  │  ├─ CORS (Cross-Origin Resource Sharing)            │   │
│  │  ├─ Body Parser (JSON parsing)                      │   │
│  │  ├─ Cookie Parser                                    │   │
│  │  ├─ Auth Middleware (JWT verification)              │   │
│  │  ├─ Validation Middleware (Zod schemas)             │   │
│  │  ├─ Error Handler (Global error management)         │   │
│  │  └─ Not Found Handler (404 responses)               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   ROUTING LAYER                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  API Routes (Modular Route Configuration)           │    │
│  │  ├─ /api/auth          (Authentication routes)      │    │
│  │  ├─ /api/users         (User management)            │    │
│  │  ├─ /api/rooms         (Room CRUD)                  │    │
│  │  ├─ /api/bookings      (Booking management)         │    │
│  │  ├─ /api/slots         (Time slot management)       │    │
│  │  ├─ /api/room-allocation (Intelligent allocation)   │    │
│  │  └─ /api-docs          (Swagger documentation)      │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Controllers (HTTP Request Handlers)                │    │
│  │  ├─ AuthController     (Login, register, tokens)    │    │
│  │  ├─ UserController     (User CRUD operations)       │    │
│  │  ├─ RoomController     (Room management)            │    │
│  │  ├─ BookingController  (Booking operations)         │    │
│  │  ├─ SlotController     (Availability checking)      │    │
│  │  └─ AllocationController (Room recommendation)      │    │
│  │                                                      │    │
│  │  Responsibilities:                                   │    │
│  │  • Parse HTTP requests                              │    │
│  │  • Call appropriate services                        │    │
│  │  • Format HTTP responses                            │    │
│  │  • Handle HTTP status codes                         │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Business Logic Services                             │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Auth Service                                 │   │    │
│  │  │  • User registration & validation             │   │    │
│  │  │  • Password hashing (bcrypt)                  │   │    │
│  │  │  • JWT token generation & verification        │   │    │
│  │  │  • Password reset logic                       │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Room Service                                 │   │    │
│  │  │  • Room CRUD operations                       │   │    │
│  │  │  • Room availability logic                    │   │    │
│  │  │  • Room search & filtering                    │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Allocation Service (CORE ALGORITHM)          │   │    │
│  │  │  • Intelligent room scoring algorithm         │   │    │
│  │  │  • Conflict detection & resolution            │   │    │
│  │  │  • Multi-factor optimization:                 │   │    │
│  │  │    - Capacity matching (30% weight)           │   │    │
│  │  │    - Equipment requirements (25%)             │   │    │
│  │  │    - Cost optimization (20%)                  │   │    │
│  │  │    - Location preference (15%)                │   │    │
│  │  │    - Time flexibility (10%)                   │   │    │
│  │  │  • Alternative suggestions                    │   │    │
│  │  │  • Priority-based allocation (CEO first)      │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Booking Service                              │   │    │
│  │  │  • Create/update/delete bookings              │   │    │
│  │  │  • Conflict checking                          │   │    │
│  │  │  • Booking validation                         │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Auto-Release Service (Background Job)        │   │    │
│  │  │  • Cron job scheduler (node-cron)             │   │    │
│  │  │  • Automatic booking cleanup                  │   │    │
│  │  │  • Unused room release                        │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER (Models)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Mongoose ODM Models                                 │    │
│  │  ├─ User Model                                       │    │
│  │  │  • Schema definition                             │    │
│  │  │  • Pre-save hooks (password hashing)             │    │
│  │  │  • Static methods (isUserExists, isPasswordMatch)│    │
│  │  │  • Indexes for query optimization                │    │
│  │  ├─ Room Model                                       │    │
│  │  │  • Schema definition                             │    │
│  │  │  • Validation rules                              │    │
│  │  │  • Query methods                                 │    │
│  │  ├─ Booking Model                                    │    │
│  │  │  • Schema definition                             │    │
│  │  │  • Date/time handling                            │    │
│  │  │  • Status management                             │    │
│  │  └─ Slot Model                                       │    │
│  │     • Time slot management                          │    │
│  │     • Availability tracking                         │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MongoDB 6.0 (NoSQL Document Database)              │    │
│  │  Collections:                                        │    │
│  │  ├─ users        (User accounts & profiles)         │    │
│  │  ├─ rooms        (Meeting room inventory)           │    │
│  │  ├─ bookings     (Reservations & scheduling)        │    │
│  │  └─ slots        (Time slot availability)           │    │
│  │                                                      │    │
│  │  Features:                                           │    │
│  │  • Replica sets for high availability               │    │
│  │  • Indexes for performance                          │    │
│  │  • Transactions for data consistency                │    │
│  │  • Aggregation pipeline for analytics               │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Authentication & Authorization System

**Components:**
- JWT Token Generator
- Password Hasher (bcrypt)
- Role-Based Access Control (RBAC)
- Refresh Token Manager

**Flow:**
```
User Login → Validate Credentials → Generate JWT Tokens
          → Store Refresh Token → Return Access & Refresh Tokens
```

**Security Features:**
- Access tokens (short-lived: 30 days)
- Refresh tokens (long-lived: 365 days)
- Password hashing with 12 salt rounds
- Token expiration and renewal
- Role-based route protection

### 2. Intelligent Allocation Engine

**Algorithm Components:**

```typescript
interface AllocationEngine {
  // Input
  meetingRequest: MeetingRequest
  existingBookings: Booking[]
  availableRooms: Room[]

  // Processing Steps
  filterEligibleRooms()      // Capacity & equipment filtering
  checkConflicts()           // Temporal conflict detection
  calculateScores()          // Multi-factor scoring
  rankAlternatives()         // Alternative time slots
  optimizeCosts()           // Cost comparison

  // Output
  recommendation: {
    primaryRoom: Room
    score: number
    reasons: string[]
    alternatives: Alternative[]
    costSavings: number
  }
}
```

**Scoring Weights:**
| Factor | Weight | Purpose |
|--------|--------|---------|
| Capacity | 30% | Right-size rooms (avoid waste) |
| Equipment | 25% | Match technical requirements |
| Cost | 20% | Minimize expense |
| Location | 15% | Convenience factor |
| Time | 10% | Scheduling flexibility |

### 3. Background Services

**Auto-Release Cron Job:**
```
Schedule: Every 2 minutes
Job: Check bookings past start time
Action: Release unused bookings
Impact: Prevent resource hoarding
```

### 4. API Documentation System

**Swagger/OpenAPI Integration:**
- Automatic endpoint documentation
- Request/response schemas
- Interactive testing interface
- Authentication examples
- Error code documentation

---

## Technology Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript execution environment |
| **Language** | TypeScript | 5.2+ | Type-safe development |
| **Framework** | Express.js | 4.18+ | Web application framework |
| **Database** | MongoDB | 6.0 | Document-based data storage |
| **ODM** | Mongoose | 8.0+ | MongoDB object modeling |
| **Authentication** | JWT | 9.0+ | Stateless authentication |
| **Password Hash** | bcrypt | 5.1+ | Secure password storage |
| **Validation** | Zod | 3.22+ | Schema validation |
| **Documentation** | Swagger | - | API documentation |
| **File Upload** | Multer | 1.4+ | Multipart form handling |
| **Cloud Storage** | Cloudinary | 1.41+ | Image/file storage |
| **Email** | Nodemailer | 6.9+ | Email notifications |
| **Cron Jobs** | node-cron | 4.2+ | Scheduled tasks |

### Testing & Quality

| Tool | Purpose |
|------|---------|
| Jest | Testing framework |
| Supertest | HTTP assertions |
| MongoDB Memory Server | In-memory test database |
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |

### DevOps & Deployment

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| GitHub Actions | CI/CD pipeline |
| Docker Hub | Container registry |

---

## Design Patterns

### 1. MVC (Model-View-Controller) Pattern

```
Model      → Mongoose schemas (data structure)
View       → JSON responses (data presentation)
Controller → Express route handlers (business logic coordination)
```

### 2. Repository Pattern

```typescript
// Data access abstraction
class UserRepository {
  async findByEmail(email: string): Promise<User>
  async create(userData: UserData): Promise<User>
  async update(id: string, data: Partial<User>): Promise<User>
}
```

### 3. Middleware Pattern

```
Request → Middleware Chain → Controller → Response
          (Auth → Validation → Processing)
```

### 4. Factory Pattern

```typescript
// Token generation
function createToken(payload, secret, expiresIn): string
function createAccessToken(user): string
function createRefreshToken(user): string
```

### 5. Strategy Pattern

```typescript
// Different scoring strategies for room allocation
interface ScoringStrategy {
  calculate(room: Room, request: Request): number
}

class CapacityScoring implements ScoringStrategy
class EquipmentScoring implements ScoringStrategy
class CostScoring implements ScoringStrategy
```

---

## Data Flow

### 1. User Registration Flow

```
Client Request
    ↓
POST /api/auth/register
    ↓
Zod Validation
    ↓
AuthController.register()
    ↓
AuthService.registerUser()
    ↓
Check existing user
    ↓
Hash password (bcrypt)
    ↓
User.create()
    ↓
Generate JWT tokens
    ↓
Return tokens + user data
```

### 2. Room Allocation Flow

```
Client Request
    ↓
POST /api/room-allocation/find-optimal
    ↓
JWT Authentication
    ↓
Zod Validation
    ↓
AllocationController.findOptimalMeeting()
    ↓
AllocationService.findOptimalRoom()
    ↓
┌─────────────────────────────────┐
│ 1. Fetch all rooms              │
│ 2. Fetch existing bookings      │
│ 3. Filter eligible rooms        │
│ 4. Check time conflicts         │
│ 5. Calculate scores for each    │
│ 6. Rank by total score          │
│ 7. Generate alternatives        │
│ 8. Calculate cost savings       │
└─────────────────────────────────┘
    ↓
Return recommendation + alternatives
```

### 3. Booking Creation Flow

```
Client Request
    ↓
POST /api/bookings
    ↓
JWT Authentication
    ↓
Zod Validation
    ↓
BookingController.createBooking()
    ↓
BookingService.create()
    ↓
Check room availability
    ↓
Check time conflicts
    ↓
Apply 15-minute buffer
    ↓
Create booking
    ↓
Return booking confirmation
```

---

## Security Architecture

### 1. Authentication Security

- **Password Security:**
  - bcrypt hashing with 12 salt rounds
  - Password strength requirements
  - Secure password reset flow

- **Token Security:**
  - JWT with HS256 algorithm
  - Short-lived access tokens (30 days)
  - Long-lived refresh tokens (365 days)
  - Token rotation on refresh

### 2. Authorization Security

- **Role-Based Access Control:**
  ```typescript
  Roles: USER | MANAGER | CEO | ADMIN

  Permissions:
  - USER: Read own data, create bookings
  - MANAGER: Read team data, view reports
  - CEO: Highest priority, all read access
  - ADMIN: Full CRUD access, user management
  ```

- **Route Protection:**
  ```typescript
  auth(USER_ROLE.ADMIN)     // Only admins
  auth(USER_ROLE.MANAGER, USER_ROLE.ADMIN)  // Managers or admins
  ```

### 3. Data Security

- **Input Validation:**
  - Zod schema validation
  - Type checking
  - SQL/NoSQL injection prevention
  - XSS prevention

- **Error Handling:**
  - No sensitive data in error messages
  - Proper HTTP status codes
  - Centralized error handling

---

## Scalability

### Current Architecture Supports:

✅ **Horizontal Scaling:**
- Stateless API (no session storage)
- JWT-based authentication
- MongoDB replica sets

✅ **Caching Ready:**
- Redis integration possible
- Query result caching
- Token caching

✅ **Load Balancing Ready:**
- Stateless design
- No server-side sessions
- Docker containerization

### Future Enhancements:

🔄 **Microservices:**
- Separate auth service
- Separate allocation service
- Message queue (RabbitMQ/Kafka)

🔄 **Real-time Features:**
- WebSocket for live updates
- Push notifications
- Real-time availability

🔄 **Analytics:**
- Data warehouse integration
- Business intelligence dashboards
- Usage analytics

---

## Performance Considerations

### Database Optimization:

- **Indexes:**
  ```typescript
  User: email (unique)
  Room: roomNumber (unique)
  Booking: {roomId, startTime, endTime} (compound)
  ```

- **Query Optimization:**
  - Projection (select only needed fields)
  - Pagination for large results
  - Aggregation pipelines

### API Performance:

- **Response Time Targets:**
  - Authentication: < 200ms
  - Room listing: < 100ms
  - Allocation algorithm: < 500ms
  - Booking creation: < 300ms

### Monitoring:

- Health check endpoint
- Logging with Winston (future)
- APM integration ready (future)
