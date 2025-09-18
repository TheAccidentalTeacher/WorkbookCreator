# 🔌 API Documentation

## Overview

The Pedagogical Workbook Generator provides a RESTful API for workbook generation, AI content creation, and PDF export functionality. This document covers all available endpoints, request/response formats, and integration examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URLs](#base-urls)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)
8. [SDKs and Libraries](#sdks-and-libraries)

## Authentication

### API Key Authentication

For AI services integration:

```bash
# Environment Variables
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=ant-...
```

### Request Headers

```http
Content-Type: application/json
Accept: application/json
X-API-Version: v1
```

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://your-app.railway.app/api` |
| Staging | `https://staging-your-app.railway.app/api` |
| Development | `http://localhost:3000/api` |

## API Endpoints

### Health Check

#### GET /api/health

Check API availability and status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 35651584,
    "heapUsed": 21475328
  },
  "version": "1.0.0"
}
```

### AI Content Generation

#### POST /api/ai/generate-workbook

Generate a complete workbook using AI.

**Request Body:**
```json
{
  "topic": "Introduction to Fractions",
  "gradeLevel": "elementary",
  "duration": "1 week",
  "learningObjectives": [
    "Understand what fractions represent",
    "Identify parts of a fraction",
    "Compare simple fractions"
  ],
  "provider": "openai",
  "options": {
    "includeAnswerKey": true,
    "difficultyLevel": "beginner",
    "exerciseCount": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "workbook": {
    "id": "wb_123456789",
    "title": "Introduction to Fractions - Elementary Workbook",
    "description": "A comprehensive workbook introducing fraction concepts for elementary students",
    "metadata": {
      "gradeLevel": "elementary",
      "duration": "1 week",
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "provider": "openai"
    },
    "learningObjectives": [
      {
        "id": "lo_1",
        "text": "Understand what fractions represent",
        "level": "knowledge"
      }
    ],
    "sections": [
      {
        "id": "sec_1",
        "title": "What Are Fractions?",
        "conceptExplanation": "Fractions represent parts of a whole...",
        "examples": [
          {
            "problem": "What fraction of this circle is shaded?",
            "solution": "1/2",
            "explanation": "Half of the circle is shaded, so the fraction is 1/2"
          }
        ],
        "exercises": [
          {
            "id": "ex_1",
            "type": "multiple_choice",
            "question": "Which fraction represents half?",
            "options": ["1/4", "1/2", "3/4", "1/3"],
            "correctAnswer": "1/2",
            "explanation": "1/2 means one part out of two equal parts"
          }
        ]
      }
    ],
    "answerKey": [
      {
        "exerciseId": "ex_1",
        "answer": "1/2",
        "explanation": "1/2 means one part out of two equal parts"
      }
    ]
  }
}
```

#### POST /api/ai/generate-content

Generate specific content sections.

**Request Body:**
```json
{
  "type": "explanation",
  "topic": "Equivalent Fractions",
  "gradeLevel": "elementary",
  "provider": "anthropic",
  "options": {
    "length": "medium",
    "includeExamples": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "type": "explanation",
    "text": "Equivalent fractions are fractions that represent the same value...",
    "examples": [
      "1/2 = 2/4 = 3/6",
      "1/3 = 2/6 = 3/9"
    ],
    "metadata": {
      "wordCount": 250,
      "readabilityLevel": "grade-3",
      "generatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Workbook Management

#### POST /api/workbooks

Create a new workbook.

**Request Body:**
```json
{
  "title": "Custom Fractions Workbook",
  "description": "Custom workbook for fraction practice",
  "metadata": {
    "gradeLevel": "elementary",
    "subject": "mathematics",
    "duration": "2 weeks"
  },
  "learningObjectives": [],
  "sections": []
}
```

**Response:**
```json
{
  "success": true,
  "workbook": {
    "id": "wb_987654321",
    "title": "Custom Fractions Workbook",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/workbooks/:id

Retrieve a specific workbook.

**Parameters:**
- `id` (string): Workbook ID

**Response:**
```json
{
  "success": true,
  "workbook": {
    "id": "wb_987654321",
    "title": "Custom Fractions Workbook",
    "description": "Custom workbook for fraction practice",
    "metadata": {},
    "learningObjectives": [],
    "sections": [],
    "answerKey": []
  }
}
```

#### PUT /api/workbooks/:id

Update an existing workbook.

**Parameters:**
- `id` (string): Workbook ID

**Request Body:**
```json
{
  "title": "Updated Fractions Workbook",
  "sections": [
    {
      "id": "sec_1",
      "title": "Updated Section",
      "conceptExplanation": "Updated explanation..."
    }
  ]
}
```

#### DELETE /api/workbooks/:id

Delete a workbook.

**Parameters:**
- `id` (string): Workbook ID

**Response:**
```json
{
  "success": true,
  "message": "Workbook deleted successfully"
}
```

### PDF Generation

#### POST /api/pdf/generate

Generate PDF from workbook data (server-side fallback).

**Request Body:**
```json
{
  "workbook": {
    "title": "Fractions Workbook",
    "sections": []
  },
  "options": {
    "format": "A4",
    "orientation": "portrait",
    "includeAnswerKey": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "pdfUrl": "/api/pdf/download/pdf_123456789",
  "downloadToken": "token_abcdef123",
  "expiresAt": "2024-01-15T11:30:00.000Z"
}
```

#### GET /api/pdf/download/:token

Download generated PDF.

**Parameters:**
- `token` (string): Download token from generation response

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="workbook.pdf"`

### Templates

#### GET /api/templates

List available workbook templates.

**Query Parameters:**
- `gradeLevel` (string, optional): Filter by grade level
- `subject` (string, optional): Filter by subject
- `limit` (number, optional): Number of templates to return (default: 20)
- `offset` (number, optional): Number of templates to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "tpl_123",
      "title": "Basic Fractions Template",
      "description": "Template for introducing fractions",
      "gradeLevel": "elementary",
      "subject": "mathematics",
      "sections": [
        {
          "title": "Introduction to Fractions",
          "type": "explanation"
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasNext": true
  }
}
```

#### GET /api/templates/:id

Get specific template details.

**Parameters:**
- `id` (string): Template ID

**Response:**
```json
{
  "success": true,
  "template": {
    "id": "tpl_123",
    "title": "Basic Fractions Template",
    "description": "Template for introducing fractions",
    "metadata": {
      "gradeLevel": "elementary",
      "subject": "mathematics"
    },
    "structure": {
      "sections": [
        {
          "title": "Introduction",
          "type": "explanation",
          "contentGuidelines": "Explain what fractions are..."
        }
      ]
    }
  }
}
```

## Data Models

### Workbook

```typescript
interface Workbook {
  id: string;
  title: string;
  description: string;
  metadata: {
    gradeLevel: string;
    subject: string;
    duration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // minutes
  };
  learningObjectives: LearningObjective[];
  sections: Section[];
  answerKey: AnswerKeyItem[];
  createdAt: string;
  updatedAt: string;
}
```

### Learning Objective

```typescript
interface LearningObjective {
  id: string;
  text: string;
  level: 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation';
  bloomsTaxonomy: string;
}
```

### Section

```typescript
interface Section {
  id: string;
  title: string;
  conceptExplanation: string;
  examples: Example[];
  exercises: Exercise[];
  resources: Resource[];
  order: number;
}
```

### Exercise

```typescript
interface Exercise {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'fill_blank' | 'true_false' | 'matching';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  metadata: {
    estimatedTime: number; // seconds
    skillsAssessed: string[];
  };
}
```

### Example

```typescript
interface Example {
  problem: string;
  solution: string;
  explanation: string;
  visualAid?: {
    type: 'image' | 'diagram' | 'chart';
    url: string;
    altText: string;
  };
}
```

### Answer Key Item

```typescript
interface AnswerKeyItem {
  exerciseId: string;
  answer: string | string[];
  explanation: string;
  commonMistakes?: string[];
  teachingTips?: string[];
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "gradeLevel",
      "reason": "Must be one of: elementary, middle, high"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `UNAUTHORIZED` | Missing or invalid authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Too many requests | 429 |
| `AI_SERVICE_ERROR` | AI provider error | 502 |
| `PDF_GENERATION_ERROR` | PDF creation failed | 500 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

### Error Handling Examples

```typescript
// Client-side error handling
try {
  const response = await fetch('/api/ai/generate-workbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workbookData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    switch (error.error.code) {
      case 'VALIDATION_ERROR':
        showValidationError(error.error.details);
        break;
      case 'RATE_LIMITED':
        showRateLimitMessage();
        break;
      case 'AI_SERVICE_ERROR':
        showAIServiceError();
        break;
      default:
        showGenericError();
    }
    return;
  }
  
  const result = await response.json();
  // Handle success
} catch (error) {
  showNetworkError();
}
```

## Rate Limiting

### Limits

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/ai/*` | 10 requests | 1 minute |
| `/api/pdf/*` | 5 requests | 1 minute |
| `/api/workbooks/*` | 100 requests | 1 minute |
| `/api/templates/*` | 200 requests | 1 minute |
| `/api/health` | Unlimited | - |

### Rate Limit Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1642253400
Retry-After: 60
```

### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

## Examples

### Complete Workbook Creation Flow

```typescript
// 1. Generate AI workbook
const generateWorkbook = async () => {
  const response = await fetch('/api/ai/generate-workbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Introduction to Fractions',
      gradeLevel: 'elementary',
      duration: '1 week',
      learningObjectives: [
        'Understand what fractions represent',
        'Identify parts of a fraction'
      ],
      provider: 'openai'
    })
  });
  
  const { workbook } = await response.json();
  return workbook;
};

// 2. Save workbook
const saveWorkbook = async (workbook) => {
  const response = await fetch('/api/workbooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workbook)
  });
  
  const { workbook: savedWorkbook } = await response.json();
  return savedWorkbook;
};

// 3. Generate PDF (client-side preferred)
import { SimplePdfGenerator } from '../services/simplePdfGenerator';

const generatePDF = async (workbook) => {
  try {
    const pdfBlob = await SimplePdfGenerator.generateWorkbookPdf(workbook);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workbook.title}.pdf`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF generation failed:', error);
    // Fallback to server-side generation
    await generateServerPDF(workbook);
  }
};

// Complete flow
const createCompleteWorkbook = async () => {
  try {
    // Generate content with AI
    const workbook = await generateWorkbook();
    
    // Save to database
    const savedWorkbook = await saveWorkbook(workbook);
    
    // Generate PDF
    await generatePDF(savedWorkbook);
    
    console.log('Workbook created successfully!');
  } catch (error) {
    console.error('Workbook creation failed:', error);
  }
};
```

### Custom Content Generation

```typescript
// Generate specific content sections
const generateCustomContent = async () => {
  const explanationResponse = await fetch('/api/ai/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'explanation',
      topic: 'Equivalent Fractions',
      gradeLevel: 'elementary',
      provider: 'anthropic',
      options: {
        length: 'medium',
        includeExamples: true
      }
    })
  });
  
  const { content } = await explanationResponse.json();
  
  // Generate exercises
  const exercisesResponse = await fetch('/api/ai/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'exercises',
      topic: 'Equivalent Fractions',
      gradeLevel: 'elementary',
      options: {
        count: 5,
        types: ['multiple_choice', 'short_answer']
      }
    })
  });
  
  const { exercises } = await exercisesResponse.json();
  
  return { explanation: content, exercises };
};
```

### Template-Based Workbook

```typescript
// Use template to create workbook
const createFromTemplate = async (templateId) => {
  // Get template
  const templateResponse = await fetch(`/api/templates/${templateId}`);
  const { template } = await templateResponse.json();
  
  // Generate content for each section
  const sections = await Promise.all(
    template.structure.sections.map(async (sectionTemplate) => {
      const contentResponse = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sectionTemplate.type,
          guidelines: sectionTemplate.contentGuidelines,
          gradeLevel: template.metadata.gradeLevel
        })
      });
      
      const { content } = await contentResponse.json();
      
      return {
        title: sectionTemplate.title,
        ...content
      };
    })
  );
  
  // Create complete workbook
  const workbook = {
    title: `Custom ${template.title}`,
    description: `Generated from ${template.title}`,
    metadata: template.metadata,
    sections
  };
  
  return workbook;
};
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```typescript
// workbook-generator-sdk
import { WorkbookGeneratorClient } from 'workbook-generator-sdk';

const client = new WorkbookGeneratorClient({
  baseUrl: 'https://your-app.railway.app/api',
  apiKey: 'your-api-key' // if needed
});

// Generate workbook
const workbook = await client.workbooks.generateWithAI({
  topic: 'Fractions',
  gradeLevel: 'elementary'
});

// Create PDF
const pdfBlob = await client.pdf.generate(workbook);
```

### Python SDK

```python
# workbook-generator-python
from workbook_generator import WorkbookGeneratorClient

client = WorkbookGeneratorClient(
    base_url='https://your-app.railway.app/api'
)

# Generate workbook
workbook = client.workbooks.generate_with_ai(
    topic='Fractions',
    grade_level='elementary'
)

# Download PDF
pdf_data = client.pdf.generate(workbook)
```

### cURL Examples

```bash
# Generate workbook
curl -X POST https://your-app.railway.app/api/ai/generate-workbook \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Introduction to Fractions",
    "gradeLevel": "elementary",
    "provider": "openai"
  }'

# Get workbook
curl https://your-app.railway.app/api/workbooks/wb_123456789

# List templates
curl https://your-app.railway.app/api/templates?gradeLevel=elementary

# Health check
curl https://your-app.railway.app/api/health
```

## Webhooks (Future Feature)

### Webhook Events

```typescript
interface WebhookEvent {
  id: string;
  type: 'workbook.created' | 'workbook.updated' | 'pdf.generated';
  data: {
    workbookId: string;
    userId?: string;
    // Event-specific data
  };
  timestamp: string;
}
```

### Webhook Endpoints

```typescript
// Register webhook
POST /api/webhooks
{
  "url": "https://your-app.com/webhooks/workbook",
  "events": ["workbook.created", "pdf.generated"],
  "secret": "webhook-secret"
}

// List webhooks
GET /api/webhooks

// Delete webhook
DELETE /api/webhooks/:id
```

## Conclusion

The API provides comprehensive functionality for educational workbook generation, with robust error handling, rate limiting, and multiple integration options. The client-side PDF generation approach ensures optimal performance and Railway compatibility while maintaining full functionality.

For additional support or feature requests, please refer to the project repository or contact the development team.