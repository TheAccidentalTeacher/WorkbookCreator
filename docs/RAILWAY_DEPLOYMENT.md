# 🚀 Railway Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Pedagogical Workbook Generator to Railway, including troubleshooting common issues and optimization strategies.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Process](#deployment-process)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring](#monitoring)

## Quick Start

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/Ixxxxx)

### Manual Deployment

1. **Connect Repository**
   ```bash
   # Clone your repository
   git clone https://github.com/TheAccidentalTeacher/WorkbookCreator.git
   cd WorkbookCreator
   ```

2. **Connect to Railway**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment**
   - Add required environment variables
   - Review build settings
   - Deploy

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Memory**: Minimum 512MB (Railway Starter plan sufficient)
- **Build Time**: ~2-3 minutes typical

### Account Requirements

- **Railway Account**: Free tier available
- **GitHub Account**: For repository connection
- **OpenAI/Anthropic API Keys**: For AI features (optional)

## Environment Setup

### Required Environment Variables

Create these variables in Railway's environment settings:

```bash
# Core Application
NODE_ENV=production
PORT=3000

# AI Integration (Optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=ant-...

# Authentication (if implemented)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.railway.app

# Database (if using)
DATABASE_URL=postgresql://...
```

### Environment File Template

For local development, use `.env.local`:

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit with your values
nano .env.local
```

## Deployment Process

### Step 1: Repository Preparation

Ensure your repository is deployment-ready:

```bash
# Check build locally
npm run build

# Verify all dependencies
npm audit

# Test production start
npm start
```

### Step 2: Railway Project Creation

1. **Login to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   railway link [your-project-id]
   ```

### Step 3: Configuration

#### Build Settings

Railway automatically detects Next.js projects. Default settings:

```yaml
# railway.toml (optional custom configuration)
[build]
  builder = "nixpacks"
  buildCommand = "npm run build"

[deploy]
  startCommand = "npm start"
  restartPolicyType = "on_failure"
```

#### Custom Build Configuration

For advanced setups:

```toml
# railway.toml
[build]
  builder = "nixpacks"
  buildCommand = "npm ci && npm run build"

[deploy]
  startCommand = "npm start"
  healthcheckPath = "/api/health"
  healthcheckTimeout = 300
```

### Step 4: Environment Variables

Add via Railway Dashboard or CLI:

```bash
# Using Railway CLI
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=sk-...

# Using Railway Dashboard
# Go to Project Settings > Variables
# Add each key-value pair
```

### Step 5: Deploy

```bash
# Deploy current branch
railway up

# Deploy specific branch
railway up --branch main

# Deploy with custom service name
railway up --service workbook-generator
```

## Configuration

### Next.js Optimization for Railway

#### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway optimization
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // Output configuration
  output: 'standalone',
  
  // Image optimization (Railway compatible)
  images: {
    unoptimized: true,
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize for Railway deployment
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

#### package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "railway:build": "npm ci && npm run build",
    "railway:start": "npm start"
  }
}
```

### Health Check Endpoint

Create `/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version 
    },
    { status: 200 }
  );
}
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error**: "Memory limit exceeded during build"

```bash
# Solution: Optimize build process
npm run build -- --max-old-space-size=4096

# Or in package.json
"build": "node --max-old-space-size=4096 ./node_modules/.bin/next build"
```

**Error**: "Module not found" during build

```bash
# Check dependencies
npm ls --depth=0

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### 2. Deployment Errors

**Error**: "Application failed to start"

Check logs:
```bash
railway logs
```

Common causes:
- Missing environment variables
- Port configuration issues
- Build artifacts missing

**Error**: "Port already in use"

Ensure correct port configuration:
```javascript
// In your server file
const port = process.env.PORT || 3000;
```

#### 3. Runtime Issues

**Error**: "PDF generation not working"

Our client-side solution should work, but verify:
```javascript
// Check browser compatibility
if (typeof window === 'undefined') {
  console.log('Server-side environment detected');
}
```

**Error**: "API routes not responding"

Check Next.js API route configuration:
```typescript
// app/api/test/route.ts
export async function GET() {
  return Response.json({ message: 'API working' });
}
```

### Debugging Tools

#### Railway CLI Debugging

```bash
# View recent logs
railway logs

# Stream live logs
railway logs --follow

# View specific service logs
railway logs --service [service-name]

# View build logs
railway logs --deployment [deployment-id]
```

#### Application Monitoring

```bash
# Check application status
curl https://your-app.railway.app/api/health

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s "https://your-app.railway.app"
```

### Performance Debugging

#### Memory Usage

Add monitoring to your application:

```typescript
// utils/monitoring.ts
export function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}
```

#### Build Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for circular dependencies
npx madge --circular --extensions ts,tsx ./src
```

## Performance Optimization

### Build Optimization

#### Dependency Management

```bash
# Remove unnecessary dependencies
npm uninstall puppeteer puppeteer-core  # Already done
npm uninstall unused-package

# Use production builds
NODE_ENV=production npm ci --omit=dev
```

#### Bundle Size Reduction

```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Production optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
  
  // Remove unused code
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
};
```

### Runtime Optimization

#### Caching Strategy

```javascript
// next.config.js
module.exports = {
  // Static file caching
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

#### Image Optimization

Since Railway has limitations, optimize images:

```typescript
// Use next/image with unoptimized flag
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo"
  unoptimized={true}  // For Railway compatibility
  width={200}
  height={100}
/>
```

### Database Optimization (if using)

```typescript
// Use connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,  // Railway connection limits
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Monitoring

### Built-in Railway Monitoring

Railway provides:
- **CPU Usage**: Real-time monitoring
- **Memory Usage**: Current and historical
- **Network Traffic**: Inbound/outbound
- **Response Times**: Average and percentiles
- **Error Rates**: HTTP status codes

### Custom Application Monitoring

#### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  };
  
  return Response.json(health);
}
```

#### Error Tracking

```typescript
// utils/errorHandler.ts
export function trackError(error: Error, context: string) {
  console.error(`[${context}] Error:`, error.message);
  
  // Send to monitoring service (optional)
  if (process.env.NODE_ENV === 'production') {
    // Integration with Sentry, LogRocket, etc.
  }
}
```

### Alerts and Notifications

Set up Railway alerts for:
- **High Memory Usage**: >80%
- **High CPU Usage**: >90%
- **Error Rate**: >5%
- **Response Time**: >2 seconds

## Best Practices

### Security

1. **Environment Variables**
   ```bash
   # Never commit secrets
   echo ".env*" >> .gitignore
   
   # Use Railway's secret management
   railway variables set SECRET_KEY=xxx
   ```

2. **API Security**
   ```typescript
   // Add rate limiting
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

### Reliability

1. **Graceful Shutdowns**
   ```typescript
   // Handle shutdown signals
   process.on('SIGTERM', () => {
     console.log('SIGTERM received, shutting down gracefully');
     server.close(() => {
       process.exit(0);
     });
   });
   ```

2. **Error Boundaries**
   ```tsx
   // components/ErrorBoundary.tsx
   export class ErrorBoundary extends Component {
     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
       console.error('Error boundary caught:', error);
     }
   }
   ```

### Cost Optimization

1. **Resource Usage**
   - Monitor memory usage patterns
   - Optimize bundle sizes
   - Use efficient algorithms

2. **Railway Plan Selection**
   - **Hobby Plan**: For development and testing
   - **Pro Plan**: For production with higher limits
   - **Team Plan**: For multiple environments

## Advanced Configuration

### Custom Domains

1. **Add Domain in Railway**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records

2. **SSL Certificates**
   - Railway provides automatic SSL
   - Certificates auto-renew
   - HTTPS enforced by default

### Multiple Environments

```bash
# Create staging environment
railway environment create staging

# Deploy to staging
railway up --environment staging

# Promote to production
railway environment promote staging production
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --detach
```

## Migration from Other Platforms

### From Vercel

```bash
# Export Vercel configuration
vercel env ls > .env.railway

# Adapt build settings
# Vercel: vercel.json -> Railway: railway.toml
```

### From Heroku

```bash
# Export Heroku config
heroku config -s > .env.railway

# Adapt Procfile to package.json scripts
# Procfile: web: npm start -> package.json: "start": "npm start"
```

### From Netlify

```bash
# Static site to Next.js app
# Move _redirects to next.config.js rewrites
# Move netlify.toml settings to railway.toml
```

## Support and Resources

### Getting Help

1. **Railway Community**
   - [Discord Server](https://discord.gg/railway)
   - [GitHub Discussions](https://github.com/railwayapp/railway/discussions)

2. **Documentation**
   - [Railway Docs](https://docs.railway.app)
   - [Next.js Railway Guide](https://docs.railway.app/guides/nextjs)

3. **Project Support**
   - Create GitHub issue in project repository
   - Check troubleshooting documentation

### Useful Links

- [Railway Status Page](https://railway.app/status)
- [Railway Pricing](https://railway.app/pricing)
- [Railway Templates](https://railway.app/templates)
- [Railway CLI Reference](https://docs.railway.app/cli/quick-start)

## Conclusion

Railway deployment for the Pedagogical Workbook Generator is straightforward thanks to our PDFMake implementation. Key success factors:

- ✅ **Lightweight bundle** (no Puppeteer)
- ✅ **Client-side PDF generation** (no server memory issues)
- ✅ **Standard Next.js deployment** (Railway optimized)
- ✅ **Comprehensive monitoring** (health checks and logging)

The platform provides excellent developer experience with automatic deployments, environment management, and built-in monitoring—perfect for educational applications that need reliable, scalable hosting.