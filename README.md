# Secure File Upload API

This is a NestJS-based server providing a secure file upload service.  It
emphasises safety at every layer: authentication, CSRF protection, file
validation, rate‑limiting, and per‑user duplicate detection.

---

## Features

- **JWT authentication** with 24‑hour expiry
- **User authorization:** each user may only access their own files
- **File validation**: extension check, MIME type, magic‑byte signature
- **Filename sanitisation** to prevent path traversal
- **Size limit** of 5 MB per upload
- **Duplicate prevention** using per‑user SHA‑256 content hashing
- **CSRF tokens** for upload endpoints
- **Rate limiting** (10 requests/min per user by default)
- **Helmet.js** for secure HTTP headers
- **Secure cookies** (httpOnly, sameSite strict; switch to `secure: true` in
  production)
- **Input validation** using `class-validator` with whitelist/forbid
- **Swagger/OpenAPI** documentation at `/api-docs`
- **PostgreSQL** via TypeORM, automatically synchronised in dev
- **Password hashing** with bcrypt (cost factor 12)

---

## Getting started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm (or yarn)

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root and set the following values:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=secure_file_upload

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Rate limiting (milliseconds, requests)
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Server port
PORT=3000
```

> **Note:** `.env` is ignored by Git; do not commit sensitive data.

### Run the server

```bash
# development (watch mode)
npm run start:dev

# production (after build)
npm run start:prod

# build only
npm run build
```

The application listens on the port defined in `PORT` (default 3000).

### Run tests

```bash
npm run test          # unit tests
npm run test:e2e      # end-to-end tests
npm run test:cov      # coverage report
```

---

## Database & migrations

For development the TypeORM configuration (`src/dbConfig.ts`) uses
`synchronize: true`, which auto‑creates/updates tables. In production you
should disable it and manage schema with migrations:

```bash
# add script to package.json if needed:
# "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
# then
npm run typeorm -- migration:generate -n add_file_hash
npm run typeorm -- migration:run
```

Migrations will add the `hash` column and the unique index on `(userId,hash)`.

---

## API overview

### Authentication

| Method | Endpoint           | Description                         |
|--------|--------------------|-------------------------------------|
| POST   | `/auth/signup`     | Register new user                   |
| POST   | `/auth/login`      | Obtain JWT                          |
| POST   | `/auth/change-password` | Change password (JWT required) |
| GET    | `/auth/csrf-token` | Generate CSRF token (session req)   |
| GET    | `/auth/me`         | Current user info (JWT required)    |

### Files (JWT guard on all)

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| POST   | `/files/upload`             | Upload file (CSRF token required)    |
| GET    | `/files`                    | List user's files                    |
| GET    | `/files/:id`                | File metadata                        |
| GET    | `/files/:id/download`       | Stream download                      |
| DELETE | `/files/:id`                | Remove file                          |

### Users

| Method | Endpoint         | Description            |
|--------|------------------|------------------------|
| GET    | `/users/:id`     | Retrieve user by ID    |
| PATCH  | `/users/:id`     | Update user            |
| DELETE | `/users/:id`     | Delete user            |

> All endpoints are documented and testable via Swagger UI at `/api-docs`.

---

## Security details

### Authentication & sessions

- JWT tokens issued by `/auth/login` and `/auth/signup`.
- Passport `JwtStrategy` validates tokens on each request.
- `JwtAuthGuard` applied globally where needed.
- Sessions used only to store CSRF tokens; cookies configured with secure
  flags.

### CSRF protection

- Token generated via `/auth/csrf-token` and stored in session.
- `CsrfGuard` compares header value against session using constant-time
  comparison.
- Guard is applied to the file upload route.

### File validation

1. **Extension check** against whitelist
2. **MIME type check** against allowed list
3. **Magic-byte signature** read from disk after writing
4. **Size check** (max 5 MB)
5. **Sanitised filename** removes dangerous characters

If any validation fails the file is deleted and a `BadRequestException` is
thrown.

### Duplicate prevention

- SHA‑256 hash computed from `file.buffer`.
- The `File` entity stores `hash` plus a unique composite index on
  `(userId,hash)`.
- Before saving, service queries for existing record; if found, returns the
  existing entity instead of creating a new one.

This ensures a single user cannot upload the same content twice, even if the
name differs.

### Rate limiting

- `RateLimitInterceptor` keeps an in-memory map of user request timestamps.
- Configured for 10 requests per 60 000 ms (1 minute) by default.
- Triggering limit throws a 429 response with `ERROR_MESSAGES.RATE_LIMIT_EXCEEDED`.

This prevents abuse while still allowing reasonable usage for an individual.

### HTTP & cookie security

- `helmet()` adds HSTS, XSS protection, content-type sniffing prevention, etc.
- Cookies are `httpOnly` and `sameSite: 'strict'`.
- In production the `secure` flag should be enabled to restrict cookies to
  HTTPS.

### Other safeguards

- Input validation via `ValidationPipe` configured with
  `whitelist: true` and `forbidNonWhitelisted` rejects extra fields.
- Bcrypt hashing for passwords; cost factor 12.
- Error messages and successes extracted into constants to avoid leaking
  implementation details.

---

## Directory structure

```
src/
├─ auth/           # auth controller/service/guards/strategies
├─ files/          # upload logic, entity, validators, DTOs
├─ users/          # user management
├─ common/         # constants, interceptors (rate limit)
├─ app.module.ts   # root module
└─ main.ts         # bootstrap (helmet, validation, swagger)
```

---

## Contributing & deploying

1. Fork the repo and create a feature branch (`feat/...`).
2. Commit with conventional message prefixes (`feat:`, `fix:` etc.).
3. Push and open a pull request.

For deployment refer to NestJS docs; ensure `synchronize` is disabled and use
migrations, and set `NODE_ENV=production` to adjust cookie security.

---

## License

MIT

---

Feel free to edit this README further as the project evolves.
