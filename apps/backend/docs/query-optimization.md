# Query Optimization Best Practices

This guide provides best practices for optimizing database queries in the scoopdope API to reduce slow queries and improve performance.

## Table of Contents

1. [Understanding Query Performance](#understanding-query-performance)
2. [Common Performance Issues](#common-performance-issues)
3. [Optimization Techniques](#optimization-techniques)
4. [Monitoring Tools](#monitoring-tools)
5. [Slow Query Examples](#slow-query-examples)
6. [FAQ](#faq)

---

## Understanding Query Performance

### Thresholds

- **Slow Query Threshold**: 1000ms (1 second)
  - Queries exceeding this threshold are logged and tracked
  - Indicates potential performance issues
  
- **Critical Query Threshold**: 5000ms (5 seconds)
  - Queries exceeding this threshold trigger alerts
  - Should be investigated immediately
  - Often indicate serious performance problems

### Query Performance Metrics

The monitoring dashboard provides:

- **Total Queries**: Count of all slow queries tracked in this session
- **Average Response Time**: Mean query duration
- **P95 Response Time**: 95th percentile (95% of queries are faster than this)
- **P99 Response Time**: 99th percentile (99% of queries are faster than this)
- **Slow Queries**: Count of queries between 1000ms - 5000ms
- **Critical Queries**: Count of queries exceeding 5000ms

---

## Common Performance Issues

### 1. N+1 Query Problem

**What is it?**
- One query fetches parent records
- N additional queries fetch related data for each parent record
- Total queries = 1 + N

**Example:**
```typescript
// ❌ BAD: N+1 Query Problem
const users = await userRepository.find();
for (const user of users) {
  user.posts = await postRepository.find({ where: { userId: user.id } });
}
// If you have 100 users, this executes 101 queries!

// ✅ GOOD: Use relations
const users = await userRepository.find({
  relations: ['posts'],
});
```

### 2. Missing Database Indexes

**What is it?**
- Queries scan entire tables instead of using indexes
- Common with WHERE clauses and JOINs

**Example:**
```typescript
// ❌ BAD: No index on email
SELECT * FROM users WHERE email = $1;

// ✅ GOOD: Add index
@Index('idx_users_email')
@Column()
email: string;
```

### 3. Fetching Unnecessary Columns

**What is it?**
- Selecting all columns when only a few are needed
- Wastes bandwidth and memory

**Example:**
```typescript
// ❌ BAD: Select all columns
const users = await userRepository.find();

// ✅ GOOD: Select only needed columns
const users = await userRepository.find({
  select: ['id', 'email', 'name'],
});
```

### 4. Missing JOINs (Running Separate Queries)

**What is it?**
- Fetching related data in separate queries instead of using JOINs
- Increases round trips to database

**Example:**
```typescript
// ❌ BAD: Three queries
const courses = await courseRepository.find();
const instructors = await instructorRepository.find();
const enrollments = await enrollmentRepository.find();

// ✅ GOOD: One query with JOINs
const courses = await courseRepository
  .createQueryBuilder('course')
  .leftJoinAndSelect('course.instructor', 'instructor')
  .leftJoinAndSelect('course.enrollments', 'enrollment')
  .getMany();
```

### 5. No Pagination for Large Result Sets

**What is it?**
- Fetching thousands of records when only a few are needed
- Loads all data into memory

**Example:**
```typescript
// ❌ BAD: Fetch all records
const allUsers = await userRepository.find();

// ✅ GOOD: Paginate results
const page = 1;
const pageSize = 20;
const [users, total] = await userRepository.findAndCount({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

### 6. Inefficient Filtering

**What is it?**
- Using application-level filtering instead of database queries
- Loads unnecessary data

**Example:**
```typescript
// ❌ BAD: Filter in application
const allUsers = await userRepository.find();
const activeUsers = allUsers.filter(u => u.isActive);

// ✅ GOOD: Filter in database
const activeUsers = await userRepository.find({
  where: { isActive: true },
});
```

### 7. Missing WHERE Clauses

**What is it?**
- Querying without filters results in full table scans
- Scales poorly with data growth

**Example:**
```typescript
// ❌ BAD: No WHERE clause
SELECT * FROM courses;

// ✅ GOOD: Add filters
const activeCourses = await courseRepository.find({
  where: { 
    status: 'active',
  },
});
```

---

## Optimization Techniques

### 1. Use Query Builder for Complex Queries

TypeORM's QueryBuilder provides better control:

```typescript
const users = await userRepository
  .createQueryBuilder('user')
  .where('user.isActive = :isActive', { isActive: true })
  .andWhere('user.createdAt > :date', { date: new Date('2024-01-01') })
  .select(['user.id', 'user.email', 'user.name'])
  .orderBy('user.createdAt', 'DESC')
  .take(10)
  .getMany();
```

### 2. Add Database Indexes

Create indexes on frequently queried columns:

```typescript
@Entity('users')
@Index('idx_users_email')
@Index('idx_users_status_created')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  email: string;

  @Column()
  status: string;

  @Column()
  createdAt: Date;
}
```

### 3. Use Select Carefully

Only fetch columns you need:

```typescript
const users = await userRepository
  .createQueryBuilder('user')
  .select(['user.id', 'user.email', 'user.name'])
  .where('user.status = :status', { status: 'active' })
  .getMany();
```

### 4. Eager Load Relations

Use `relations` or `leftJoinAndSelect` to avoid N+1 problems:

```typescript
const courses = await courseRepository.find({
  relations: ['instructor', 'enrollments'],
  where: { status: 'published' },
});
```

### 5. Use Pagination

Always paginate large result sets:

```typescript
@Get('users')
async getUsers(
  @Query('page') page: number = 1,
  @Query('pageSize') pageSize: number = 20,
) {
  const skip = (page - 1) * pageSize;
  const [users, total] = await this.userRepository.findAndCount({
    skip,
    take: pageSize,
  });

  return {
    data: users,
    total,
    page,
    pageSize,
  };
}
```

### 6. Cache Frequently Accessed Data

Use Redis for caching:

```typescript
async getCourseById(id: number) {
  // Try cache first
  const cached = await this.cacheManager.get(`course:${id}`);
  if (cached) return cached;

  // Fetch from database
  const course = await this.courseRepository.findOne(id);

  // Cache for 1 hour
  await this.cacheManager.set(`course:${id}`, course, 3600000);
  return course;
}
```

### 7. Use Connection Pooling

Already configured in `app.module.ts`, but monitor pool size:

```typescript
extra: {
  max: 50, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
},
```

### 8. Batch Operations

Instead of individual inserts/updates, use batch operations:

```typescript
// ❌ BAD: Individual inserts
for (const enrollment of enrollments) {
  await enrollmentRepository.save(enrollment);
}

// ✅ GOOD: Batch insert
await enrollmentRepository.save(enrollments);
```

---

## Monitoring Tools

### Query Performance Dashboard

Access the monitoring dashboard at: `/v1/monitoring/queries`

**Endpoints:**

- `GET /v1/monitoring/queries/metrics` - Performance metrics
- `GET /v1/monitoring/queries/slow` - Recent slow queries
- `GET /v1/monitoring/queries/critical` - Critical queries (>5000ms)
- `GET /v1/monitoring/queries/alerts` - Active alerts
- `POST /v1/monitoring/queries/alerts/:alertId/acknowledge` - Acknowledge alert

### Log Files

Slow queries are logged to: `logs/slow-queries.log`

Each entry contains:
- Timestamp
- Query duration
- Query text
- Parameters
- Status (slow/critical)
- Context

### PostgreSQL Slow Query Log

Enable in PostgreSQL:

```sql
-- Connect to PostgreSQL and enable slow query logging
SET log_statement = 'all';
SET log_duration = on;
SET log_min_duration_statement = 1000; -- Log queries > 1s
```

---

## Slow Query Examples

### Example 1: N+1 User Posts Problem

**Slow Query:**
```
Query: SELECT * FROM users
Duration: 5ms
Query: SELECT * FROM posts WHERE user_id = $1
Query: SELECT * FROM posts WHERE user_id = $2
... (repeated 100 times)
Total Time: ~500ms (5 + 5 * 100)
```

**Fix:**
```typescript
const users = await userRepository.find({
  relations: ['posts'],
});
```

### Example 2: Unindexed Email Search

**Slow Query:**
```
Query: SELECT * FROM users WHERE email = $1
Duration: 3500ms (Full table scan)
```

**Fix:**
```typescript
@Index('idx_users_email')
@Column()
email: string;
```

### Example 3: Unnecessary Column Selection

**Slow Query:**
```
Query: SELECT * FROM courses
Duration: 2500ms (Fetching all columns)
```

**Fix:**
```typescript
const courses = await courseRepository.find({
  select: ['id', 'title', 'slug'],
});
```

### Example 4: Missing Pagination

**Slow Query:**
```
Query: SELECT * FROM enrollments
Duration: 8000ms (Fetching 50,000+ records)
```

**Fix:**
```typescript
const [enrollments, total] = await enrollmentRepository.findAndCount({
  skip: 0,
  take: 50,
});
```

---

## FAQ

### Q: How do I know if my query is slow?

**A:** 
- Check `/v1/monitoring/queries/metrics` for performance stats
- Queries > 1000ms are logged as "slow"
- Queries > 5000ms generate alerts
- Check `logs/slow-queries.log` for details

### Q: What's the difference between slow and critical queries?

**A:**
- **Slow**: 1000ms - 5000ms (needs investigation)
- **Critical**: > 5000ms (investigate immediately)

### Q: How do I add an index to a column?

**A:**
```typescript
import { Index } from 'typeorm';

@Entity('users')
@Index('idx_users_email') // Single column index
@Index('idx_users_status_created', ['status', 'createdAt']) // Composite index
export class User {
  @Column()
  @Index()
  email: string;

  @Column()
  status: string;

  @Column()
  createdAt: Date;
}
```

### Q: How do I prevent N+1 queries?

**A:**
- Always use `relations` when loading related entities
- Use `leftJoinAndSelect` in QueryBuilder for complex queries
- Monitor using `/v1/monitoring/queries/critical` endpoint

### Q: Should I cache all queries?

**A:**
- Cache read-heavy, infrequently-changed data
- Cache expensive aggregations
- Don't cache real-time data or user-specific data unless invalidated properly
- Use TTL (time-to-live) to prevent stale data

### Q: How do I optimize pagination?

**A:**
```typescript
// Use cursor-based pagination for large datasets
const users = await userRepository
  .createQueryBuilder('user')
  .where('user.id > :cursor', { cursor: lastId })
  .take(20)
  .getMany();
```

---

## Performance Benchmarks

Typical response times for different operations:

| Operation | Target Time | Warning | Critical |
|-----------|------------|---------|----------|
| Simple SELECT | < 50ms | > 200ms | > 1000ms |
| JOIN (2 tables) | < 100ms | > 500ms | > 2000ms |
| JOIN (3+ tables) | < 200ms | > 1000ms | > 5000ms |
| Aggregation | < 500ms | > 2000ms | > 5000ms |
| Bulk Insert (100 rows) | < 200ms | > 1000ms | > 5000ms |
| Full Text Search | < 300ms | > 1500ms | > 5000ms |

---

## Resources

- [TypeORM Query Builder Documentation](https://typeorm.io/select-query-builder)
- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
- [Database Indexing Guide](https://use-the-index-luke.com/)
- [SQL Performance Tips](https://sqlperformance.com/)

---

## Reporting Issues

If you encounter slow queries:

1. Check `/v1/monitoring/queries/slow` for details
2. Review the query in `logs/slow-queries.log`
3. Identify the optimization opportunity
4. Apply the appropriate technique from this guide
5. Test the improvement with `/v1/monitoring/queries/metrics`
6. Document the change in code comments
