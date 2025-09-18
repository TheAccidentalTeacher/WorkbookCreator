# 👨‍💻 Development Guide

## Overview

This guide provides comprehensive instructions for setting up, developing, and contributing to the Pedagogical Workbook Generator. Whether you're a new contributor or an experienced developer, this document will help you get up and running quickly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Development Workflow](#development-workflow)
4. [Code Organization](#code-organization)
5. [Testing Strategy](#testing-strategy)
6. [Debugging](#debugging)
7. [Performance Optimization](#performance-optimization)
8. [Best Practices](#best-practices)

## Prerequisites

### System Requirements

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions

### Required VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Optional but Recommended

- **GitHub CLI**: For enhanced Git workflows
- **Docker**: If you plan to use containerized development
- **Railway CLI**: For deployment management

## Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/TheAccidentalTeacher/WorkbookCreator.git
cd WorkbookCreator

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your configuration
# Use your preferred editor
code .env.local
```

#### Environment Variables

```bash
# .env.local
# Core Application
NODE_ENV=development
PORT=3000

# AI Services (Optional for development)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=ant-your-anthropic-key-here

# Database (Optional for local development)
DATABASE_URL=postgresql://username:password@localhost:5432/workbook_generator

# Development Only
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. IDE Configuration

#### VS Code Settings

```json
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