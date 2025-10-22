# Docker Setup Guide

This guide will help you run the Chore App using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Using Docker Compose (Recommended)

This will start both the NestJS application and MySQL database:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (this will delete database data)
docker-compose down -v
```

The application will be available at `http://localhost:3000`

### 2. Using Docker Only

If you prefer to use Docker directly with an existing MySQL instance:

```bash
# Build the image
docker build -t chore-app .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e DB_HOST=your-mysql-host \
  -e DB_PORT=3306 \
  -e DB_USERNAME=root \
  -e DB_ROOT_PASSWORD=password \
  -e DB_DATABASE=chore_app \
  -e JWT_SECRET=your-secret-key \
  --name chore-app \
  chore-app
```

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

- `PORT`: Application port (default: 3000)
- `DB_HOST`: MySQL host (use 'mysql' for Docker Compose, 'localhost' for local)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USERNAME`: Database username
- `DB_ROOT_PASSWORD`: Database password
- `DB_DATABASE`: Database name
- `JWT_SECRET`: Secret key for JWT tokens (change this in production!)
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 24h)

## Docker Compose Configuration

The `docker-compose.yml` includes:

### Services

1. **app**: NestJS application
   - Port: 3000
   - Auto-restarts on failure
   - Waits for MySQL to be healthy before starting

2. **mysql**: MySQL 8.0 database
   - Port: 3306
   - Persistent data storage
   - Health checks enabled

### Volumes

- `mysql-data`: Persistent storage for MySQL data

### Networks

- `chore-network`: Bridge network for service communication

## Common Commands

```bash
# Build/rebuild services
docker-compose build

# Start services in foreground
docker-compose up

# Start services in background
docker-compose up -d

# View logs of all services
docker-compose logs -f

# View logs of specific service
docker-compose logs -f app

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart app

# Access MySQL shell
docker-compose exec mysql mysql -u root -p

# Access app container shell
docker-compose exec app sh

# View running containers
docker-compose ps
```

## Development vs Production

### Development

For development, you might want to mount your source code as a volume:

```yaml
services:
  app:
    volumes:
      - ./src:/app/src
    command: npm run start:dev
```

### Production

For production:

1. **Change default passwords** in `.env` or `docker-compose.yml`
2. **Set a strong JWT_SECRET**
3. **Set `synchronize: false`** in `database.provider.ts` and use migrations
4. **Use environment-specific configurations**
5. **Enable proper logging and monitoring**

## Troubleshooting

### Application won't start

Check if MySQL is ready:
```bash
docker-compose logs mysql
```

### Database connection issues

Ensure the MySQL service is healthy:
```bash
docker-compose ps
```

Wait for the health check to pass before the app starts.

### Port already in use

Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Reset database

```bash
docker-compose down -v
docker-compose up -d
```

This will delete all data and start fresh.

## Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Builder stage**: Compiles TypeScript to JavaScript
2. **Production stage**: Creates a minimal image with only production dependencies

This results in a smaller, more secure image.

## Scaling

To run multiple instances of the app:

```bash
docker-compose up -d --scale app=3
```

Note: You'll need to configure a load balancer for this setup.

