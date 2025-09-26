# 🚀 Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Pedagogical Workbook Generator to production environments. We support multiple deployment options with Railway.app as the recommended platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Railway Deployment (Recommended)](#railway-deployment-recommended)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [AI Services Configuration](#ai-services-configuration)
6. [Domain & SSL Setup](#domain--ssl-setup)
7. [Alternative Deployment Options](#alternative-deployment-options)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts & Services
- [Railway.app](https://railway.app) account
- [Google Cloud Platform](https://console.cloud.google.com) account
- [GitHub](https://github.com) repository access
- Domain name (optional, for custom domains)

### Local Development Setup
Ensure your application runs locally before deployment:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma db push

# Test the application
npm run dev
```

## Railway Deployment (Recommended)

Railway.app provides the best deployment experience for Next.js applications with PostgreSQL.

### Step 1: Create Railway Account

1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Verify your email address

### Step 2: Create New Project

```bash
# Install Railway CLI (optional)
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from GitHub (recommended)
# Or deploy directly from CLI
railway init
railway up
```

#### GitHub Integration Method (Recommended)

1. **Connect Repository**:
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Build Settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Node Version: 18.x

### Step 3: Configure Environment Variables

In your Railway project dashboard:

1. Go to "Variables" tab
2. Add the following environment variables:

#### Required Variables

```bash
# Database (automatically configured by Railway)
DATABASE_URL=postgresql://[auto-generated]

# Next.js Configuration
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-secret-key-here

# Phase 1 AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=ant-...

# Phase 2 AI Services
GOOGLE_VERTEX_AI_PROJECT_ID=your-google-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Optional Phase 2 Services
SYMBOLAB_API_KEY=your-symbolab-key
VECTORART_API_KEY=your-vectorart-key

# Application Settings
NODE_ENV=production
PORT=3000
```

#### Google Cloud Credentials Setup

1. **Upload Credentials File**:
   ```bash
   # Create credentials directory in your project
   mkdir -p credentials
   
   # Copy your Google credentials file
   cp /path/to/your/google-credentials.json ./google-credentials.json
   
   # Commit to repository (ensure it's in a private repo)
   git add google-credentials.json
   git commit -m "Add Google Cloud credentials"
   git push
   ```

2. **Alternative: Environment Variable Method**:
   ```bash
   # Convert JSON to base64
   base64 google-credentials.json
   
   # Add as environment variable
   GOOGLE_APPLICATION_CREDENTIALS_JSON=base64-encoded-json
   ```

### Step 4: Add PostgreSQL Database

1. **Add Database Service**:
   - In Railway dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Database will be automatically linked

2. **Verify Database Connection**:
   ```bash
   # Check database URL is set
   echo $DATABASE_URL
   
   # Run migrations
   npx prisma db push
   ```

### Step 5: Deploy

1. **Automatic Deployment**:
   - Railway automatically deploys on git push
   - Monitor deployment in Railway dashboard

2. **Manual Deployment**:
   ```bash
   # Using Railway CLI
   railway up
   
   # Or trigger deployment via dashboard
   ```

### Step 6: Configure Custom Domain (Optional)

1. **In Railway Dashboard**:
   - Go to "Settings" → "Domains"
   - Click "Custom Domain"
   - Enter your domain name

2. **DNS Configuration**:
   ```
   # Add CNAME record in your DNS provider
   Type: CNAME
   Name: your-subdomain (or @)
   Value: your-app.railway.app
   ```

3. **SSL Certificate**:
   - Railway automatically provisions SSL certificates
   - Certificate activation may take 5-10 minutes

## Environment Configuration

### Production Environment Variables

Create a comprehensive `.env.production` file:

```bash
# === Core Application ===
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters

# === Database ===
DATABASE_URL=postgresql://user:password@host:port/database

# === Phase 1 AI Services ===
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=ant-your-anthropic-api-key

# === Phase 2 AI Services ===
GOOGLE_VERTEX_AI_PROJECT_ID=your-google-cloud-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# === Optional Phase 2 Services ===
SYMBOLAB_API_KEY=your-symbolab-api-key
VECTORART_API_KEY=your-vectorart-api-key

# === Security ===
ENCRYPTION_KEY=your-encryption-key-for-sensitive-data
JWT_SECRET=your-jwt-secret-key

# === Monitoring (Optional) ===
SENTRY_DSN=your-sentry-dsn-for-error-tracking
ANALYTICS_ID=your-analytics-tracking-id

# === Feature Flags ===
ENABLE_PHASE2=true
ENABLE_USER_AUTH=true
ENABLE_ANALYTICS=false
```

### Environment Variable Security

1. **Sensitive Data**:
   - Never commit API keys to repository
   - Use Railway's secure variable storage
   - Rotate keys regularly

2. **Validation**:
   ```javascript
   // Add to your app startup
   const requiredEnvVars = [
     'DATABASE_URL',
     'NEXTAUTH_SECRET',
     'OPENAI_API_KEY',
     'GOOGLE_VERTEX_AI_PROJECT_ID'
   ];
   
   requiredEnvVars.forEach(varName => {
     if (!process.env[varName]) {
       throw new Error(`Missing required environment variable: ${varName}`);
     }
   });
   ```

## Database Setup

### Prisma Configuration for Production

1. **Database Migration**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Or use migrations (recommended for production)
   npx prisma migrate deploy
   ```

2. **Connection Pooling**:
   ```javascript
   // prisma/schema.prisma
   generator client {
     provider = "prisma-client-js"
   }
   
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Production Database Settings**:
   ```bash
   # Add to environment variables
   DATABASE_URL="postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=20"
   ```

### Database Backup Strategy

1. **Automated Backups**:
   - Railway provides automatic daily backups
   - Configure backup retention in Railway dashboard

2. **Manual Backup**:
   ```bash
   # Export database
   pg_dump $DATABASE_URL > backup.sql
   
   # Restore database
   psql $DATABASE_URL < backup.sql
   ```

## AI Services Configuration

### Google Vertex AI Setup

1. **Project Configuration**:
   ```bash
   # Enable required APIs
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable compute.googleapis.com
   ```

2. **Service Account Permissions**:
   ```bash
   # Create service account
   gcloud iam service-accounts create workbook-generator \
     --display-name="Workbook Generator"
   
   # Grant permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:workbook-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   
   # Generate key file
   gcloud iam service-accounts keys create google-credentials.json \
     --iam-account=workbook-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

### API Key Management

1. **Secure Storage**:
   - Store API keys in Railway environment variables
   - Use separate keys for staging/production
   - Implement key rotation strategy

2. **Rate Limiting**:
   ```javascript
   // Implement rate limiting for AI services
   const rateLimiter = {
     openai: { requests: 100, per: 'hour' },
     anthropic: { requests: 50, per: 'hour' },
     vertex: { requests: 200, per: 'hour' }
   };
   ```

## Domain & SSL Setup

### Custom Domain Configuration

1. **Domain Purchase**:
   - Recommended registrars: Namecheap, Google Domains, Cloudflare

2. **DNS Configuration**:
   ```
   # DNS Records
   Type: CNAME
   Name: www
   Value: your-app.railway.app
   TTL: 300
   
   # Root domain redirect (if needed)
   Type: A
   Name: @
   Value: Railway IP (check Railway docs)
   ```

3. **SSL Certificate**:
   - Railway provides automatic SSL via Let's Encrypt
   - Custom certificates can be uploaded if needed

### Cloudflare Integration (Optional)

1. **Benefits**:
   - CDN for faster global performance
   - DDoS protection
   - Advanced caching rules

2. **Setup**:
   ```
   # Point domain to Cloudflare
   # Then configure Cloudflare to proxy to Railway
   Type: CNAME
   Name: your-domain.com
   Value: your-app.railway.app
   Proxy: Enabled (orange cloud)
   ```

## Alternative Deployment Options

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

**Limitations**:
- File system access limitations
- May require external database hosting

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and deploy
docker build -t workbook-generator .
docker run -p 3000:3000 workbook-generator
```

### AWS/Azure/GCP Deployment

1. **AWS App Runner**:
   - Connect GitHub repository
   - Configure build settings
   - Add environment variables

2. **Azure Container Apps**:
   - Deploy via Azure CLI
   - Configure managed identity for services

3. **Google Cloud Run**:
   - Build with Cloud Build
   - Deploy containerized application

## Monitoring & Maintenance

### Health Checks

1. **Application Health**:
   ```javascript
   // pages/api/health.js
   export default function handler(req, res) {
     const health = {
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       memory: process.memoryUsage(),
       database: await checkDatabaseConnection(),
       aiServices: await checkAIServices()
     };
     
     res.status(200).json(health);
   }
   ```

2. **Monitoring Setup**:
   ```bash
   # Add monitoring tools
   npm install @sentry/nextjs
   npm install @vercel/analytics
   ```

### Performance Monitoring

1. **Metrics to Track**:
   - Response times
   - Error rates
   - Database connection pool usage
   - AI API response times
   - Memory usage

2. **Alerting**:
   ```javascript
   // Set up alerts for:
   // - API errors > 5%
   // - Response time > 5 seconds
   // - Memory usage > 80%
   // - Database connection failures
   ```

### Backup Strategy

1. **Database Backups**:
   - Railway: Automatic daily backups
   - Manual exports before major updates

2. **Code Backups**:
   - Git repository with multiple remotes
   - Regular tagged releases

3. **Configuration Backups**:
   - Export environment variables
   - Document deployment procedures

### Updates & Maintenance

1. **Deployment Process**:
   ```bash
   # 1. Test locally
   npm run test
   npm run build
   
   # 2. Deploy to staging
   git push origin staging
   
   # 3. Verify staging environment
   curl https://staging-your-app.railway.app/api/health
   
   # 4. Deploy to production
   git push origin main
   
   # 5. Verify production
   curl https://your-app.railway.app/api/health
   ```

2. **Rollback Procedure**:
   ```bash
   # Railway automatic rollback
   railway rollback
   
   # Or git-based rollback
   git revert HEAD
   git push origin main
   ```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**:
   ```bash
   # Check build logs in Railway dashboard
   # Common fixes:
   
   # Node version mismatch
   echo "18.x" > .nvmrc
   
   # Missing dependencies
   npm install --save-dev @types/node
   
   # Build timeout
   # Increase build timeout in Railway settings
   ```

2. **Database Connection Issues**:
   ```bash
   # Verify DATABASE_URL format
   # PostgreSQL format:
   postgresql://username:password@host:port/database
   
   # Test connection
   npx prisma db push
   ```

3. **Environment Variable Issues**:
   ```bash
   # Check variable names (case sensitive)
   # Verify no extra spaces
   # Test locally with same variables
   ```

4. **AI Service Failures**:
   ```bash
   # Check API key validity
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   
   # Verify quota limits
   # Check service status pages
   ```

### Performance Issues

1. **Slow Response Times**:
   - Check AI API response times
   - Monitor database query performance
   - Implement caching for frequently requested content

2. **Memory Issues**:
   ```javascript
   // Monitor memory usage
   process.on('warning', (warning) => {
     console.warn(warning.name);
     console.warn(warning.message);
     console.warn(warning.stack);
   });
   ```

3. **Database Performance**:
   ```sql
   -- Add database indexes for better performance
   CREATE INDEX idx_workbooks_user_id ON workbooks(user_id);
   CREATE INDEX idx_workbooks_created_at ON workbooks(created_at);
   ```

### Support Resources

1. **Railway Support**:
   - [Railway Documentation](https://docs.railway.app)
   - Railway Discord community
   - GitHub issues for Railway CLI

2. **Application Support**:
   - Project repository issues
   - Documentation in `/docs` folder
   - Development team contact

3. **Emergency Procedures**:
   ```bash
   # Immediate rollback
   railway rollback
   
   # Scale down if needed
   railway scale --replicas 0
   
   # Check service status
   railway status
   ```

## Security Checklist

### Pre-Deployment Security

- [ ] All API keys stored securely in environment variables
- [ ] No sensitive data committed to repository
- [ ] Google credentials file handled securely
- [ ] Database connection uses SSL
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Environment variables validated on startup

### Post-Deployment Security

- [ ] SSL certificate active and valid
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive information
- [ ] Regular security updates applied
- [ ] Access logs monitored

## Conclusion

This deployment guide provides comprehensive instructions for deploying the Pedagogical Workbook Generator to production. Railway.app is the recommended platform due to its excellent Next.js support, automatic PostgreSQL provisioning, and simple deployment process.

Remember to:
- Test thoroughly in staging environment
- Monitor application health post-deployment
- Keep environment variables secure
- Maintain regular backups
- Follow the rollback procedure if issues arise

For additional support, refer to the [Troubleshooting Guide](TROUBLESHOOTING.md) or open an issue in the project repository.