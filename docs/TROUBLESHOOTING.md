# 🔧 Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues you might encounter while developing, deploying, or using the Pedagogical Workbook Generator. It covers everything from development environment problems to production deployment issues.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Development Issues](#development-issues)
3. [Build & Deploy Issues](#build--deploy-issues)
4. [Runtime Issues](#runtime-issues)
5. [PDF Generation Issues](#pdf-generation-issues)
6. [AI Service Issues](#ai-service-issues)
7. [Performance Issues](#performance-issues)
8. [Railway-Specific Issues](#railway-specific-issues)

## Quick Diagnostics

### Health Check Commands

```bash
# 1. Check system requirements
node --version          # Should be 18.x or higher
npm --version           # Should be 9.x or higher

# 2. Check project health
npm run type-check      # TypeScript validation
npm run lint           # ESLint validation
npm test              # Run test suite

# 3. Check dependencies
npm audit              # Security vulnerabilities
npm outdated          # Outdated packages

# 4. Check build
npm run build         # Production build test
```

### Common Quick Fixes

```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json .next
npm install

# Reset development server
npm run dev -- --port 3001

# Clear TypeScript cache
rm -rf .next/types

# Reset git state (if needed)
git reset --hard HEAD
git clean -fd
```

## Development Issues

### Issue: `npm install` Fails

#### Symptoms
```bash
npm ERR! peer dep missing
npm ERR! code ERESOLVE
```

#### Solutions

**1. Clear npm cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**2. Use legacy peer deps (temporary fix)**
```bash
npm install --legacy-peer-deps
```

**3. Update npm**
```bash
npm install -g npm@latest
```

**4. Check Node.js version compatibility**
```bash
# Install Node.js 18 if using older version
nvm install 18
nvm use 18
```

### Issue: TypeScript Errors on Start

#### Symptoms
```bash
Type error: Cannot find module 'pdfmake/build/pdfmake'
Type error: Property 'vfs' does not exist on type
```

#### Solutions

**1. Install missing type definitions**
```bash
npm install --save-dev @types/pdfmake
```

**2. Add type declarations**
```typescript
// types/pdfmake.d.ts
declare module 'pdfmake/build/pdfmake' {
  const pdfMake: any;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: any;
  export default vfs;
}
```

**3. Update tsconfig.json**
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "skipLibCheck": true,
    "types": ["node", "jest", "@types/pdfmake"]
  }
}
```

### Issue: Development Server Won't Start

#### Symptoms
```bash
Error: Port 3000 is already in use
EADDRINUSE: address already in use :::3000
```

#### Solutions

**1. Kill existing process**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use npx
npx kill-port 3000
```

**2. Use different port**
```bash
npm run dev -- --port 3001
```

**3. Set port in environment**
```bash
# .env.local
PORT=3001
```

### Issue: Hot Reload Not Working

#### Symptoms
- Changes don't appear in browser
- Need to manually refresh

#### Solutions

**1. Check file watching limits (Linux/macOS)**
```bash
# Increase file watching limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**2. Disable antivirus real-time scanning** (Windows)
- Exclude project directory from real-time scanning

**3. Use polling mode**
```bash
# Start with polling
npm run dev -- --experimental-watch-mode
```

**4. Clear Next.js cache**
```bash
rm -rf .next
npm run dev
```

## Build & Deploy Issues

### Issue: Build Fails with Memory Error

#### Symptoms
```bash
<--- Last few GCs --->
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

#### Solutions

**1. Increase Node.js memory limit**
```bash
# Temporary fix
node --max-old-space-size=4096 ./node_modules/.bin/next build

# Permanent fix in package.json
"scripts": {
  "build": "node --max-old-space-size=4096 ./node_modules/.bin/next build"
}
```

**2. Enable SWC minifier**
```javascript
// next.config.js
module.exports = {
  swcMinify: true,
  experimental: {
    craCompat: true,
  },
};
```

**3. Optimize bundle size**
```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

### Issue: Build Succeeds but Pages Don't Load

#### Symptoms
- Build completes successfully
- Browser shows 404 or blank pages
- Console errors about missing chunks

#### Solutions

**1. Check static export configuration**
```javascript
// next.config.js
module.exports = {
  output: 'standalone', // For Railway deployment
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

**2. Verify public path**
```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/your-app' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/your-app' : '',
};
```

**3. Check dynamic imports**
```typescript
// Make sure dynamic imports have proper fallbacks
const PDFGenerator = dynamic(
  () => import('./PDFGenerator'),
  { 
    ssr: false,
    loading: () => <div>Loading PDF generator...</div>
  }
);
```

### Issue: Railway Deployment Fails

#### Symptoms
```bash
Build failed: Command "npm run build" exited with code 1
Out of memory during build
```

#### Solutions

**1. Optimize Railway build**
```json
// package.json
{
  "scripts": {
    "railway:build": "npm ci --only=production && npm run build",
    "railway:start": "npm start"
  }
}
```

**2. Add railway.toml configuration**
```toml
[build]
  builder = "nixpacks"
  buildCommand = "npm run railway:build"

[deploy]
  startCommand = "npm run railway:start"
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3
```

**3. Reduce build dependencies**
```json
// package.json - move dev dependencies
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Runtime Issues

### Issue: 500 Internal Server Error

#### Symptoms
- API routes return 500 errors
- Server crashes with unhandled exceptions

#### Solutions

**1. Add error logging**
```typescript
// app/api/*/route.ts
export async function POST(request: Request) {
  try {
    // Your API logic
    return Response.json({ success: true });
  } catch (error) {
    console.error('[API Error]:', error);
    
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

**2. Add global error handler**
```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

**3. Check environment variables**
```typescript
// lib/env.ts
const requiredEnvVars = [
  'NODE_ENV',
  'OPENAI_API_KEY', // if using AI features
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Issue: Client-Side JavaScript Errors

#### Symptoms
- Browser console shows JavaScript errors
- Components not rendering properly
- Hydration mismatches

#### Solutions

**1. Fix hydration mismatches**
```typescript
// Use useEffect for client-only code
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) {
  return <div>Loading...</div>; // Server-side fallback
}

return <ClientOnlyComponent />;
```

**2. Add error boundaries**
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

**3. Handle async operations properly**
```typescript
// Use proper async/await error handling
const handleAction = async () => {
  try {
    setLoading(true);
    const result = await apiCall();
    setData(result);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

## PDF Generation Issues

### Issue: PDFs Not Generating

#### Symptoms
- PDF export button doesn't work
- Browser console shows PDF-related errors
- "PDF generation is only available in the browser" error

#### Solutions

**1. Check browser compatibility**
```typescript
// Check if running in browser
if (typeof window === 'undefined') {
  console.warn('PDF generation requires browser environment');
  return;
}

// Check for necessary APIs
if (!window.Blob || !window.URL) {
  console.warn('Browser does not support required APIs');
  return;
}
```

**2. Verify PDFMake imports**
```typescript
// Ensure proper dynamic imports
const generatePDF = async () => {
  try {
    const pdfMake = await import('pdfmake/build/pdfmake');
    const pdfFonts = await import('pdfmake/build/vfs_fonts');
    
    const pdfMakeInstance = pdfMake.default || pdfMake;
    const vfs = pdfFonts.default || pdfFonts;
    
    pdfMakeInstance.vfs = vfs.pdfMake?.vfs || vfs.vfs || vfs;
    
    return pdfMakeInstance;
  } catch (error) {
    console.error('Failed to load PDFMake:', error);
    throw new Error('PDF generation libraries not available');
  }
};
```

**3. Add fallback for server-side**
```typescript
// components/PDFExportButton.tsx
const PDFExportButton = ({ workbook }) => {
  const [canGeneratePDF, setCanGeneratePDF] = useState(false);
  
  useEffect(() => {
    setCanGeneratePDF(typeof window !== 'undefined');
  }, []);
  
  if (!canGeneratePDF) {
    return (
      <div className="text-gray-500">
        PDF export not available (requires browser)
      </div>
    );
  }
  
  return (
    <button onClick={handlePDFGeneration}>
      Export PDF
    </button>
  );
};
```

### Issue: PDF Generation Memory Errors

#### Symptoms
- Browser crashes during PDF generation
- "Out of memory" errors
- Very slow PDF generation

#### Solutions

**1. Optimize PDF content**
```typescript
// Limit content size
const optimizeForPDF = (workbook: Workbook): Workbook => {
  return {
    ...workbook,
    sections: workbook.sections.slice(0, 20), // Limit sections
    sections: workbook.sections.map(section => ({
      ...section,
      exercises: section.exercises.slice(0, 10), // Limit exercises
    })),
  };
};
```

**2. Implement chunked generation**
```typescript
// Generate PDF in chunks for large documents
const generatePDFInChunks = async (workbook: Workbook) => {
  const chunkSize = 5; // Process 5 sections at a time
  const chunks = [];
  
  for (let i = 0; i < workbook.sections.length; i += chunkSize) {
    const chunk = workbook.sections.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  
  // Process chunks with delays to prevent memory issues
  for (const chunk of chunks) {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Process chunk
  }
};
```

**3. Add progress indicators**
```typescript
const [generationProgress, setGenerationProgress] = useState(0);

const generatePDF = async () => {
  setGenerationProgress(10);
  
  const pdfMake = await loadPDFMake();
  setGenerationProgress(30);
  
  const docDefinition = createDocDefinition(workbook);
  setGenerationProgress(60);
  
  const blob = await generateBlob(docDefinition);
  setGenerationProgress(90);
  
  downloadPDF(blob);
  setGenerationProgress(100);
};
```

## AI Service Issues

### Issue: AI API Calls Failing

#### Symptoms
- "AI service unavailable" errors
- Timeout errors
- Authentication failures

#### Solutions

**1. Verify API keys**
```typescript
// Check API key format
const validateAPIKey = (key: string, provider: 'openai' | 'anthropic') => {
  if (provider === 'openai' && !key.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }
  
  if (provider === 'anthropic' && !key.startsWith('ant-')) {
    throw new Error('Invalid Anthropic API key format');
  }
  
  if (key.length < 20) {
    throw new Error('API key too short');
  }
};
```

**2. Add retry logic**
```typescript
// Implement exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

**3. Handle rate limiting**
```typescript
// Handle 429 responses
const handleAPICall = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return handleAPICall(url, options); // Retry
  }
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
```

### Issue: AI Generated Content Quality

#### Symptoms
- Irrelevant or low-quality content
- Inconsistent formatting
- Missing sections

#### Solutions

**1. Improve prompts**
```typescript
const createPrompt = (topic: string, gradeLevel: string) => {
  return `Create educational content for ${gradeLevel} students about ${topic}.

Requirements:
- Use age-appropriate language for ${gradeLevel} level
- Include clear explanations with examples
- Create 5-10 practice exercises
- Provide detailed answer explanations
- Use proper educational formatting

Structure:
1. Concept explanation (2-3 paragraphs)
2. Examples (3-5 examples)
3. Practice exercises (5-10 questions)
4. Answer key with explanations

Topic: ${topic}
Grade Level: ${gradeLevel}`;
};
```

**2. Add content validation**
```typescript
const validateAIContent = (content: any): boolean => {
  // Check required fields
  if (!content.title || !content.sections) {
    return false;
  }
  
  // Check section count
  if (content.sections.length < 2) {
    return false;
  }
  
  // Check exercise count
  const totalExercises = content.sections.reduce((count, section) => 
    count + (section.exercises?.length || 0), 0
  );
  
  if (totalExercises < 5) {
    return false;
  }
  
  return true;
};
```

**3. Post-process AI content**
```typescript
const postProcessContent = (content: any): Workbook => {
  return {
    ...content,
    title: content.title.trim(),
    sections: content.sections.map((section, index) => ({
      ...section,
      id: `section_${index + 1}`,
      order: index + 1,
      exercises: section.exercises?.map((exercise, exerciseIndex) => ({
        ...exercise,
        id: `exercise_${index + 1}_${exerciseIndex + 1}`,
      })) || [],
    })),
  };
};
```

## Performance Issues

### Issue: Slow Page Loading

#### Symptoms
- Long initial page load times
- Slow navigation between pages
- High bundle sizes

#### Solutions

**1. Implement code splitting**
```typescript
// Use dynamic imports for heavy components
const WorkbookEditor = dynamic(
  () => import('./WorkbookEditor'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
);

const PDFGenerator = dynamic(
  () => import('./PDFGenerator'),
  { 
    loading: () => <div>Loading PDF generator...</div>,
    ssr: false 
  }
);
```

**2. Optimize images**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/workbook-preview.jpg"
  alt="Workbook preview"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**3. Add performance monitoring**
```typescript
// Monitor Core Web Vitals
export function reportWebVitals(metric) {
  switch (metric.name) {
    case 'CLS':
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      console.log(metric);
      break;
    default:
      break;
  }
}
```

### Issue: Memory Leaks

#### Symptoms
- Browser becomes slow over time
- High memory usage in dev tools
- Tab crashes

#### Solutions

**1. Clean up event listeners**
```typescript
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

**2. Cancel async operations**
```typescript
useEffect(() => {
  let cancelled = false;
  
  const fetchData = async () => {
    try {
      const data = await apiCall();
      if (!cancelled) {
        setData(data);
      }
    } catch (error) {
      if (!cancelled) {
        setError(error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    cancelled = true;
  };
}, []);
```

**3. Use AbortController for fetch**
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setData(data))
    .catch(error => {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    });
  
  return () => {
    controller.abort();
  };
}, []);
```

## Railway-Specific Issues

### Issue: Environment Variables Not Working

#### Symptoms
- `undefined` values for environment variables
- Features not working in production

#### Solutions

**1. Check Railway environment settings**
```bash
# Using Railway CLI
railway variables list

# Set variables
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=sk-...
```

**2. Verify environment variable access**
```typescript
// Check in your code
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
```

**3. Use Railway environment specific configs**
```typescript
// lib/config.ts
const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate config
Object.entries(config).forEach(([key, value]) => {
  if (value === undefined) {
    console.warn(`Config value '${key}' is undefined`);
  }
});

export default config;
```

### Issue: Railway Build Timeouts

#### Symptoms
- Builds taking longer than 10 minutes
- Build process killed

#### Solutions

**1. Optimize build process**
```json
// package.json
{
  "scripts": {
    "build": "npm ci --only=production && next build",
    "postinstall": "echo 'Build optimized for Railway'"
  }
}
```

**2. Reduce dependencies**
```bash
# Remove unnecessary dev dependencies from production
npm install --production

# Use .npmrc to speed up installs
echo "progress=false" > .npmrc
echo "audit=false" >> .npmrc
```

**3. Use Docker for consistent builds**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

## Getting Help

### Debug Information Collection

When reporting issues, include:

```bash
# System information
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -a)"

# Project information
echo "Next.js: $(npm list next --depth=0)"
echo "TypeScript: $(npm list typescript --depth=0)"

# Build information
npm run build 2>&1 | head -20

# Error logs
npm run dev 2>&1 | grep -i error
```

### Useful Resources

1. **Project Repository**: [GitHub Issues](https://github.com/TheAccidentalTeacher/WorkbookCreator/issues)
2. **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
3. **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
4. **PDFMake Documentation**: [pdfmake.github.io](http://pdfmake.github.io/docs/)

### Creating Bug Reports

Use this template:

```markdown
## Bug Report

### Environment
- Node.js version:
- npm version:
- Operating System:
- Browser (if applicable):

### Expected Behavior
[What you expected to happen]

### Actual Behavior
[What actually happened]

### Steps to Reproduce
1. 
2. 
3. 

### Error Messages
```
[Paste error messages here]
```

### Additional Context
[Any other relevant information]
```

## Conclusion

This troubleshooting guide covers the most common issues you might encounter. If you're still experiencing problems after trying these solutions:

1. Check the project's GitHub issues for similar problems
2. Create a new issue with detailed information
3. Join the community discussions
4. Consult the official documentation for the specific technologies involved

Remember that many issues can be resolved by clearing caches, updating dependencies, or checking environment configurations. When in doubt, start with the quick diagnostics section before diving into specific solutions.