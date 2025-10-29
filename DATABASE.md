# 🗄️ Database Design Documentation

> Comprehensive database schema documentation for the Smart Meeting Room Scheduler system using MongoDB.

---

## Table of Contents

- [Database Overview](#-database-overview)
- [Collections](#-collections)
- [Schema Definitions](#-schema-definitions)
- [Relationships](#-relationships)
- [Indexes](#-indexes)
- [Query Patterns](#-query-patterns)
- [Sample Data](#-sample-data)

---

##  Database Overview

**Database Type:** MongoDB 6.0 (NoSQL Document Database)
**ODM:** Mongoose 8.0.1
**Total Collections:** 4 (User, Room, Slot, Booking)

### Why MongoDB?

- **Flexible Schema:** Easy to add new room features or equipment types
- **JSON-Native:** Perfect for REST API responses
- **Scalability:** Horizontal scaling for growing organizations
- **Performance:** Fast reads for availability checking
- **Complex Queries:** Supports time-range and availability queries

---

##  Collections

### Collection Summary

| **users** | ~100-1000 | Employee authentication and roles | `_id` (ObjectId) |
| **rooms** | ~10-50 | Meeting room catalog | `_id` (ObjectId) |
| **slots** | ~5000+ | Time slot availability | `_id` (ObjectId) |
| **bookings** | ~1000+ | Meeting reservations | `_id` (ObjectId) |

---

##  Schema Definitions

### 1. User Collection

**Purpose:** Store employee information, authentication credentials, and role-based access control.

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;              
  password: string;           
  phone: string;
  address: string;
  role: 'USER' | 'MANAGER' | 'CEO' | 'ADMIN';
  profileImage?: string;      
  isDeleted: boolean;         
  createdAt: Date;
  updatedAt: Date;
}
```

#### Field Descriptions

| `name` | String | Yes | Max 100 chars | Full employee name |
| `email` | String | Yes | Email format, unique | Business email address |
| `password` | String | Yes | Min 6 chars | Bcrypt hashed password |
| `phone` | String | Yes | Phone format | Contact number |
| `address` | String | Yes | - | Physical address |
| `role` | Enum | Yes | USER/MANAGER/CEO/ADMIN | Access control level |
| `profileImage` | String | No | URL format | Avatar image URL |
| `isDeleted` | Boolean | Yes | Default: false | Soft delete marker |

#### Schema Features

- **Pre-save Hook:** Automatically hashes password before saving
- **Virtual Field:** `id` returns `_id` as string
- **Index:** Unique index on `email` field
- **Timestamps:** Automatic `createdAt` and `updatedAt`

---

### 2. Room Collection

**Purpose:** Catalog of meeting rooms with capacity, equipment, and pricing.

```typescript
interface IRoom {
  _id: ObjectId;
  name: string;               
  roomNo: number;             
  floorNo: number;            
  capacity: number;          
  pricePerSlot: number;       
  amenities: string[];        
  images?: string[];          
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Field Descriptions

| `name` | String | Yes | Max 200 chars | Room display name |
| `roomNo` | Number | Yes | Unique, positive | Room identifier |
| `floorNo` | Number | Yes | Positive | Floor location |
| `capacity` | Number | Yes | Min 1 | Maximum occupancy |
| `pricePerSlot` | Number | Yes | Min 0 | Hourly rate in currency |
| `amenities` | String[] | Yes | Array of strings | Equipment: projector, whiteboard, etc. |
| `images` | String[] | No | Array of URLs | Room photos |
| `isDeleted` | Boolean | Yes | Default: false | Soft delete marker |

#### Sample Amenities

- `"projector"` - Video projection system
- `"whiteboard"` - Whiteboard with markers
- `"videoConference"` - Zoom/Teams equipment
- `"tv"` - Large display screen
- `"ac"` - Air conditioning
- `"wifi"` - Dedicated WiFi

---

### 3. Slot Collection

**Purpose:** Manage time slot availability for each room (30-minute intervals).

```typescript
interface ISlot {
  _id: ObjectId;
  room: ObjectId;             
  date: Date;                 
  startTime: string;          
  endTime: string;            
  isBooked: boolean;         
  createdAt: Date;
  updatedAt: Date;
}
```

#### Field Descriptions

| `room` | ObjectId | Yes | Valid room reference | Associated room |
| `date` | Date | Yes | Valid date | Slot date |
| `startTime` | String | Yes | HH:MM format | Slot start time |
| `endTime` | String | Yes | HH:MM format | Slot end time |
| `isBooked` | Boolean | Yes | Default: false | Booking status |

#### Slot Generation Rules

- **Interval:** 30 minutes (09:00-09:30, 09:30-10:00, etc.)
- **Working Hours:** 09:00-17:00 (configurable)
- **Auto-Generation:** Created when rooms are added
- **Cleanup:** Old slots (>30 days) can be archived

---

### 4. Booking Collection

**Purpose:** Track meeting room reservations with user and slot references.

```typescript
interface IBooking {
  _id: ObjectId;
  room: ObjectId;             // Reference to Room
  slots: ObjectId[];          // Array of Slot references
  user: ObjectId;             // Reference to User (who booked)
  date: Date;                 // Booking date
  totalAmount: number;        // Calculated cost
  isConfirmed: 'confirmed' | 'unconfirmed' | 'canceled';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Field Descriptions

| `room` | ObjectId | Yes | Valid room reference | Booked room |
| `slots` | ObjectId[] | Yes | Array of slot references | Reserved time slots |
| `user` | ObjectId | Yes | Valid user reference | Employee who booked |
| `date` | Date | Yes | Valid date | Meeting date |
| `totalAmount` | Number | Yes | Min 0 | Total cost (auto-calculated) |
| `isConfirmed` | Enum | Yes | confirmed/unconfirmed/canceled | Booking status |
| `isDeleted` | Boolean | Yes | Default: false | Soft delete marker |

#### Booking Lifecycle

1. **Created:** `isConfirmed: 'unconfirmed'`, slots marked `isBooked: false`
2. **Confirmed:** Admin confirms, slots marked `isBooked: true`
3. **Canceled:** `isConfirmed: 'canceled'`, slots released
4. **Deleted:** `isDeleted: true`, soft delete

---

## 🔗 Relationships

### Entity-Relationship Diagram (ERD)

```
┌─────────────────┐
│      USER       │
│  (employees)    │
├─────────────────┤
│ _id (PK)        │
│ email (UNIQUE)  │
│ password        │
│ role            │
└────────┬────────┘
         │
         │ 1:N (creates)
         │
         ▼
┌─────────────────┐      1:N       ┌─────────────────┐
│    BOOKING      │◄────────────────┤      ROOM       │
│  (reservations) │                 │  (meeting rooms)│
├─────────────────┤                 ├─────────────────┤
│ _id (PK)        │                 │ _id (PK)        │
│ user (FK)       │                 │ roomNo (UNIQUE) │
│ room (FK)       │                 │ capacity        │
│ slots[] (FK)    │                 │ amenities[]     │
│ totalAmount     │                 │ pricePerSlot    │
│ isConfirmed     │                 └────────┬────────┘
└────────┬────────┘                          │
         │                                   │ 1:N
         │ N:M                               │
         │                                   ▼
         │                          ┌─────────────────┐
         └─────────────────────────►│      SLOT       │
                                    │  (time slots)   │
                                    ├─────────────────┤
                                    │ _id (PK)        │
                                    │ room (FK)       │
                                    │ date            │
                                    │ startTime       │
                                    │ endTime         │
                                    │ isBooked        │
                                    └─────────────────┘
```

### Relationship Details

#### User → Booking (1:N)
- **Type:** One-to-Many
- **Description:** One user can create multiple bookings
- **Foreign Key:** `Booking.user` references `User._id`
- **Cascade:** On user delete, set `user.isDeleted = true` (soft delete)

#### Room → Booking (1:N)
- **Type:** One-to-Many
- **Description:** One room can have multiple bookings
- **Foreign Key:** `Booking.room` references `Room._id`
- **Cascade:** Cannot delete room with active bookings

#### Room → Slot (1:N)
- **Type:** One-to-Many
- **Description:** One room has many time slots
- **Foreign Key:** `Slot.room` references `Room._id`
- **Cascade:** Deleting room deletes all slots

#### Booking → Slot (N:M)
- **Type:** Many-to-Many
- **Description:** One booking can reserve multiple slots, one slot can belong to multiple bookings over time
- **Implementation:** Array field `Booking.slots[]` stores slot IDs
- **Constraint:** Slots cannot overlap for same room

---

## 🔍 Indexes

### Index Strategy

Indexes are critical for query performance, especially for availability checking and booking lookups.

#### User Collection Indexes

```javascript
// Unique index on email for fast login
db.users.createIndex({ email: 1 }, { unique: true })

// Index on role for admin queries
db.users.createIndex({ role: 1 })

// Compound index for active user lookup
db.users.createIndex({ isDeleted: 1, email: 1 })
```

#### Room Collection Indexes

```javascript
// Unique index on roomNo
db.rooms.createIndex({ roomNo: 1 }, { unique: true })

// Index on capacity for room search
db.rooms.createIndex({ capacity: 1 })

// Compound index for available rooms
db.rooms.createIndex({ isDeleted: 1, capacity: 1, pricePerSlot: 1 })
```

#### Slot Collection Indexes

```javascript
// Compound index for availability queries (most important!)
db.slots.createIndex({ room: 1, date: 1, isBooked: 1 })

// Index on date for cleanup jobs
db.slots.createIndex({ date: 1 })

// Compound index for time range queries
db.slots.createIndex({ room: 1, date: 1, startTime: 1, endTime: 1 })
```

#### Booking Collection Indexes

```javascript
// Compound index for user bookings
db.bookings.createIndex({ user: 1, date: 1, isDeleted: 1 })

// Compound index for room bookings
db.bookings.createIndex({ room: 1, date: 1, isConfirmed: 1 })

// Index on slots array for lookup
db.bookings.createIndex({ slots: 1 })

// Index on creation time for reports
db.bookings.createIndex({ createdAt: -1 })
```

---

## 🔎 Query Patterns

### Common Query Examples

#### 1. Find Available Rooms

```javascript
// Find rooms with capacity >= 10 and projector
const rooms = await Room.find({
  capacity: { $gte: 10 },
  amenities: { $in: ['projector'] },
  isDeleted: false
});

// Check slot availability for a specific date/time range
const availableSlots = await Slot.find({
  room: roomId,
  date: new Date('2025-10-30'),
  startTime: { $gte: '09:00' },
  endTime: { $lte: '17:00' },
  isBooked: false
});
```

#### 2. User Booking History

```javascript
// Get all bookings for a user (with room details)
const bookings = await Booking.find({
  user: userId,
  isDeleted: false
})
  .populate('room', 'name roomNo amenities')
  .populate('slots', 'date startTime endTime')
  .sort({ date: -1 });
```

#### 3. Room Utilization Report

```javascript
// Get booking count per room for last 30 days
const utilization = await Booking.aggregate([
  {
    $match: {
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isConfirmed: 'confirmed',
      isDeleted: false
    }
  },
  {
    $group: {
      _id: '$room',
      bookingCount: { $sum: 1 },
      totalRevenue: { $sum: '$totalAmount' }
    }
  },
  {
    $lookup: {
      from: 'rooms',
      localField: '_id',
      foreignField: '_id',
      as: 'roomDetails'
    }
  }
]);
```

#### 4. Conflict Detection

```javascript
// Check if requested time slots are available
const conflicts = await Slot.find({
  room: roomId,
  date: requestedDate,
  _id: { $in: requestedSlotIds },
  isBooked: true
});

if (conflicts.length > 0) {
  throw new Error('Time slot conflict detected');
}
```

---

## 📊 Sample Data

### Sample User

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "$2b$12$KIXxN6ZJ3mHQHhYq5Z.Uve...",
  "phone": "+1-555-1234",
  "address": "123 Main St, NYC",
  "role": "MANAGER",
  "profileImage": "https://cloudinary.com/profile/john.jpg",
  "isDeleted": false,
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-15T14:30:00.000Z"
}
```

### Sample Room

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Executive Conference Room A",
  "roomNo": 101,
  "floorNo": 1,
  "capacity": 12,
  "pricePerSlot": 50,
  "amenities": ["projector", "whiteboard", "videoConference", "ac"],
  "images": [
    "https://cloudinary.com/rooms/101-1.jpg",
    "https://cloudinary.com/rooms/101-2.jpg"
  ],
  "isDeleted": false,
  "createdAt": "2025-09-01T10:00:00.000Z",
  "updatedAt": "2025-10-01T12:00:00.000Z"
}
```

### Sample Slot

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "room": "507f1f77bcf86cd799439012",
  "date": "2025-10-30T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "10:30",
  "isBooked": false,
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-01T08:00:00.000Z"
}
```

### Sample Booking

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "room": "507f1f77bcf86cd799439012",
  "slots": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439015",
    "507f1f77bcf86cd799439016"
  ],
  "user": "507f1f77bcf86cd799439011",
  "date": "2025-10-30T00:00:00.000Z",
  "totalAmount": 150,
  "isConfirmed": "confirmed",
  "isDeleted": false,
  "createdAt": "2025-10-28T09:15:00.000Z",
  "updatedAt": "2025-10-28T10:00:00.000Z"
}
```

---

## 🔧 Database Operations

### Seeding Initial Data

When setting up a new environment, seed the database with:

1. **Super Admin User** (created via environment variables)
2. **Sample Rooms** (5-10 rooms with different capacities)
3. **Time Slots** (auto-generated for all rooms, 30 days in advance)

### Maintenance Tasks

#### Daily Tasks
- Auto-release unconfirmed bookings older than 24 hours
- Mark no-show bookings (using cron job)

#### Weekly Tasks
- Archive old slots (older than 30 days)
- Generate utilization reports

#### Monthly Tasks
- Database backup (MongoDB dump)
- Index optimization
- Cleanup soft-deleted records (older than 90 days)

---

## 📈 Scalability Considerations

### Current Scale
- **Users:** 100-1000 employees
- **Rooms:** 10-50 meeting rooms
- **Slots:** ~15,000 slots/room/year (30-min intervals, 8 hours/day, 250 days)
- **Bookings:** 1000-5000 bookings/month

### Future Scale (10x Growth)
- **Sharding Strategy:** Shard by `date` field (time-based partitioning)
- **Read Replicas:** Add MongoDB read replicas for reporting queries
- **Caching:** Redis cache for frequently accessed rooms and availability
- **Archival:** Move old bookings/slots to archive collections

---

## 🛡️ Data Integrity

### Constraints

1. **Referential Integrity:** Mongoose populate ensures valid references
2. **Unique Constraints:** Email (User), roomNo (Room)
3. **Soft Deletes:** `isDeleted` flag prevents data loss
4. **Timestamps:** Automatic audit trail with createdAt/updatedAt

### Validation Rules

- Email format validation (Zod schema)
- Password strength (min 6 characters)
- Positive numbers for capacity, price
- Date/time format validation
- Enum validation for roles and status

---

