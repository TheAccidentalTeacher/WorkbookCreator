# 📚 Pedagogical Workbook Generator

> AI-powered educational content creation with professional PDF export, optimized for Railway deployment.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Railway](https://img.shields.io/badge/Railway-Ready-purple?logo=railway)](https://railway.app/)
[![PDFMake](https://img.shields.io/badge/PDFMake-0.2.20-green)](https://pdfmake.github.io/docs/)

## 🎯 Overview

The Pedagogical Workbook Generator is a modern web application that leverages AI to create comprehensive educational workbooks with professional formatting. Built with Next.js 15 and optimized for serverless deployment on Railway.

### 🚀 Key Features

- **🤖 AI-Powered Content Generation** - Uses OpenAI GPT-4 and Anthropic Claude for educational content creation
- **📄 Professional PDF Export** - Railway-compatible PDF generation with educational formatting standards
- **🎨 Modern UI/UX** - Responsive design built with Tailwind CSS and shadcn/ui components
- **📊 Real-time Progress Tracking** - Live generation status with detailed pipeline visibility
- **🔧 Type-Safe Architecture** - Full TypeScript implementation with Zod validation
- **⚡ Performance Optimized** - Turbopack builds and client-side PDF generation

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Architecture](#-architecture)
- [Railway Deployment](#-railway-deployment)
- [PDF Generation](#-pdf-generation-solution)
- [API Documentation](#-api-documentation)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API Key
- Anthropic API Key (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheAccidentalTeacher/WorkbookCreator.git
   cd WorkbookCreator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   ```
   http://localhost:3000
   ```

## ✨ Features

### 🎓 Educational Content Generation

- **Multi-step AI Pipeline** - Systematic content generation with topic analysis, learning objectives, and structured sections
- **Pedagogical Compliance** - Bloom's taxonomy integration and educational best practices
- **Subject Domain Support** - Mathematics, Science, English Language Arts, Social Studies, and more
- **Grade Band Targeting** - K-12 content appropriate for specific age groups

### 📄 Professional PDF Export

Our **Railway-compatible PDF solution** addresses the common Puppeteer deployment issues:

| Feature | Our Solution | Traditional Approach |
|---------|-------------|---------------------|
| **PDF Library** | PDFMake (2MB) | Puppeteer (300MB+) |
| **Dependencies** | Pure JavaScript | Chromium browser |
| **Railway Compatible** | ✅ Yes | ❌ No |
| **Memory Usage** | ~50MB | ~300MB+ |
| **Cold Start** | Fast | Slow |

See [PDF Generation Documentation](./docs/PDF_GENERATION.md) for technical details.

### 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Type Safety**: TypeScript + Zod validation
- **AI Integration**: OpenAI GPT-4 + Anthropic Claude
- **PDF Generation**: PDFMake (client-side)
- **Build Tool**: Turbopack for faster development

## 🚂 Railway Deployment

This application is specifically optimized for Railway deployment with zero configuration needed.

### 🔧 Railway Setup

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Create new project from GitHub
   - Select `TheAccidentalTeacher/WorkbookCreator`

2. **Environment Variables**
   ```bash
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   MAX_TOKEN_BUDGET_PER_WORKBOOK=50000
   ```

3. **Deploy**
   - Railway auto-detects Next.js
   - Builds with Turbopack
   - Deploys to global CDN

### 📊 Railway Performance

- **Build Time**: ~2-3 minutes
- **Memory Usage**: ~512MB
- **Cold Start**: <1 second
- **Scaling**: Automatic

See [Railway Deployment Guide](./docs/RAILWAY_DEPLOYMENT.md) for detailed instructions.

## 🔧 PDF Generation Solution

### The Problem

Traditional PDF generation using Puppeteer presents significant challenges for serverless deployment:

- **Large Bundle Size**: 300MB+ Chromium dependency
- **Memory Requirements**: 1GB+ RAM for PDF generation
- **Cold Start Issues**: Slow initialization
- **Railway Incompatibility**: Exceeds platform limits

### Our Solution

We implemented a **client-side PDF generation system** using PDFMake:

```typescript
// Client-side PDF generation with dynamic imports
export class SimplePdfGenerator {
  private static async initializePdfMake() {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    // Setup and return configured pdfMake instance
  }
}
```

### Benefits

- ✅ **Railway Compatible**: No server-side dependencies
- ✅ **Lightweight**: 2MB vs 300MB+
- ✅ **Fast**: Client-side generation
- ✅ **Professional**: Educational formatting standards
- ✅ **Scalable**: No memory constraints

Read more: [PDF Generation Technical Documentation](./docs/PDF_GENERATION.md)

## 📡 API Documentation

### Core Endpoints

- `POST /api/generate-workbook` - Generate new workbook
- `GET /api/test` - Test AI service connectivity
- `GET /api/workbook/[id]` - Retrieve workbook (future)

### Generation Pipeline

Our AI content generation follows a structured pipeline:

1. **Topic Analysis** - Domain understanding and scope definition
2. **Learning Objectives** - SMART criteria and Bloom's taxonomy
3. **Content Outline** - Structured section planning
4. **Section Generation** - Detailed content creation
5. **Exercise Generation** - Interactive learning activities
6. **Solution Generation** - Answer keys and explanations
7. **Misconception Analysis** - Common error identification
8. **Quality Validation** - Pedagogical compliance checking
9. **Layout Assembly** - Final workbook structure

See [API Documentation](./docs/API.md) for detailed endpoint specifications.

## 🌍 Environment Setup

### Required Environment Variables

```bash
# AI API Keys
OPENAI_API_KEY=sk-proj-...           # Required for content generation
ANTHROPIC_API_KEY=sk-ant-api03-...   # Optional fallback

# Authentication
JWT_SECRET=your-secure-secret        # For user sessions
NEXTAUTH_SECRET=your-nextauth-secret # For NextAuth.js

# Database (Optional)
DATABASE_URL=postgresql://...        # For workbook persistence

# Performance
MAX_TOKEN_BUDGET_PER_WORKBOOK=50000  # Cost control
```

### Optional Services

- **PostgreSQL** - Workbook persistence (uses Prisma ORM)
- **Redis** - Caching and job queues (future feature)

## 🛠️ Development

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── generate/       # Workbook generation page
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── WorkbookViewer.tsx
├── services/          # Business logic
│   ├── aiService.ts   # AI integration
│   ├── simplePdfGenerator.ts
│   └── contentGenerationOrchestrator.ts
├── types/             # TypeScript definitions
│   ├── workbook.ts    # Workbook schema
│   └── enums.ts       # Enum definitions
└── utils/             # Utility functions
```

### Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build           # Production build
npm run start           # Start production server
npm run lint            # ESLint checking

# Type Checking
npx tsc --noEmit        # TypeScript validation
```

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (configured)
- **Zod**: Runtime type validation

## 🔍 Testing

### Test Workbook Generation

1. Navigate to `/generate`
2. Fill in the form:
   - **Topic**: "Photosynthesis in Plants"
   - **Subject**: Science
   - **Grade**: 6-8
   - **Complexity**: Intermediate
3. Click "Generate Workbook"
4. Monitor real-time progress
5. Export as PDF when complete

### API Testing

Use the test endpoint to verify AI connectivity:
```bash
curl http://localhost:3000/api/test
```

## 📚 Documentation

- [PDF Generation Technical Guide](./docs/PDF_GENERATION.md)
- [Railway Deployment Guide](./docs/RAILWAY_DEPLOYMENT.md)
- [API Reference](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 API for content generation
- **Anthropic** - Claude API for enhanced AI capabilities
- **Vercel** - Next.js framework and development tools
- **Railway** - Simplified deployment platform
- **PDFMake** - Client-side PDF generation solution

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/TheAccidentalTeacher/WorkbookCreator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TheAccidentalTeacher/WorkbookCreator/discussions)
- **Email**: [Contact maintainer](mailto:support@workbookcreator.com)

---

<div align="center">
  <strong>Built with ❤️ for educators by educators</strong>
  <br>
  <sub>Empowering teachers to create engaging educational content with AI</sub>
</div>
