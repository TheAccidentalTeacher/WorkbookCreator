# 🤝 Contributing to Pedagogical Workbook Generator

## Welcome Contributors!

Thank you for your interest in contributing to the Pedagogical Workbook Generator! This project aims to revolutionize educational content creation through AI-powered workbook generation and we welcome contributions from developers, educators, and domain experts.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing Requirements](#testing-requirements)
7. [Documentation Guidelines](#documentation-guidelines)
8. [Community Guidelines](#community-guidelines)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** and **npm 9+** installed
- **Git** for version control
- A **GitHub account** for pull requests
- Basic familiarity with **React**, **Next.js**, and **TypeScript**
- Understanding of **educational content** principles (helpful but not required)

### Development Setup

1. **Fork the repository**
   ```bash
   # Go to https://github.com/TheAccidentalTeacher/WorkbookCreator
   # Click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/WorkbookCreator.git
   cd WorkbookCreator
   ```

3. **Set up upstream remote**
   ```bash
   git remote add upstream https://github.com/TheAccidentalTeacher/WorkbookCreator.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Verify setup**
   - Visit http://localhost:3000
   - Run tests: `npm test`
   - Check linting: `npm run lint`

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

#### 🐛 Bug Reports
- Found a bug? Please report it!
- Use the issue template
- Include reproduction steps
- Provide system information

#### ✨ Feature Requests
- Have an idea for improvement?
- Check existing issues first
- Describe the use case clearly
- Consider educational impact

#### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Code refactoring

#### 📚 Documentation
- Fix typos or clarify content
- Add examples
- Improve API documentation
- Create tutorials

#### 🎨 Design & UX
- UI improvements
- Accessibility enhancements
- User experience optimization
- Educational workflow design

#### 🧪 Testing
- Add test coverage
- Improve existing tests
- Performance testing
- Educational content validation

### Contribution Areas

#### Core Features
- **AI Integration**: Improve OpenAI/Anthropic integration
- **PDF Generation**: Enhance PDFMake implementation
- **Workbook Structure**: Educational content organization
- **User Interface**: React component improvements

#### Educational Focus
- **Curriculum Alignment**: Standards-based content
- **Assessment Tools**: Exercise and evaluation features
- **Accessibility**: Inclusive design practices
- **Pedagogical Features**: Learning objective integration

#### Technical Infrastructure
- **Performance**: Optimization and monitoring
- **Security**: Input validation and sanitization
- **Railway Deployment**: Platform-specific optimizations
- **Error Handling**: Robust error recovery

## Development Workflow

### Issue-Based Development

1. **Find or Create an Issue**
   ```bash
   # Check existing issues
   # https://github.com/TheAccidentalTeacher/WorkbookCreator/issues
   
   # Create new issue if needed
   # Use appropriate issue template
   ```

2. **Claim the Issue**
   ```bash
   # Comment on the issue to claim it
   # Wait for maintainer assignment
   ```

3. **Create Feature Branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/issue-number-description
   # Example: git checkout -b feature/123-improve-pdf-generation
   ```

### Branch Naming Convention

```bash
# Feature branches
feature/issue-number-short-description
feature/123-ai-content-validation
feature/456-pdf-memory-optimization

# Bug fix branches
fix/issue-number-short-description
fix/789-pdf-generation-error
fix/012-ai-timeout-handling

# Documentation branches
docs/issue-number-short-description
docs/345-api-documentation
docs/678-contributing-guide

# Chore/maintenance branches
chore/issue-number-short-description
chore/901-update-dependencies
chore/234-improve-error-handling
```

### Commit Message Format

Follow conventional commits specification:

```bash
type(scope): description

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Scopes
- `ai`: AI service integration
- `pdf`: PDF generation
- `ui`: User interface components
- `api`: API routes and services
- `docs`: Documentation
- `build`: Build system
- `deploy`: Deployment configuration

#### Examples
```bash
feat(ai): add support for Anthropic Claude API
fix(pdf): resolve memory leak in large document generation
docs(api): add comprehensive endpoint documentation
refactor(ui): improve WorkbookViewer component structure
test(ai): add unit tests for content validation
chore(deps): update Next.js to 15.5.3
```

### Pull Request Process

1. **Ensure Quality**
   ```bash
   # Run tests
   npm test
   
   # Check types
   npm run type-check
   
   # Lint code
   npm run lint:fix
   
   # Build successfully
   npm run build
   ```

2. **Update Documentation**
   - Update README if needed
   - Add/update API documentation
   - Include inline code comments
   - Update changelog if applicable

3. **Create Pull Request**
   - Use the PR template
   - Link to related issue(s)
   - Describe changes clearly
   - Include screenshots for UI changes
   - Add reviewers if known

4. **PR Review Process**
   - Address review feedback
   - Keep PR focused and atomic
   - Squash commits if requested
   - Maintain clean commit history

### Pull Request Template

```markdown
## Description
Brief description of changes and motivation.

## Related Issue
Closes #[issue number]

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Code Standards

### TypeScript Standards

```typescript
// Use explicit types
interface WorkbookProps {
  workbook: Workbook;
  onUpdate: (workbook: Workbook) => void;
  readonly?: boolean;
}

// Use proper generics
function createService<T extends BaseService>(ServiceClass: new () => T): T {
  return new ServiceClass();
}

// Use type guards
function isWorkbook(obj: unknown): obj is Workbook {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'title' in obj;
}

// Use strict null checks
function processWorkbook(workbook: Workbook | null): string {
  if (!workbook) {
    return 'No workbook provided';
  }
  return workbook.title;
}
```

### React Component Standards

```typescript
// Use functional components with TypeScript
interface ComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction, 
  children 
}) => {
  // State with proper typing
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Callbacks with dependencies
  const handleClick = useCallback(() => {
    setIsLoading(true);
    onAction?.();
  }, [onAction]);
  
  // Effects with cleanup
  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="component">
      <h2>{title}</h2>
      {children}
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
};
```

### CSS/Styling Standards

```typescript
// Use Tailwind CSS classes
const styles = {
  container: 'max-w-4xl mx-auto p-6',
  header: 'text-2xl font-bold text-gray-900 mb-4',
  button: {
    primary: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 px-4 py-2 rounded hover:bg-gray-300',
  },
};

// Responsive design
const Component = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
);

// Dark mode support
const Component = () => (
  <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    {/* Content */}
  </div>
);
```

### API Standards

```typescript
// Use proper error handling
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = validateInput(body);
    
    // Process request
    const result = await processRequest(validatedData);
    
    return Response.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('[API Error]:', error);
    
    return Response.json(
      { 
        success: false, 
        error: {
          code: getErrorCode(error),
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: getErrorStatus(error) }
    );
  }
}

// Use proper validation
import { z } from 'zod';

const workbookSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  gradeLevel: z.enum(['elementary', 'middle', 'high']),
});

function validateInput(data: unknown) {
  return workbookSchema.parse(data);
}
```

### Documentation Standards

```typescript
/**
 * Generates a PDF from workbook data using PDFMake
 * 
 * @param workbook - The workbook data to convert to PDF
 * @param options - PDF generation options
 * @returns Promise that resolves to a PDF Blob
 * 
 * @example
 * ```typescript
 * const workbook = { title: 'Math Workbook', sections: [...] };
 * const pdfBlob = await generatePDF(workbook);
 * downloadBlob(pdfBlob, 'workbook.pdf');
 * ```
 * 
 * @throws {Error} When PDF generation fails
 * @throws {ValidationError} When workbook data is invalid
 */
export async function generatePDF(
  workbook: Workbook, 
  options: PDFOptions = {}
): Promise<Blob> {
  // Implementation
}
```

## Testing Requirements

### Unit Tests

```typescript
// __tests__/components/WorkbookViewer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkbookViewer } from '../WorkbookViewer';
import { mockWorkbook } from '../../test-utils/mocks';

describe('WorkbookViewer', () => {
  const defaultProps = {
    workbook: mockWorkbook,
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workbook title', () => {
    render(<WorkbookViewer {...defaultProps} />);
    expect(screen.getByText(mockWorkbook.title)).toBeInTheDocument();
  });

  it('calls onUpdate when workbook is modified', async () => {
    render(<WorkbookViewer {...defaultProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/workbook-generation.test.ts
import { POST } from '../../app/api/ai/generate-workbook/route';

describe('Workbook Generation Integration', () => {
  it('generates complete workbook from AI service', async () => {
    const request = new Request('http://localhost/api/ai/generate-workbook', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'Fractions',
        gradeLevel: 'elementary',
        provider: 'openai'
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.workbook).toEqual(
      expect.objectContaining({
        title: expect.stringContaining('Fractions'),
        sections: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            exercises: expect.any(Array),
          })
        ])
      })
    );
  });
});
```

### Test Coverage Requirements

- **Minimum coverage**: 70% overall
- **Critical paths**: 90% coverage required
- **New features**: Must include tests
- **Bug fixes**: Must include regression tests

```bash
# Run tests with coverage
npm run test:coverage

# Check coverage requirements
npm run test:coverage -- --passWithNoTests
```

## Documentation Guidelines

### README Updates

When adding new features:

1. Update feature list
2. Add configuration instructions
3. Include usage examples
4. Update installation steps if needed

### API Documentation

```typescript
// Include JSDoc comments for all public APIs
/**
 * @api {post} /api/workbooks Create Workbook
 * @apiName CreateWorkbook
 * @apiGroup Workbooks
 * 
 * @apiParam {String} title Workbook title
 * @apiParam {String} description Workbook description
 * @apiParam {Object[]} sections Array of sections
 * 
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} workbook Created workbook object
 * 
 * @apiError {String} error Error message
 * @apiError {String} code Error code
 */
```

### Code Comments

```typescript
// Good: Explain why, not what
// Use camelCase for user IDs to maintain consistency with AI service APIs
const processUserId = (id: string) => toCamelCase(id);

// Good: Explain complex logic
// PDFMake requires VFS setup for fonts before document generation
// This ensures proper font rendering in the generated PDF
const setupPDFMake = async () => {
  const pdfMake = await import('pdfmake/build/pdfmake');
  const vfs = await import('pdfmake/build/vfs_fonts');
  pdfMake.vfs = vfs.pdfMake.vfs;
  return pdfMake;
};

// Avoid: Obvious comments
// const title = workbook.title; // Get title from workbook
```

## Community Guidelines

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests, discussions
- **Pull Requests**: Code reviews and technical discussions
- **GitHub Discussions**: General questions and community support

### Getting Help

1. **Check existing documentation** first
2. **Search existing issues** for similar problems
3. **Use issue templates** when creating new issues
4. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - System information
   - Error messages

### Mentorship

New contributors are welcome! Look for:

- **Good first issue** labels
- **Help wanted** labels
- **Documentation** improvements
- **Test** additions

Experienced contributors can help by:

- Reviewing pull requests
- Mentoring new contributors
- Improving documentation
- Triaging issues

### Recognition

Contributors are recognized through:

- **GitHub contributors list**
- **Release notes** mentions
- **Community highlights**
- **Maintainer recommendations**

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

### Release Schedule

- **Patch releases**: As needed for critical bugs
- **Minor releases**: Monthly for new features
- **Major releases**: Quarterly for significant changes

### Changelog

All notable changes are documented in CHANGELOG.md:

```markdown
## [1.2.0] - 2024-01-15

### Added
- Support for Anthropic Claude API integration
- Enhanced PDF generation with custom fonts
- New template system for workbook creation

### Changed
- Improved AI content validation
- Updated Railway deployment configuration

### Fixed
- Memory leak in PDF generation for large documents
- Error handling in AI service timeouts

### Security
- Updated dependencies to address security vulnerabilities
```

## Questions?

If you have questions about contributing:

1. Check the [documentation](../README.md)
2. Look through [existing issues](https://github.com/TheAccidentalTeacher/WorkbookCreator/issues)
3. Create a new [discussion](https://github.com/TheAccidentalTeacher/WorkbookCreator/discussions)
4. Reach out to maintainers

## Thank You!

Your contributions make this project better for educators and students worldwide. Every bug report, feature suggestion, code contribution, and documentation improvement helps create better educational tools.

We appreciate your time and effort in making educational technology more accessible and effective! 🎓✨