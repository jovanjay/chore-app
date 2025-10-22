# Chore App - Visual Structure

## 📁 Complete Project Structure

```
chore-app/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── tsconfig.build.json       # Build config
│   ├── nest-cli.json             # NestJS CLI config
│   ├── .env.example              # Environment template
│   └── .gitignore                # Git ignore rules
│
├── 📚 Documentation
│   ├── README.md                 # Main documentation
│   ├── QUICKSTART.md             # 5-minute setup
│   ├── SETUP_GUIDE.md            # Detailed setup
│   ├── EXTRACTION_SUMMARY.md     # What was extracted
│   ├── PROJECT_SUMMARY.md        # This summary
│   └── VISUAL_STRUCTURE.md       # This file
│
└── 💻 Source Code (src/)
    │
    ├── main.ts                   # 🚀 Application entry point
    │
    ├── 🗄️ database/
    │   ├── database.module.ts     # Database module
    │   ├── database.provider.ts   # TypeORM connection
    │   └── entities/
    │       └── user.entity.ts     # User entity (10 fields)
    │
    └── 📦 modules/
        │
        ├── app.module.ts          # Main app module
        │
        ├── 🔐 auth/               # Authentication Module
        │   ├── auth.module.ts     # Module setup
        │   ├── auth.controller.ts # 3 endpoints (login, register, me)
        │   ├── auth.service.ts    # Business logic
        │   │
        │   ├── dto/               # Data Transfer Objects
        │   │   ├── login.dto.ts   # Login validation
        │   │   └── register.dto.ts# Register validation
        │   │
        │   ├── guards/            # Route protection
        │   │   └── jwt-auth.guard.ts
        │   │
        │   ├── strategies/        # Auth strategies
        │   │   └── jwt.strategy.ts
        │   │
        │   └── types/             # Type definitions
        │       └── userPayload.type.ts
        │
        └── 👤 user/               # User Module
            ├── user.module.ts     # Module setup
            ├── user.controller.ts # 1 endpoint (get by ID)
            ├── user.service.ts    # Business logic (4 methods)
            └── user.provider.ts   # Repository provider
```

---

## 🔄 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

Client                Controller              Service              Database
  │                       │                      │                     │
  ├─ POST /auth/register ─→ RegisterDto         │                     │
  │   {email, password}   │   (validation)       │                     │
  │                       │                      │                     │
  │                       ├──────────────────────→ userExists()?       │
  │                       │                      ├────────────────────→│
  │                       │                      │←────────────────────┤
  │                       │                      │   (check result)    │
  │                       │                      │                     │
  │                       │                      ├─ hash password      │
  │                       │                      │   (bcryptjs)        │
  │                       │                      │                     │
  │                       │                      ├─ create user ──────→│
  │                       │                      │←────────────────────┤
  │                       │←─────────────────────┤   (user saved)      │
  │                       │   (return user)      │                     │
  │←──────────────────────┤                      │                     │
  │   {id, email, msg}    │                      │                     │
  └───────────────────────┴──────────────────────┴─────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                            │
└─────────────────────────────────────────────────────────────┘

Client                Controller              Service              Database
  │                       │                      │                     │
  ├──── POST /auth/login ─→ LoginDto            │                     │
  │   {email, password}   │   (validation)       │                     │
  │                       │                      │                     │
  │                       ├──────────────────────→ validateUser()      │
  │                       │                      ├─ findByEmail() ────→│
  │                       │                      │←────────────────────┤
  │                       │                      │   (user data)       │
  │                       │                      │                     │
  │                       │                      ├─ bcrypt.compare()   │
  │                       │                      │   (verify password) │
  │                       │                      │                     │
  │                       │                      ├─ sign JWT token     │
  │                       │                      │   (24h expiry)      │
  │                       │←─────────────────────┤                     │
  │                       │   {token}            │                     │
  │←──────────────────────┤                      │                     │
  │   {success, token}    │                      │                     │
  └───────────────────────┴──────────────────────┴─────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                   PROTECTED ROUTE FLOW                       │
└─────────────────────────────────────────────────────────────┘

Client                Controller              Guard               Strategy
  │                       │                      │                     │
  ├──── GET /auth/me ─────→                      │                     │
  │   (Bearer token)      │                      │                     │
  │                       │                      │                     │
  │                       ├──────────────────────→ JwtAuthGuard        │
  │                       │                      ├────────────────────→│
  │                       │                      │   JwtStrategy       │
  │                       │                      │   - extract token   │
  │                       │                      │   - verify token    │
  │                       │                      │   - decode payload  │
  │                       │                      │←────────────────────┤
  │                       │←─────────────────────┤   (user payload)    │
  │                       │   (authorized)       │                     │
  │                       │                      │                     │
  │                       ├─ return user data    │                     │
  │←──────────────────────┤                      │                     │
  │   {success, user}     │                      │                     │
  └───────────────────────┴──────────────────────┴─────────────────────┘
```

---

## 🎯 Data Models

### User Entity
```typescript
User {
  id: string              // UUID (auto-generated)
  email: string           // Unique, validated
  password: string        // Hashed with bcryptjs
  userType: enum          // 'user' | 'admin'
  firstName: string       // Optional
  lastName: string        // Optional
  active: boolean         // Default: true
  createdAt: Date         // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

### JWT Payload
```typescript
JwtPayload {
  sub: string            // User ID
  email: string          // User email
  iat: number           // Issued at timestamp
  exp: number           // Expiry timestamp (24h)
}
```

---

## 🔐 Security Features

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                       │
└─────────────────────────────────────────────────────────┘

1. INPUT VALIDATION
   ├─ class-validator decorators
   ├─ Email format validation
   ├─ Strong password requirements
   │  ├─ Min 8 characters
   │  ├─ 1 uppercase letter
   │  ├─ 1 lowercase letter
   │  ├─ 1 number
   │  └─ 1 special symbol
   └─ Password confirmation match

2. PASSWORD SECURITY
   ├─ bcryptjs hashing
   ├─ 10 salt rounds
   ├─ Never stored in plain text
   └─ Secure comparison

3. JWT AUTHENTICATION
   ├─ HS256 algorithm
   ├─ Secret key from environment
   ├─ 24-hour expiration
   ├─ Signed tokens
   └─ Bearer token format

4. ROUTE PROTECTION
   ├─ JwtAuthGuard decorator
   ├─ Token validation
   ├─ Automatic token extraction
   └─ Payload injection

5. DATABASE SECURITY
   ├─ Parameterized queries (TypeORM)
   ├─ SQL injection protection
   ├─ Email uniqueness constraint
   └─ Selective field exposure

6. CORS CONFIGURATION
   ├─ Allowed origins
   ├─ Allowed methods
   ├─ Credentials support
   └─ Pre-flight handling
```

---

## 📊 Comparison: Before & After

```
┌──────────────────────────────────────────────────────────────┐
│              GUESTLY SERVICE → CHORE APP                     │
└──────────────────────────────────────────────────────────────┘

COMPLEXITY
Guestly:  ████████████████████████████████████████ (3,500 LOC)
Chore:    ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (600 LOC)
          ↓ 83% reduction

FILES
Guestly:  ████████████████████████████████████████ (50+ files)
Chore:    ████████████████████░░░░░░░░░░░░░░░░░░░░ (26 files)
          ↓ 48% reduction

DEPENDENCIES
Guestly:  ████████████████████████████████████████ (37 deps)
Chore:    ████████████████████████░░░░░░░░░░░░░░░░ (16 deps)
          ↓ 57% reduction

MODULES
Guestly:  █████ Auth, User, Payment, Photos, Health
Chore:    ██ Auth, User
          ↓ 60% reduction

FEATURES KEPT
✅ User registration
✅ User login
✅ JWT authentication
✅ Password hashing
✅ Protected routes
✅ User management

FEATURES REMOVED
❌ Google OAuth
❌ Facebook OAuth
❌ Stripe payments
❌ Subscriptions
❌ Photo management
❌ AWS S3 integration
```

---

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Development
npm run start:dev          # Start with hot-reload
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm run test               # Run tests
npm run test:watch         # Watch mode
npm run test:cov           # With coverage

# Code Quality
npm run lint               # Lint code
npm run format             # Format code
```

---

## 📝 Environment Variables

```env
# Database
DB_HOST=localhost          # Database host
DB_PORT=3306              # MySQL port
DB_USERNAME=root          # Database user
DB_ROOT_PASSWORD=pass     # Database password
DB_DATABASE=chore_app     # Database name

# Security
JWT_SECRET=secret-key     # JWT signing key (CHANGE IN PROD!)

# Application
PORT=3000                 # Server port
NODE_ENV=development      # Environment (development/production)
```

---

## ✨ What Makes This Special

1. **Clean Architecture**: Modular, maintainable, scalable
2. **Type Safety**: Full TypeScript with strict typing
3. **Security First**: Industry-standard practices
4. **Production Ready**: Battle-tested code from Guestly
5. **Well Documented**: Comprehensive guides included
6. **Easy to Extend**: Add features with minimal effort

---

## 🎓 Learn More

- **NestJS**: https://nestjs.com/
- **TypeORM**: https://typeorm.io/
- **JWT**: https://jwt.io/
- **bcryptjs**: https://github.com/dcodeIO/bcrypt.js

---

*Created: October 21, 2025*
*Extracted from: Guestly Service*
*Purpose: Chore App Authentication*

