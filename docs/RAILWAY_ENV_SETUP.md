# Railway Environment Variables Setup Guide

## In Railway Dashboard → Your App → Variables Tab

Add these environment variables:

```bash
# Database (Railway will auto-inject from your PostgreSQL service)
DATABASE_URL=${{ Postgres.DATABASE_URL }}

# Redis (Railway will auto-inject from your Redis service)  
REDIS_URL=${{ Redis.REDIS_URL }}

# AI API Keys (set manually)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Production settings
NODE_ENV=production
JWT_SECRET=production-secret-key-generate-new-one
NEXTAUTH_SECRET=production-nextauth-secret-generate-new-one
NEXTAUTH_URL=${{ RAILWAY_PUBLIC_DOMAIN }}

# Performance settings
MAX_TOKEN_BUDGET_PER_WORKBOOK=50000
GENERATION_TIMEOUT_MINUTES=30

# Feature flags
ENABLE_PDF_EXPORT=true
ENABLE_ANALYTICS=true
```

## Service Connections

Make sure in Railway:
1. Your app is connected to PostgreSQL service
2. Your app is connected to Redis service  
3. Both services are running (green checkmarks)

## Testing Connection

Once deployed, test at:
`https://your-app.railway.app/api/test-db`