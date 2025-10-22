# 🏠 Chore App - Family Chore Management System

A comprehensive NestJS-based family chore management application with an integrated rewards system. Parents can create chores, assign them to kids, and reward completed tasks with points that can be redeemed for prizes.

## ✨ Features

### 👨‍👩‍👧‍👦 User Management
- Dual user types: **Parents** and **Kids**
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Auto-generated kid accounts with secure passwords

### 📋 Chore Management
- Create, update, and delete chores
- Assign chores to multiple kids
- **AWS S3 photo upload** for completed chores
- Status tracking: pending → in_progress → completed → approved/rejected
- Points system for approved chores
- Automatic file validation (type & size)
- Cloud storage for scalability

### 🎯 Points System
- Automatic point awards for approved chores
- Point history tracking
- Claimable vs claimed points
- Parent oversight of kid points

### 🎁 Rewards System (New!)
- Parents create custom rewards with points cost
- Kids redeem rewards using earned points
- FIFO (First In, First Out) points redemption
- Redemption history tracking
- Active/inactive reward management

### 👶 Kids Module
- Parent-managed kid profiles
- Auto-login credentials generation
- Age and avatar management
- Individual point balances

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run this application is using Docker Compose:

```bash
# Start the application and MySQL database
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

For more Docker options, see [DOCKER.md](DOCKER.md)

## 📦 Manual Installation

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Configure environment (copy and edit .env.example)
cp .env.example .env

# Run database migrations (auto-sync enabled in development)
# Tables will be created automatically on first run

# Start the application
npm run start:dev
```

## 🔧 Configuration

Create a `.env` file based on `.env.example`:

```env
# Application
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_ROOT_PASSWORD=your-password
DB_DATABASE=chore_app

# App URL
APP_URL=http://localhost:3000

# AWS S3 (for photo uploads)
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

**Note:** S3 configuration is optional but required for photo uploads. See [S3_SETUP_QUICK_REFERENCE.md](S3_SETUP_QUICK_REFERENCE.md) for setup instructions.

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new parent account | Public |
| POST | `/auth/login` | Login with username/password | Public |
| GET | `/auth/me` | Get current user info | Authenticated |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users/:id` | Get user by ID | Authenticated |

### Kids Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/kids` | Create kid profile | Parent |
| GET | `/kids` | Get all kids | Parent |
| GET | `/kids/me/profile` | Get own profile | Kid |
| GET | `/kids/:id` | Get kid by ID | Parent |
| PATCH | `/kids/:id` | Update kid profile | Parent |
| DELETE | `/kids/:id` | Delete kid profile | Parent |

### Chore Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/chores` | Create chore | Parent |
| GET | `/chores` | Get all chores | Both |
| GET | `/chores/:id` | Get chore by ID | Both |
| PATCH | `/chores/:id` | Update chore | Parent |
| PUT | `/chores/:id/status` | Update chore status | Both |
| PUT | `/chores/:id/photo` | Upload completion photo | Kid |
| PUT | `/chores/:id/assign` | Assign kids to chore | Parent |
| DELETE | `/chores/:id/assign/:kidId` | Remove kid from chore | Parent |
| DELETE | `/chores/:id` | Delete chore | Parent |

### Points Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/points/available` | Get available points | Kid |
| GET | `/points/history` | Get points history | Kid |
| GET | `/points/kid/:kidId` | Get kid's points | Parent |
| POST | `/points/claim` | Claim specific points | Kid |
| POST | `/points/claim-all` | Claim all points | Kid |

### Rewards Endpoints (New!)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/rewards` | Create reward | Parent |
| GET | `/rewards` | Get all rewards | Both |
| GET | `/rewards/active` | Get active rewards | Both |
| GET | `/rewards/:id` | Get reward by ID | Both |
| PUT | `/rewards/:id` | Update reward | Parent |
| DELETE | `/rewards/:id` | Delete reward | Parent |
| POST | `/rewards/redeem` | Redeem reward | Kid |
| GET | `/rewards/history/my` | Get own redemption history | Kid |
| GET | `/rewards/history/kid/:kidId` | Get kid's redemption history | Parent |

For detailed API documentation, see:
- [API_REFERENCE.md](API_REFERENCE.md)
- [REWARDS_API_REFERENCE.md](REWARDS_API_REFERENCE.md)

## 📖 Module Guides

- [KIDS_MODULE_SUMMARY.md](KIDS_MODULE_SUMMARY.md) - Kids management guide
- [CHORE_MODULE_GUIDE.md](CHORE_MODULE_GUIDE.md) - Chore management guide
- [POINTS_SYSTEM_GUIDE.md](POINTS_SYSTEM_GUIDE.md) - Points system guide
- [REWARDS_MODULE_GUIDE.md](REWARDS_MODULE_GUIDE.md) - Rewards system guide
- [S3_PHOTO_UPLOAD_GUIDE.md](S3_PHOTO_UPLOAD_GUIDE.md) - AWS S3 photo upload guide
- [S3_SETUP_QUICK_REFERENCE.md](S3_SETUP_QUICK_REFERENCE.md) - Quick S3 setup

## 🏗️ Project Structure

```
src/
├── database/
│   ├── database.module.ts
│   ├── database.provider.ts
│   └── entities/
│       ├── user.entity.ts
│       ├── kids.entity.ts
│       ├── chore.entity.ts
│       ├── points.entity.ts
│       └── reward.entity.ts
├── modules/
│   ├── app.module.ts
│   ├── auth/                    # Authentication module
│   ├── user/                    # User management
│   ├── kids/                    # Kids profiles
│   ├── chore/                   # Chore management
│   ├── points/                  # Points system
│   └── rewards/                 # Rewards system (New!)
└── main.ts
```

## 🛠️ Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **class-validator** - Input validation
- **Passport** - Authentication middleware
- **Docker** - Containerization

## 🔄 Typical Workflow

1. **Parent registers** and logs in
2. **Parent creates kid profiles** (auto-generates credentials)
3. **Parent creates chores** with point values
4. **Parent assigns chores** to kids
5. **Parent creates rewards** kids can redeem
6. **Kid logs in** and views assigned chores
7. **Kid starts and completes chores** (with photo proof)
8. **Parent reviews** and approves/rejects chores
9. **Kid receives points** for approved chores
10. **Kid redeems rewards** using earned points

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker Support

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

## 📝 Available Scripts

```bash
# Development
npm run start:dev        # Start with hot reload

# Production
npm run build            # Build for production
npm run start:prod       # Start production server

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Generate coverage report
```

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (parent/child)
- Input validation on all endpoints
- SQL injection prevention (TypeORM)
- Environment variable configuration
- CORS protection

## 🤝 Contributing

This is a private family project. For feature requests or bug reports, please contact the repository owner.

## 📄 License

Private/Proprietary - All rights reserved

## 📞 Support

For detailed guides, see:
- [QUICKSTART.md](QUICKSTART.md) - Getting started guide
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project overview

## 🚀 Recent Updates

### v1.2.0 - AWS S3 Photo Upload
- 📸 AWS S3 integration for chore photos
- ☁️ Cloud storage instead of database
- 🔒 Secure file upload with validation
- 🗑️ Automatic old photo cleanup
- 📏 File size & type validation (max 10MB)

### v1.1.0 - Rewards System
- ✨ Added Rewards Module
- 🎁 Parents can create custom rewards
- 💰 Kids can redeem rewards with points
- 📊 Redemption history tracking
- 🔄 FIFO points redemption system

### v1.0.0 - Initial Release
- 👥 User authentication (Parent/Kid)
- 📋 Chore management
- 🎯 Points system
- 👶 Kids profile management

---

Made with ❤️ for families
