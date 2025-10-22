# Changelog

All notable changes to the Chore App project will be documented in this file.

## [1.2.0] - 2025-10-22

### Added - AWS S3 Photo Upload Integration

#### Features
- **AWS S3 Integration** for chore photo uploads
  - Direct file upload via multipart/form-data
  - Cloud storage instead of database storage
  - Automatic unique filename generation (UUID-based)
  - Public URL generation for photos
  - Organized folder structure (`chore-photos/`)

- **File Validation**
  - File type validation (JPEG, PNG, WebP, HEIC only)
  - File size validation (max 10MB)
  - Automatic rejection of invalid uploads

- **Smart Photo Management**
  - Automatic deletion of old photos when new one uploaded
  - Prevents storage buildup
  - Cost-effective storage management

#### Technical Changes
- Added `@aws-sdk/client-s3` for AWS integration
- Added `multer` for multipart form data handling
- Added `uuid` for unique filename generation
- Created new S3 service module (`src/modules/s3/`)
- Created S3 configuration (`src/config/s3.config.ts`)
- Updated chore controller to handle file uploads
- Updated chore service to use S3 for storage

#### Configuration
- Added environment variables for S3:
  - `AWS_S3_REGION`
  - `AWS_S3_BUCKET`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
- Updated `docker-compose.yml` with S3 env vars
- Updated `env.example` with S3 configuration

#### Documentation
- Created `S3_PHOTO_UPLOAD_GUIDE.md` - Complete setup guide
- Created `S3_SETUP_QUICK_REFERENCE.md` - Quick setup steps
- Created `S3_PHOTO_UPLOAD_SUMMARY.md` - Implementation summary
- Updated README.md with S3 features

#### API Changes
- **Modified:** `PUT /chores/:id/photo`
  - Changed from JSON body to multipart/form-data
  - Now accepts actual file uploads instead of base64
  - Returns S3 URL in response

#### Files Added
- `src/config/s3.config.ts`
- `src/modules/s3/s3.service.ts`
- `src/modules/s3/s3.module.ts`
- `S3_PHOTO_UPLOAD_GUIDE.md`
- `S3_SETUP_QUICK_REFERENCE.md`
- `S3_PHOTO_UPLOAD_SUMMARY.md`
- `CHANGELOG.md`

#### Files Modified
- `package.json` - Added AWS SDK and multer dependencies
- `src/modules/chore/chore.controller.ts` - File upload handling
- `src/modules/chore/chore.service.ts` - S3 integration
- `src/modules/chore/chore.module.ts` - Import S3Module
- `env.example` - S3 configuration
- `docker-compose.yml` - S3 environment variables
- `README.md` - Updated features and guides

#### Files Removed
- `src/modules/chore/dto/upload-photo.dto.ts` - No longer needed

#### Breaking Changes
- Photo upload endpoint now requires multipart/form-data instead of JSON
- Frontend clients must update to send files instead of base64
- S3 credentials required for photo upload functionality

#### Migration Notes
- Old base64 photos in database still work (backward compatible)
- New uploads automatically use S3
- No automatic migration of existing photos (can be done manually if needed)

---

## [1.1.0] - 2025-10-22

### Added - Rewards System

#### Features
- **Rewards Module** for parent-created incentives
  - Parents can create custom rewards with points cost
  - Kids can redeem rewards using earned points
  - Redemption history tracking
  - Active/inactive reward management

- **FIFO Points Redemption**
  - Oldest points used first when redeeming
  - Automatic points deduction
  - Remaining balance calculation
  - Point-to-reward association tracking

#### Technical Changes
- Created `src/modules/rewards/` module
- Created `src/database/entities/reward.entity.ts`
- Updated `src/database/entities/points.entity.ts` with reward tracking
- Created rewards service with CRUD operations
- Created rewards controller with 9 endpoints

#### API Endpoints
- `POST /rewards` - Create reward (parent)
- `GET /rewards` - Get all rewards
- `GET /rewards/active` - Get active rewards
- `GET /rewards/:id` - Get single reward
- `PUT /rewards/:id` - Update reward (parent)
- `DELETE /rewards/:id` - Delete reward (parent)
- `POST /rewards/redeem` - Redeem reward (kid)
- `GET /rewards/history/my` - Get own redemption history (kid)
- `GET /rewards/history/kid/:kidId` - Get kid's redemption history (parent)

#### Documentation
- Created `REWARDS_MODULE_GUIDE.md`
- Created `REWARDS_API_REFERENCE.md`

---

## [1.0.0] - 2025-10-15

### Initial Release

#### Features
- **User Authentication**
  - JWT-based authentication
  - Dual user types (Parent/Kid)
  - Password hashing with bcryptjs
  - Secure login/register

- **User Management**
  - Parent user accounts
  - Kid user accounts
  - Profile management

- **Kids Module**
  - Parent-managed kid profiles
  - Auto-generated login credentials
  - Age and avatar management
  - Unique username generation

- **Chore Management**
  - Create, update, delete chores
  - Assign chores to multiple kids
  - Status workflow tracking
  - Photo upload for completion proof
  - Points assignment per chore

- **Points System**
  - Automatic point awards on approval
  - Point history tracking
  - Claimable vs claimed points
  - Parent oversight of kid points

#### Technical Stack
- NestJS - Backend framework
- TypeORM - Database ORM
- MySQL - Database
- JWT - Authentication
- Docker - Containerization

#### Documentation
- Created `README.md`
- Created `QUICKSTART.md`
- Created `SETUP_GUIDE.md`
- Created `DOCKER.md`
- Created `API_REFERENCE.md`
- Created `PROJECT_SUMMARY.md`
- Created `KIDS_MODULE_SUMMARY.md`
- Created `CHORE_MODULE_GUIDE.md`
- Created `POINTS_SYSTEM_GUIDE.md`

---

## Release Notes

### Version Numbering
- **MAJOR.MINOR.PATCH** (Semantic Versioning)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Upcoming Features
- [ ] Notifications system
- [ ] Mobile app integration
- [ ] Recurring chores
- [ ] Family calendar integration
- [ ] Reward categories
- [ ] Points expiration policies

---

**Maintained by:** Chore App Development Team  
**Last Updated:** October 22, 2025

