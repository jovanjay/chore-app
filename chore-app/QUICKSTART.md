# Chore App - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Setup Database (1 min)
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE chore_app;
exit;
```

### Step 3: Configure Environment (1 min)
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Change JWT_SECRET to a secure random string!
```

### Step 4: Run the Application (1 min)
```bash
npm run start:dev
```

You should see:
```
Application is running on: http://localhost:3000
```

### Step 5: Test the API (1 min)

#### Register a user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "userType": "user"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

Save the token from the response!

#### Get current user:
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎉 That's It!

You now have a fully functional authentication API.

## 📚 Next Steps

- Read the [README.md](README.md) for full API documentation
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions
- See [EXTRACTION_SUMMARY.md](EXTRACTION_SUMMARY.md) to understand what was extracted

## 🔧 Common Issues

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Make sure MySQL is running and credentials in `.env` are correct.

### Password Validation Error
```
message: "password must be a strong password"
```
**Solution**: Password must have:
- At least 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special symbol

### JWT Error
```
message: "Unauthorized"
```
**Solution**: Check your token is valid and in format: `Bearer <token>`

## 📞 Support

If you encounter any issues, check:
1. Node.js version: `node --version` (should be v18+)
2. MySQL is running: `mysql -u root -p`
3. Port 3000 is not in use
4. Environment variables are set correctly in `.env`

## 🛠️ Development Commands

```bash
# Development with auto-reload
npm run start:dev

# Build for production
npm run build

# Run production
npm run start:prod

# Run tests
npm run test

# Lint code
npm run lint
```

Happy coding! 🚀

