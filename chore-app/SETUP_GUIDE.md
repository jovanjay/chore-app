# Chore App - Setup Guide

This project was extracted from the Guestly Service, containing only the User Module with login and register functionality.

## What's Included

### Core Features
- ✅ User Registration with validation
- ✅ User Login with JWT authentication
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT-based authentication guard
- ✅ Protected routes using JWT
- ✅ TypeORM integration with MySQL
- ✅ Input validation using class-validator

### Removed from Original
- Google OAuth integration
- Facebook OAuth integration
- Subscription management
- Stripe payment integration
- Photo management
- Host/Guest specific features

### Simplified User Entity
The User entity has been simplified to include only essential fields:
- `id` (UUID)
- `email` (unique)
- `password` (hashed)
- `userType` ('user' | 'admin')
- `firstName`
- `lastName`
- `active`
- `createdAt`
- `updatedAt`

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE chore_app;
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_ROOT_PASSWORD=your_password
DB_DATABASE=chore_app

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

PORT=3000
NODE_ENV=development
```

**Important**: Change the `JWT_SECRET` to a strong, random string in production!

### 4. Run the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## API Testing

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "userType": "user"
  }'
```

**Password Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special symbol

Response:
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "userType": "user",
  "message": "Registration successful"
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User (Protected Route)

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "success": true,
  "message": "User authenticated",
  "user": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

### 4. Get User by ID (Protected Route)

```bash
curl -X GET http://localhost:3000/users/USER_UUID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
chore-app/
├── src/
│   ├── database/
│   │   ├── entities/
│   │   │   └── user.entity.ts          # User database entity
│   │   ├── database.module.ts          # Database module
│   │   └── database.provider.ts        # Database connection config
│   ├── modules/
│   │   ├── app.module.ts               # Main application module
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts        # Login validation
│   │   │   │   └── register.dto.ts     # Registration validation
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts   # JWT guard for protected routes
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts     # JWT strategy
│   │   │   ├── types/
│   │   │   │   └── userPayload.type.ts # User payload type
│   │   │   ├── auth.controller.ts      # Auth endpoints
│   │   │   ├── auth.service.ts         # Auth business logic
│   │   │   └── auth.module.ts          # Auth module
│   │   └── user/
│   │       ├── user.controller.ts      # User endpoints
│   │       ├── user.service.ts         # User business logic
│   │       ├── user.provider.ts        # User repository provider
│   │       └── user.module.ts          # User module
│   └── main.ts                         # Application entry point
├── .env.example                        # Example environment variables
├── .gitignore                          # Git ignore rules
├── nest-cli.json                       # NestJS CLI configuration
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── tsconfig.build.json                 # Build configuration
└── README.md                           # Project documentation
```

## Key Differences from Guestly Service

1. **Simplified User Model**: Removed subscription, Stripe, and OAuth fields
2. **User Types**: Changed from 'guest'/'host' to 'user'/'admin'
3. **No Google/Facebook Auth**: Removed OAuth providers and related services
4. **No Payment Integration**: Removed Stripe payment services
5. **No Photo Module**: Removed photo upload and management features
6. **Cleaner Structure**: Focused only on core authentication

## Development Tips

1. **Database Sync**: In development, `synchronize: true` is enabled in the database config. This automatically creates/updates tables. **Disable this in production!**

2. **JWT Token**: The JWT token expires in 24 hours. You can modify this in `auth.module.ts`:
   ```typescript
   signOptions: { expiresIn: '24h' }
   ```

3. **CORS Configuration**: The application allows requests from localhost by default. Update the CORS config in `main.ts` for production.

4. **Password Hashing**: Using bcryptjs with 10 salt rounds. This is secure for most applications.

## Next Steps

Consider adding:
- Password reset functionality
- Email verification
- Refresh tokens
- Rate limiting
- User profile updates
- Admin panel
- Logging system
- Unit tests
- E2E tests

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure the database exists

### JWT Errors
- Verify `JWT_SECRET` is set in `.env`
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

### Validation Errors
- Check password meets all requirements
- Verify email format is valid
- Ensure `confirmPassword` matches `password`

## Support

This is a standalone authentication service extracted from Guestly Service for use in the Chore App project.

