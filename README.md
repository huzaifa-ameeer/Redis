# Redis Learning Project

This is a small Node.js API I built while learning Redis. It uses Express, MongoDB, and Redis to experiment with caching, key expiration, counters, and simple rate limiting.

## What This Project Demonstrates

- **Caching:** The list of users is cached in Redis under `users:all`.
- **Cache invalidation:** Creating a user deletes the old `users:all` cache.
- **Expiring keys:** OTPs are stored for 30 seconds using Redis `EX` expiration.
- **Counters and rate limiting:** Requests to `/get` are counted with `INCR` and limited to five requests per minute per IP address.
- **Basic API and persistence:** Users are stored in MongoDB through Mongoose.

## Tech Stack

- Node.js with ES modules
- Express
- Redis with `ioredis`
- MongoDB with Mongoose
- Docker Compose for a local Redis server

## Getting Started

### Requirements

- Node.js or Bun
- MongoDB, local or hosted
- Docker Desktop, if you want to run Redis with Docker

### 1. Install dependencies

From the `redis` directory:

```bash
npm install
```

You can also use Bun:

```bash
bun install
```

### 2. Start Redis

From the `redis` directory:

```bash
docker compose up -d
```

The included Compose file exposes Redis on port `6379`.

### 3. Configure environment variables

Create a `.env` file inside the `redis` directory:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/redis-learning
REDIS_URI=redis://127.0.0.1:6379
```

Update `MONGO_URI` if your MongoDB instance uses a different connection string.

### 4. Run the API

Development mode:

```bash
bun run dev
```

Start mode:

```bash
bun start
```

The API runs at `http://localhost:3000` by default.

## API Endpoints

### Create a user

```http
POST /create
Content-Type: application/json
```

```json
{
	"name": "Ada Lovelace",
	"email": "ada@example.com",
	"password": "example-password"
}
```

This creates a MongoDB user and clears the cached user list.

### Get all users

```http
GET /get
```

The first request reads from MongoDB and stores the result in Redis. Later requests return the cached value until the cache is cleared by `POST /create`.

This endpoint is limited to five requests per minute per IP address.

### Send an OTP

```http
POST /send-otp
Content-Type: application/json
```

```json
{
	"email": "ada@example.com"
}
```

The OTP is stored under `otp:<email>` and expires after 30 seconds.

### Verify an OTP

```http
POST /verify-otp
Content-Type: application/json
```

```json
{
	"email": "ada@example.com",
	"otp": "123456"
}
```

## Project Structure

```text
redis/
├── index.js                 # Express server and routes
├── docker-compose.yml       # Local Redis service
├── package.json
└── src/
		├── config/db.js         # MongoDB connection
		├── middleware/
		│   └── rateLimit.js     # Redis-based rate limiter
		└── models/
				└── user.mode.js     # Mongoose user model
```

## Notes for Learning

This project is intentionally simple and is not production-ready yet. In a real application, passwords should be hashed, OTPs should not be returned directly in the response, request validation should be added, and the rate-limit middleware should stop execution after sending a `429` response.

Useful Redis commands to try:

```bash
redis-cli KEYS "*"
redis-cli GET users:all
redis-cli TTL otp:someone@example.com
```

The goal of this project was to understand how an application can use Redis alongside a database for fast reads, temporary data, and request counting.
