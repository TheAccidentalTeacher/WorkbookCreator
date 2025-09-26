# 🎓 Pedagogical Workbook Generator

An AI-powered educational content creation platform that generates comprehensive, age-appropriate workbooks across multiple subjects using cutting-edge AI technologies.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Railway](https://img.shields.io/badge/Deployed%20on-Railway-purple?logo=railway)](https://railway.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Live Demo

- **Production**: [Coming Soon]
- **Phase 2 Testing**: http://localhost:3000/phase2-testing (development)

## ✨ Features

### ✅ Phase 1: Foundation
- **AI Content Generation**: Educational content using OpenAI and Anthropic
- **PDF Export**: Professional workbook generation with PDFMake
- **Multi-Subject Support**: Math, Science, Language Arts, Social Studies
- **Grade Level Targeting**: K-12 content difficulty adjustment
- **Database Integration**: PostgreSQL with Prisma ORM

### ✅ Phase 2: Advanced AI Integration
- **Multi-AI Orchestration**: Coordinated use of multiple AI services
- **Google Vertex AI**: Primary content generation with Gemini models
- **Educational Image Search**: Real educational images from Unsplash, Pexels, and Pixabay
- **Specialized Services**: Math (Symbolab) and Visual content integration
- **Content Validation**: Quality scoring and educational value assessment
- **Comprehensive Testing**: Interactive testing framework and health monitoring

### 🔄 Phase 3: Production Features (Planned)
- User authentication and account management
- Collaborative editing and sharing
- Advanced analytics dashboard
- Mobile optimization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Backend API   │    │  AI Services    │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│  Integration    │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React UI      │    │ • RESTful APIs  │    │ • Google Vertex │
│ • Tailwind CSS  │    │ • Authentication│    │ • Educational   │
│ • Type Safety   │    │ • Content Logic │    │   Image Search  │
│ • State Mgmt    │    │ • PDF Generation│    │ • Content Valid │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    Database     │
                       │   (PostgreSQL)  │
                       │                 │
                       │ • User Data     │
                       │ • Workbooks     │
                       │ • Templates     │
                       │ • Analytics     │
                       └─────────────────┘
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Railway)
- **AI Services**: Google Vertex AI, OpenAI, Anthropic
- **Educational Images**: Unsplash, Pexels, Pixabay APIs
- **Specialized AI**: Symbolab (Math), Content validation
- **PDF Generation**: PDFMake with base64 image embedding
- **Deployment**: Railway.app
- **Development**: ESLint, Prettier, Jest

## 📚 Documentation

### 📖 Essential Reading
- **[📋 Project Overview](docs/PROJECT_OVERVIEW.md)** - Architecture, features, and technical stack
- **[🚀 Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[👨‍💻 Development Guide](docs/DEVELOPMENT.md)** - Setup and development workflow

### 🔧 Technical Documentation
- **[🔌 API Documentation](docs/API.md)** - Complete API reference and examples
- **[🏗️ Architecture](docs/ARCHITECTURE.md)** - Detailed technical architecture
- **[🔧 Phase 2 API Setup](docs/PHASE2_API_SETUP_GUIDE.md)** - AI service configuration
- **[🖼️ Educational Image Search](docs/EDUCATIONAL_IMAGE_SEARCH.md)** - Real image integration system

### 📋 Operations & Maintenance
- **[🚂 Railway Deployment](docs/RAILWAY_DEPLOYMENT.md)** - Railway-specific deployment
- **[🐛 Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[🤝 Contributing](docs/CONTRIBUTING.md)** - Contribution guidelines

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or Railway)
- AI service API keys (see [Phase 2 Setup Guide](docs/PHASE2_API_SETUP_GUIDE.md))

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/TheAccidentalTeacher/WorkbookCreator.git
cd pedagogical-workbook-generator

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Set up database
npx prisma db push

# 5. Start development server
npm run dev
```

Visit http://localhost:3000 to see the application!

### Production Deployment

For production deployment to Railway:

1. **Follow the [Deployment Guide](docs/DEPLOYMENT.md)**
2. **Configure AI services using [Phase 2 Setup Guide](docs/PHASE2_API_SETUP_GUIDE.md)**
3. **Monitor deployment with health checks**

## 🧪 Testing Phase 2 Integration

We've built a comprehensive testing interface for Phase 2 AI services:

```bash
# Start the development server
npm run dev

# Visit the testing interface
open http://localhost:3000/phase2-testing
```

### Testing Features
- **Health Checks**: Monitor all AI service status
- **Content Generation**: Test educational content creation
- **Service Integration**: Verify multi-AI coordination
- **Quality Validation**: Content scoring and safety checks

## 🔑 API Keys Configuration

The application integrates with multiple AI services. See our [Phase 2 API Setup Guide](docs/PHASE2_API_SETUP_GUIDE.md) for detailed instructions on obtaining and configuring:

- **Google Vertex AI** (Primary, Required)
- **OpenAI** (Phase 1, Optional)
- **Anthropic Claude** (Phase 1, Optional)
- **Symbolab Math API** (Phase 2, Optional)
- **Educational Image APIs** (Phase 2, Required for images):
  - Unsplash API
  - Pexels API  
  - Pixabay API

## 📊 Project Status

### Current Status: Phase 2 Complete ✅

| Component | Status | Progress |
|-----------|--------|----------|
| **Phase 1 Foundation** | ✅ Complete | 100% |
| **Phase 2 AI Integration** | ✅ Complete | 100% |
| **Google Vertex AI** | ✅ Configured | 100% |
| **Database & Infrastructure** | ✅ Complete | 100% |
| **Testing Framework** | ✅ Complete | 100% |
| **Documentation** | ✅ Complete | 100% |
| **User Authentication** | 🔄 Planned | 0% |
| **Production Deployment** | 🔄 In Progress | 80% |

### Recent Achievements
- ✅ Complete Phase 2 AI service integration
- ✅ Google Vertex AI fully configured with real credentials
- ✅ Comprehensive testing interface built
- ✅ Multi-AI coordination system implemented
- ✅ Content validation and quality scoring
- ✅ Complete documentation overhaul

## 🤝 Contributing

We welcome contributions from educators, developers, and AI enthusiasts!

### How to Contribute
1. **Read** our [Contributing Guide](docs/CONTRIBUTING.md)
2. **Set up** your development environment using our [Development Guide](docs/DEVELOPMENT.md)
3. **Create** a feature branch for your changes
4. **Test** your changes thoroughly
5. **Submit** a pull request with a clear description

### Areas for Contribution
- 🎨 UI/UX improvements
- 🤖 Additional AI service integrations
- 🧪 Test coverage expansion
- 📚 Educational content templates
- 🌐 Internationalization
- 📱 Mobile optimization

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Database
npx prisma studio   # Database GUI
npx prisma db push  # Push schema changes
npx prisma generate # Generate Prisma client

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking
npm test           # Run tests
```

### Key Features for Developers
- **TypeScript**: Full type safety throughout the application
- **Hot Reload**: Instant feedback during development
- **API Testing**: Built-in testing interface for all AI services
- **Error Handling**: Comprehensive error tracking and recovery
- **Performance**: Optimized for fast content generation

## 📈 Roadmap

### Short Term (Next 30 days)
- [ ] Complete remaining API integrations (Symbolab, VectorArt)
- [ ] User authentication system
- [ ] Production deployment optimization
- [ ] Performance monitoring setup

### Medium Term (3-6 months)
- [ ] Advanced template system
- [ ] Collaboration features
- [ ] Analytics dashboard
- [ ] Mobile application

### Long Term (6+ months)
- [ ] AI model fine-tuning for education
- [ ] Learning Management System integration
- [ ] Marketplace for educational templates
- [ ] Multi-language support

## 📞 Support

### Getting Help
- **Documentation**: Check our comprehensive [docs](docs/) folder
- **Issues**: Open a [GitHub issue](https://github.com/TheAccidentalTeacher/WorkbookCreator/issues)
- **Discussions**: Join our [GitHub discussions](https://github.com/TheAccidentalTeacher/WorkbookCreator/discussions)

### Reporting Issues
When reporting issues, please include:
- Node.js and npm versions
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant log output

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Educators**: For inspiring this project and providing valuable feedback
- **Open Source Community**: For the amazing tools and libraries
- **AI Providers**: Google, OpenAI, Anthropic for powerful AI capabilities
- **Railway**: For excellent deployment platform

---

**Built with ❤️ for educators and learners everywhere**

*Transform education through AI-powered content creation*