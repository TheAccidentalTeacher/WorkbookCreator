# 👨‍💻 Development Guide

## Overview

This guide provides comprehensive instructions for setting up, developing, and contributing to the Pedagogical Workbook Generator. Whether you're a new contributor or an experienced developer, this document will help you get up and running quickly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Development Workflow](#development-workflow)
4. [Code Organization](#code-organization)
5. [Phase 2 Development](#phase-2-development)
6. [Testing Strategy](#testing-strategy)
7. [Debugging](#debugging)
8. [Performance Optimization](#performance-optimization)
9. [Contributing Guidelines](#contributing-guidelines)
10. [Best Practices](#best-practices)

## Prerequisites

### System Requirements

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions

### Required VS Code Extensions

```json
// .vscode/extensions.json (create this file)
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "prisma.prisma"
  ]
}
```

### Optional but Recommended

- **GitHub CLI**: For enhanced Git workflows
- **Docker**: If you plan to use containerized development
- **Railway CLI**: For deployment management
- **Google Cloud SDK**: For Vertex AI development

## Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/TheAccidentalTeacher/WorkbookCreator.git
cd pedagogical-workbook-generator

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your configuration
code .env.local
```

#### Environment Variables

```bash
# .env.local - Development Configuration

# === Core Application ===
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production

# === Database (PostgreSQL) ===
# Option 1: Local PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/workbook_generator

# Option 2: Railway Development Database
DATABASE_URL=postgresql://postgres:password@host:port/railway

# === Phase 1 AI Services ===
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=ant-your-anthropic-key-here

# === Phase 2 AI Services ===
GOOGLE_VERTEX_AI_PROJECT_ID=your-google-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Optional Phase 2 Services
SYMBOLAB_API_KEY=your-symbolab-key

# === Educational Image APIs ===
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
PEXELS_API_KEY=your-pexels-api-key
PIXABAY_API_KEY=your-pixabay-api-key

# === Development Settings ===
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb workbook_generator

# Set up schema
npx prisma db push
```

#### Option B: Railway Database (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect to project
railway login
railway link [project-id]

# Get database URL
railway variables

# Copy DATABASE_URL to .env.local
```

### 4. Google Cloud Setup (Phase 2)

```bash
# Install Google Cloud SDK
# Follow instructions at: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project your-project-id

# Download service account key
# (Follow Phase 2 API Setup Guide)
```

### 5. IDE Configuration

#### VS Code Settings

```json
// .vscode/settings.json (create this file)
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Development Workflow

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# Server will start at http://localhost:3000
# Hot reload is enabled for all file changes
```

### 2. Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Database operations
npx prisma studio      # Database GUI
npx prisma db push     # Push schema changes
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Create and apply migration

# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### 3. Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/new-feature-name

# Create pull request via GitHub UI
```

#### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>[optional scope]: <description>

# Examples
feat(ui): add new workbook creation form
fix(api): resolve PDF generation timeout
docs: update API documentation
test(phase2): add Vertex AI integration tests
refactor(services): optimize content validation
style: format code with prettier
```

## Code Organization

### Project Structure

```
pedagogical-workbook-generator/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── test-phase2/   # Phase 2 testing endpoint
│   │   │   └── generate/      # Main generation endpoint
│   │   ├── phase2-testing/    # Phase 2 testing page
│   │   └── generate/          # Main generation page
│   ├── components/            # React components
│   │   ├── Phase2Testing.tsx  # Phase 2 testing interface
│   │   ├── Phase2Dashboard.tsx # Phase 2 dashboard
│   │   └── GenerationProgress.tsx # Progress tracking
│   ├── services/              # Business logic
│   │   ├── ai/               # AI service integrations
│   │   │   ├── BaseAPIService.ts
│   │   │   ├── VertexAIService.ts
│   │   │   └── SymbolabMathService.ts
│   │   ├── APICoordinatorServiceEnhanced.ts
│   │   └── ContentValidationService.ts
│   ├── lib/                   # Utility libraries
│   │   ├── prisma.ts         # Database client
│   │   └── utils.ts          # Helper functions
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema
├── docs/                      # Documentation
├── public/                    # Static assets
└── tests/                     # Test files
```

### Architecture Patterns

#### 1. Service Layer Pattern

```typescript
// src/services/ai/BaseAPIService.ts
export abstract class BaseAPIService {
  protected apiKey: string;
  protected baseUrl: string;
  
  abstract generateContent(request: ContentRequest): Promise<ContentResponse>;
  abstract healthCheck(): Promise<HealthStatus>;
}

// Concrete implementation
export class VertexAIService extends BaseAPIService {
  async generateContent(request: ContentRequest): Promise<ContentResponse> {
    // Implementation
  }
}
```

#### 2. Repository Pattern (Database)

```typescript
// src/lib/repositories/WorkbookRepository.ts
export class WorkbookRepository {
  async create(data: CreateWorkbookData): Promise<Workbook> {
    return prisma.workbook.create({ data });
  }
  
  async findById(id: string): Promise<Workbook | null> {
    return prisma.workbook.findUnique({ where: { id } });
  }
}
```

#### 3. Factory Pattern (AI Services)

```typescript
// src/services/ai/AIServiceFactory.ts
export class AIServiceFactory {
  static createService(provider: AIProvider): BaseAPIService {
    switch (provider) {
      case 'vertex':
        return new VertexAIService();
      case 'openai':
        return new OpenAIService();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
```

## Phase 2 Development

### AI Service Integration

#### 1. Adding New AI Service

```typescript
// 1. Create service class
// src/services/ai/NewAIService.ts
export class NewAIService extends BaseAPIService {
  constructor() {
    super({
      apiKey: process.env.NEW_AI_API_KEY!,
      baseUrl: 'https://api.newai.com'
    });
  }
  
  async generateContent(request: ContentRequest): Promise<ContentResponse> {
    // Implementation
  }
  
  async healthCheck(): Promise<HealthStatus> {
    // Implementation
  }
}

// 2. Register in coordinator
// src/services/APICoordinatorServiceEnhanced.ts
private initializeServices() {
  this.services.set('newai', new NewAIService());
}

// 3. Add to testing framework
// src/services/Phase2TestingFramework.ts
private async testNewAIService(): Promise<TestResult> {
  // Implementation
}
```

#### 2. Content Validation Rules

```typescript
// src/services/ContentValidationService.ts
export class ContentValidationService {
  validateEducationalContent(content: string, criteria: ValidationCriteria): ValidationResult {
    return {
      educationalValue: this.scoreEducationalValue(content),
      ageAppropriate: this.checkAgeAppropriateness(content, criteria.gradeLevel),
      contentQuality: this.scoreContentQuality(content),
      safetyCheck: this.performSafetyCheck(content)
    };
  }
}
```

### Testing Integration

```typescript
// src/components/Phase2Testing.tsx
const testAIIntegration = async () => {
  try {
    const response = await fetch('/api/test-phase2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'mathematics',
        gradeLevel: 'elementary',
        topic: 'fractions'
      })
    });
    
    const result = await response.json();
    setTestResults(result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};
```

## Testing Strategy

### Test Structure

```
tests/
├── __mocks__/           # Mock implementations
├── api/                 # API endpoint tests
├── components/          # Component tests
├── services/            # Service layer tests
├── integration/         # Integration tests
└── e2e/                # End-to-end tests
```

### Unit Testing

```typescript
// tests/services/VertexAIService.test.ts
import { VertexAIService } from '@/services/ai/VertexAIService';

describe('VertexAIService', () => {
  let service: VertexAIService;
  
  beforeEach(() => {
    service = new VertexAIService();
  });
  
  test('should generate educational content', async () => {
    const request = {
      subject: 'mathematics',
      gradeLevel: 'elementary',
      topic: 'fractions'
    };
    
    const response = await service.generateContent(request);
    
    expect(response.content).toBeDefined();
    expect(response.metadata.source).toBe('vertex-ai');
  });
});
```

### Integration Testing

```typescript
// tests/integration/Phase2Integration.test.ts
describe('Phase 2 Integration', () => {
  test('should coordinate multiple AI services', async () => {
    const coordinator = new APICoordinatorServiceEnhanced();
    
    const result = await coordinator.generateContent({
      type: 'comprehensive',
      subject: 'science',
      gradeLevel: 'middle'
    });
    
    expect(result.sections).toHaveLength(3);
    expect(result.validation.educationalValue).toBeGreaterThan(0.7);
  });
});
```

### Component Testing

```typescript
// tests/components/Phase2Testing.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Phase2Testing } from '@/components/Phase2Testing';

describe('Phase2Testing Component', () => {
  test('should display service status', () => {
    render(<Phase2Testing />);
    
    expect(screen.getByText('Vertex AI')).toBeInTheDocument();
    expect(screen.getByText('Symbolab Math')).toBeInTheDocument();
  });
  
  test('should run health check', async () => {
    render(<Phase2Testing />);
    
    fireEvent.click(screen.getByText('Run Health Check'));
    
    await screen.findByText('Health check completed');
  });
});
```

## Debugging

### Development Tools

#### 1. Browser DevTools

```typescript
// Add debugging helpers
if (process.env.NODE_ENV === 'development') {
  // Expose services to window for debugging
  (window as any).debugServices = {
    vertexAI: new VertexAIService(),
    coordinator: new APICoordinatorServiceEnhanced()
  };
}
```

#### 2. Server-Side Debugging

```typescript
// src/lib/debug.ts
export const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Usage in services
debugLog('Generating content with Vertex AI', { request });
```

#### 3. Database Debugging

```bash
# View database with Prisma Studio
npx prisma studio

# Check database logs
railway logs --service database
```

### Common Issues & Solutions

#### 1. Environment Variable Issues

```typescript
// src/lib/validateEnv.ts
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'OPENAI_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
```

#### 2. API Key Validation

```typescript
// Test API keys during development
const validateAPIKeys = async () => {
  try {
    // Test OpenAI
    await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    
    // Test Vertex AI
    const vertexService = new VertexAIService();
    await vertexService.healthCheck();
    
    console.log('All API keys validated successfully');
  } catch (error) {
    console.error('API key validation failed:', error);
  }
};
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const Phase2Testing = dynamic(() => import('@/components/Phase2Testing'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### 2. API Response Caching

```typescript
// src/lib/cache.ts
const cache = new Map();

export function getCachedResponse(key: string, ttl: number) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
}
```

### 3. Database Optimization

```typescript
// Optimize Prisma queries
const workbooks = await prisma.workbook.findMany({
  select: {
    id: true,
    title: true,
    createdAt: true
  },
  take: 10,
  orderBy: { createdAt: 'desc' }
});
```

## Contributing Guidelines

### 1. Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow project ESLint configuration
- **Prettier**: Auto-format on save
- **Naming**: Use descriptive, camelCase names

### 2. Pull Request Process

1. **Fork & Branch**: Create feature branch from `main`
2. **Develop**: Implement feature with tests
3. **Test**: Ensure all tests pass
4. **Document**: Update relevant documentation
5. **PR**: Create pull request with description
6. **Review**: Address review feedback
7. **Merge**: Squash and merge when approved

### 3. Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Environment variables are documented
- [ ] Error handling is comprehensive
- [ ] Performance impact is considered

## Best Practices

### 1. TypeScript

```typescript
// Use strict types
interface ContentRequest {
  subject: Subject;
  gradeLevel: GradeLevel;
  topic: string;
  difficulty: Difficulty;
}

// Avoid 'any' type
const processContent = (content: unknown): ProcessedContent => {
  if (typeof content === 'string') {
    // Type-safe processing
  }
  throw new Error('Invalid content type');
};
```

### 2. Error Handling

```typescript
// Comprehensive error handling
export class APIError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
  }
}

// Usage
try {
  const result = await aiService.generateContent(request);
  return result;
} catch (error) {
  if (error instanceof APIError) {
    // Handle API errors
  } else {
    // Handle unexpected errors
    throw new APIError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
```

### 3. Environment Management

```typescript
// Type-safe environment variables
const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4'
  },
  vertex: {
    projectId: process.env.GOOGLE_VERTEX_AI_PROJECT_ID!,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS!
  }
} as const;
```

### 4. Component Design

```typescript
// Props interface
interface WorkbookFormProps {
  onSubmit: (data: WorkbookData) => void;
  initialData?: Partial<WorkbookData>;
  loading?: boolean;
}

// Component with proper TypeScript
export const WorkbookForm: React.FC<WorkbookFormProps> = ({
  onSubmit,
  initialData,
  loading = false
}) => {
  // Implementation
};
```

### 5. API Design

```typescript
// Consistent API response format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}
```

## Useful Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### AI Services
- [Google Vertex AI](https://cloud.google.com/vertex-ai/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude](https://docs.anthropic.com)

### Tools
- [Railway Documentation](https://docs.railway.app)
- [VS Code Extensions](https://marketplace.visualstudio.com/vscode)
- [GitHub CLI](https://cli.github.com)

---

Happy coding! 🚀 If you have questions, check the existing documentation or open an issue in the repository.
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# Server will start at http://localhost:3000
# API routes available at http://localhost:3000/api/*
```

### 5. Verify Setup

Visit these URLs to verify everything is working:

- **App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **AI Test** (if API keys configured): Create a test workbook

## Development Workflow

### Daily Development Cycle

```bash
# 1. Start your day
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development
npm run dev

# 4. Make changes, test, commit
git add .
git commit -m "feat: add new feature"

# 5. Push and create PR
git push origin feature/your-feature-name
```

### Available Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",           // Development server with Turbopack
    "build": "next build",              // Production build
    "start": "next start",              // Production server
    "lint": "next lint",                // ESLint checking
    "lint:fix": "next lint --fix",      // Auto-fix ESLint issues
    "type-check": "tsc --noEmit",       // TypeScript checking
    "test": "jest",                     // Run tests
    "test:watch": "jest --watch",       // Watch mode testing
    "test:coverage": "jest --coverage", // Coverage report
    "format": "prettier --write .",     // Format all files
    "clean": "rm -rf .next out",        // Clean build artifacts
    "analyze": "ANALYZE=true npm run build" // Bundle analysis
  }
}
```

### Git Workflow

#### Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/ai-content-generation
git checkout -b feature/pdf-export-improvements

# Bug fixes
git checkout -b fix/pdf-generation-memory-leak
git checkout -b fix/ai-service-timeout

# Documentation
git checkout -b docs/api-documentation
git checkout -b docs/development-guide

# Chores/maintenance
git checkout -b chore/update-dependencies
git checkout -b chore/improve-error-handling
```

#### Commit Message Format

```bash
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore

# Examples
git commit -m "feat(ai): add support for Anthropic Claude"
git commit -m "fix(pdf): resolve memory leak in large documents"
git commit -m "docs(api): add comprehensive endpoint documentation"
git commit -m "refactor(components): improve WorkbookViewer performance"
git commit -m "test(services): add unit tests for AI service"
git commit -m "chore(deps): update Next.js to 15.5.3"
```

### Pre-commit Hooks

```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup hooks
npx husky init
echo "npm run lint && npm run type-check" > .husky/pre-commit
echo "npm test" > .husky/pre-push
```

## Code Organization

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Route groups
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── lib/                 # Utility libraries
│   ├── utils.ts         # General utilities
│   ├── constants.ts     # Application constants
│   └── validators.ts    # Validation schemas
├── services/            # Business logic services
│   ├── aiService.ts     # AI integration
│   ├── workbookService.ts # Workbook operations
│   └── simplePdfGenerator.ts # PDF generation
├── types/               # TypeScript type definitions
│   ├── workbook.ts      # Workbook-related types
│   ├── ai.ts           # AI service types
│   └── api.ts          # API response types
├── hooks/               # Custom React hooks
│   ├── useWorkbook.ts   # Workbook state management
│   ├── useAI.ts        # AI generation hooks
│   └── usePDF.ts       # PDF export hooks
└── styles/              # Additional styles
    └── components.css   # Component-specific styles
```

### Component Architecture

#### Component Naming Convention

```typescript
// Use PascalCase for components
export const WorkbookViewer = () => { /* ... */ };
export const AIContentGenerator = () => { /* ... */ };
export const PDFExportButton = () => { /* ... */ };

// Use camelCase for utilities and services
export const generateWorkbookPDF = () => { /* ... */ };
export const aiService = { /* ... */ };
```

#### Component Structure

```typescript
// components/features/WorkbookViewer.tsx
import { useState, useCallback } from 'react';
import type { Workbook } from '@/types/workbook';

interface WorkbookViewerProps {
  workbook: Workbook;
  onUpdate: (workbook: Workbook) => void;
  onError: (error: Error) => void;
}

export const WorkbookViewer = ({ 
  workbook, 
  onUpdate, 
  onError 
}: WorkbookViewerProps) => {
  // 1. State
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. Callbacks
  const handleSectionUpdate = useCallback((sectionId: string, data: any) => {
    try {
      const updatedWorkbook = updateWorkbookSection(workbook, sectionId, data);
      onUpdate(updatedWorkbook);
    } catch (error) {
      onError(error as Error);
    }
  }, [workbook, onUpdate, onError]);
  
  // 3. Event handlers
  const handleEditToggle = () => setIsEditing(!isEditing);
  
  // 4. Render
  return (
    <div className="workbook-viewer">
      {/* Component JSX */}
    </div>
  );
};
```

### Service Architecture

```typescript
// services/baseService.ts
export abstract class BaseService {
  protected abstract serviceName: string;
  
  protected handleError(error: unknown): never {
    console.error(`[${this.serviceName}] Error:`, error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(`${this.serviceName} operation failed`);
  }
  
  protected validateInput<T>(data: T, validator: (data: T) => boolean): T {
    if (!validator(data)) {
      throw new Error('Invalid input data');
    }
    return data;
  }
}

// services/workbookService.ts
export class WorkbookService extends BaseService {
  protected serviceName = 'WorkbookService';
  
  async createWorkbook(data: CreateWorkbookData): Promise<Workbook> {
    try {
      this.validateInput(data, this.isValidWorkbookData);
      
      const workbook = await this.processWorkbookData(data);
      return this.saveWorkbook(workbook);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  private isValidWorkbookData(data: CreateWorkbookData): boolean {
    return !!(data.title && data.sections && data.sections.length > 0);
  }
}
```

### Type Definitions

```typescript
// types/workbook.ts
export interface Workbook {
  id: string;
  title: string;
  description: string;
  metadata: WorkbookMetadata;
  learningObjectives: LearningObjective[];
  sections: Section[];
  answerKey: AnswerKeyItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkbookMetadata {
  gradeLevel: GradeLevel;
  subject: Subject;
  duration: string;
  difficulty: Difficulty;
  estimatedTime: number;
}

export type GradeLevel = 'elementary' | 'middle' | 'high';
export type Subject = 'mathematics' | 'science' | 'english' | 'history' | 'other';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// types/api.ts
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## Testing Strategy

### Testing Setup

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-environment-jsdom
```

#### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Testing Patterns

#### Component Testing

```typescript
// __tests__/components/WorkbookViewer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkbookViewer } from '@/components/features/WorkbookViewer';
import { mockWorkbook } from '@/test-utils/mocks';

describe('WorkbookViewer', () => {
  const defaultProps = {
    workbook: mockWorkbook,
    onUpdate: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workbook title correctly', () => {
    render(<WorkbookViewer {...defaultProps} />);
    
    expect(screen.getByText(mockWorkbook.title)).toBeInTheDocument();
  });

  it('calls onUpdate when section is modified', async () => {
    const user = userEvent.setup();
    render(<WorkbookViewer {...defaultProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    const titleInput = screen.getByLabelText(/section title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'New Section Title');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({
              title: 'New Section Title'
            })
          ])
        })
      );
    });
  });

  it('handles errors gracefully', async () => {
    const errorProps = {
      ...defaultProps,
      onUpdate: jest.fn().mockImplementation(() => {
        throw new Error('Update failed');
      }),
    };
    
    render(<WorkbookViewer {...errorProps} />);
    
    // Trigger error
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
    
    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(
        expect.any(Error)
      );
    });
  });
});
```

#### Service Testing

```typescript
// __tests__/services/aiService.test.ts
import { AIService } from '@/services/aiService';
import { mockOpenAIResponse } from '@/test-utils/mocks';

// Mock fetch
global.fetch = jest.fn();

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateWorkbook', () => {
    it('generates workbook successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOpenAIResponse),
      });

      const service = new AIService();
      const result = await service.generateWorkbook({
        topic: 'Fractions',
        gradeLevel: 'elementary',
        provider: 'openai',
      });

      expect(result).toEqual(expect.objectContaining({
        title: expect.stringContaining('Fractions'),
        sections: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            conceptExplanation: expect.any(String),
          })
        ])
      }));
    });

    it('handles API errors correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const service = new AIService();
      
      await expect(
        service.generateWorkbook({
          topic: 'Fractions',
          gradeLevel: 'elementary',
          provider: 'openai',
        })
      ).rejects.toThrow('AI service error');
    });
  });
});
```

#### API Route Testing

```typescript
// __tests__/api/workbooks.test.ts
import { POST } from '@/app/api/workbooks/route';
import { NextRequest } from 'next/server';

describe('/api/workbooks', () => {
  it('creates workbook successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/workbooks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Workbook',
        description: 'Test description',
        sections: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.workbook).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: 'Test Workbook',
      })
    );
  });

  it('validates required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/workbooks', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Test Utilities

```typescript
// test-utils/mocks.ts
export const mockWorkbook: Workbook = {
  id: 'wb_123',
  title: 'Test Workbook',
  description: 'A test workbook',
  metadata: {
    gradeLevel: 'elementary',
    subject: 'mathematics',
    duration: '1 week',
    difficulty: 'beginner',
    estimatedTime: 60,
  },
  learningObjectives: [
    {
      id: 'lo_1',
      text: 'Understand basic concepts',
      level: 'knowledge',
      bloomsTaxonomy: 'Remember',
    },
  ],
  sections: [
    {
      id: 'sec_1',
      title: 'Introduction',
      conceptExplanation: 'Basic concepts explained',
      examples: [],
      exercises: [],
      resources: [],
      order: 1,
    },
  ],
  answerKey: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// test-utils/providers.tsx
export const TestProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
};

// test-utils/custom-render.tsx
import { render } from '@testing-library/react';
import { TestProviders } from './providers';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestProviders });
};
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test WorkbookViewer

# Run tests for specific pattern
npm test -- --testPathPattern=components

# Run tests with verbose output
npm test -- --verbose
```

## Debugging

### Development Tools

#### Next.js DevTools

```typescript
// next.config.js
module.exports = {
  experimental: {
    // Enable React DevTools profiler
    reactDevtools: true,
  },
  
  // Enable source maps in development
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },
};
```

#### Browser DevTools Setup

1. **React Developer Tools**: Essential for component debugging
2. **Redux DevTools**: For state management debugging
3. **Network Tab**: Monitor API calls and responses
4. **Performance Tab**: Profile component rendering
5. **Memory Tab**: Detect memory leaks

### Debugging Techniques

#### Console Debugging

```typescript
// Use structured logging
const debugLog = (category: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[${category}] ${new Date().toISOString()}`);
    console.log(data);
    console.trace();
    console.groupEnd();
  }
};

// Usage in components
export const WorkbookViewer = ({ workbook }: Props) => {
  debugLog('WorkbookViewer', { workbook, propsReceived: true });
  
  const handleUpdate = (data: any) => {
    debugLog('WorkbookViewer:Update', { data, timestamp: Date.now() });
    // ... update logic
  };
};
```

#### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // reportError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Debugging

```typescript
// lib/api-client.ts
export const apiClient = {
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const startTime = Date.now();
    
    console.log(`[API] ${options.method || 'GET'} ${url}`, {
      headers: options.headers,
      body: options.body,
    });
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        const error = await response.json();
        console.error(`[API] Error ${response.status} in ${duration}ms:`, error);
        throw new Error(error.message || 'API request failed');
      }
      
      const data = await response.json();
      console.log(`[API] Success in ${duration}ms:`, data);
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[API] Failed in ${duration}ms:`, error);
      throw error;
    }
  },
};
```

### VS Code Debugging

#### Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "env": {
        "NODE_OPTIONS": "--inspect"
      },
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Debugging with Breakpoints

```typescript
// Set breakpoints in VS Code and use debugger statement
export const generateWorkbook = async (data: WorkbookData) => {
  debugger; // Execution will pause here when debugging
  
  const validationResult = validateWorkbookData(data);
  
  if (!validationResult.isValid) {
    debugger; // Conditional breakpoint
    throw new Error('Invalid workbook data');
  }
  
  return processWorkbook(data);
};
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Bundle analyzer will open in browser
# Look for:
# - Large dependencies
# - Duplicate modules
# - Unused code
```

### Performance Monitoring

```typescript
// hooks/usePerformance.ts
export const usePerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame
        console.warn(`[Performance] ${componentName} took ${renderTime}ms to render`);
      }
    };
  });
};

// Usage in components
export const WorkbookViewer = () => {
  usePerformance('WorkbookViewer');
  // ... component logic
};
```

### Optimization Techniques

#### Lazy Loading

```typescript
// Lazy load heavy components
const PDFViewer = lazy(() => import('./PDFViewer'));
const AIGenerator = lazy(() => import('./AIGenerator'));

export const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/pdf" element={<PDFViewer />} />
        <Route path="/generate" element={<AIGenerator />} />
      </Routes>
    </Suspense>
  );
};
```

#### Memoization

```typescript
// Memoize expensive computations
export const WorkbookViewer = ({ workbook }: Props) => {
  const processedSections = useMemo(() => {
    return workbook.sections.map(section => ({
      ...section,
      exerciseCount: section.exercises.length,
      estimatedTime: calculateEstimatedTime(section),
    }));
  }, [workbook.sections]);
  
  const handleSectionUpdate = useCallback((id: string, data: any) => {
    // Update logic
  }, []);
  
  return (
    <div>
      {processedSections.map(section => (
        <Section 
          key={section.id}
          data={section}
          onUpdate={handleSectionUpdate}
        />
      ))}
    </div>
  );
};
```

#### Virtual Scrolling

```typescript
// For large lists
import { FixedSizeList as List } from 'react-window';

export const WorkbookList = ({ workbooks }: Props) => {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <WorkbookCard workbook={workbooks[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={workbooks.length}
      itemSize={120}
    >
      {Row}
    </List>
  );
};
```

## Best Practices

### Code Quality

#### TypeScript Best Practices

```typescript
// Use strict TypeScript configuration
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}

// Define interfaces clearly
interface WorkbookViewerProps {
  workbook: Workbook;
  readonly?: boolean;
  onUpdate?: (workbook: Workbook) => void;
  onError?: (error: Error) => void;
}

// Use type guards
function isWorkbook(obj: any): obj is Workbook {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}

// Use generic types
function createApiClient<T>(): ApiClient<T> {
  return new ApiClient<T>();
}
```

#### React Best Practices

```typescript
// Use functional components with hooks
export const WorkbookViewer: React.FC<WorkbookViewerProps> = ({ 
  workbook, 
  onUpdate 
}) => {
  // Use meaningful state names
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Extract custom hooks
  const { generatePDF, isGenerating } = usePDFGeneration();
  const { saveWorkbook, isSaving } = useWorkbookPersistence();
  
  // Use useCallback for event handlers
  const handleSave = useCallback(async () => {
    try {
      await saveWorkbook(workbook);
      setIsEditing(false);
    } catch (error) {
      setValidationErrors([error.message]);
    }
  }, [workbook, saveWorkbook]);
  
  // Early return for loading states
  if (!workbook) {
    return <WorkbookSkeleton />;
  }
  
  return (
    <div className="workbook-viewer">
      {/* Component JSX */}
    </div>
  );
};
```

#### CSS/Styling Best Practices

```typescript
// Use Tailwind classes effectively
const buttonStyles = {
  base: 'px-4 py-2 rounded-md font-medium transition-colors',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

// Create utility functions for styles
const getButtonClasses = (variant: 'primary' | 'secondary' | 'danger') => {
  return `${buttonStyles.base} ${buttonStyles[variant]}`;
};

// Use CSS-in-JS for complex styles
const StyledWorkbook = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
```

### Performance Best Practices

1. **Minimize re-renders** with React.memo and useMemo
2. **Lazy load** heavy components and libraries
3. **Optimize images** with next/image
4. **Use proper loading states** to improve perceived performance
5. **Implement error boundaries** for graceful error handling
6. **Profile regularly** using React DevTools Profiler

### Security Best Practices

```typescript
// Validate all inputs
import { z } from 'zod';

const workbookSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  sections: z.array(sectionSchema).max(20),
});

// Sanitize user content
import DOMPurify from 'dompurify';

const sanitizeContent = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
};

// Use environment variables for secrets
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required');
}
```

### Accessibility Best Practices

```typescript
// Use semantic HTML
return (
  <article className="workbook">
    <header>
      <h1>{workbook.title}</h1>
    </header>
    <main>
      <nav aria-label="Workbook sections">
        <ol>
          {sections.map(section => (
            <li key={section.id}>
              <a href={`#section-${section.id}`}>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="content">
        {sections.map(section => (
          <section 
            key={section.id}
            id={`section-${section.id}`}
            aria-labelledby={`heading-${section.id}`}
          >
            <h2 id={`heading-${section.id}`}>
              {section.title}
            </h2>
            {/* Section content */}
          </section>
        ))}
      </div>
    </main>
  </article>
);

// Provide proper ARIA labels
<button
  aria-label={`Export ${workbook.title} as PDF`}
  onClick={handleExport}
>
  Export PDF
</button>
```

## Conclusion

This development guide provides a comprehensive foundation for contributing to the Pedagogical Workbook Generator. Following these practices ensures code quality, maintainability, and a great developer experience.

Remember to:
- Write tests for new features
- Follow the established patterns
- Keep performance in mind
- Prioritize accessibility
- Document complex logic
- Use TypeScript effectively

For questions or clarifications, refer to the project's issue tracker or reach out to the development team.