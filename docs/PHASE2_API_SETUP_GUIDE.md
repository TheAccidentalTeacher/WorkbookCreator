# Phase 2 API Integration Guide

This guide provides step-by-step instructions for obtaining API keys and configuring the Phase 2 content generation services.

## Required API Keys

### 1. Google Vertex AI
**Purpose**: AI-powered content generation and educational explanations

**Steps to obtain**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing project
3. Enable the Vertex AI API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"
4. Create service account credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Download the JSON key file
5. Set environment variables:
   ```
   GOOGLE_VERTEX_AI_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   ```

**Pricing**: Pay-per-use, free tier available

### 2. Symbolab Math API
**Purpose**: Advanced math problem generation and step-by-step solutions

**Steps to obtain**:
1. Visit [Symbolab API Documentation](https://symbolab.com/api)
2. Contact Symbolab for API access (currently in limited beta)
3. Submit application with your use case
4. Once approved, you'll receive your API key
5. Set environment variable:
   ```
   SYMBOLAB_API_KEY=your-api-key-here
   ```

**Note**: Symbolab API is currently in limited availability. You may need to join a waitlist.

### 3. VectorArt.ai API
**Purpose**: Educational illustrations and scientific diagrams

**Steps to obtain**:
1. Visit [VectorArt.ai](https://vectorart.ai)
2. Sign up for an account
3. Navigate to API documentation
4. Subscribe to an API plan
5. Generate your API key from the dashboard
6. Set environment variable:
   ```
   VECTORART_AI_API_KEY=your-api-key-here
   ```

**Pricing**: Subscription-based with free tier

## Environment Configuration

### .env.local File
Create a `.env.local` file in your project root with the following structure:

```bash
# Google Vertex AI Configuration
GOOGLE_VERTEX_AI_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json

# Symbolab Math API
SYMBOLAB_API_KEY=your-symbolab-api-key

# VectorArt.ai API
VECTORART_AI_API_KEY=your-vectorart-api-key

# Optional: Rate limiting configuration
API_RATE_LIMIT_REQUESTS_PER_MINUTE=60
API_RATE_LIMIT_BURST_SIZE=10
```

### Security Best Practices
1. **Never commit API keys to version control**
2. Add `.env.local` to your `.gitignore` file
3. Use different API keys for development and production
4. Regularly rotate your API keys
5. Set up monitoring for API usage

## Testing Your Configuration

### 1. Quick Health Check
```bash
curl http://localhost:3000/api/test-phase2?type=health
```

### 2. Full Service Tests
```bash
curl http://localhost:3000/api/test-phase2?type=full
```

### 3. Content Generation Test
```bash
curl -X POST http://localhost:3000/api/test-phase2 \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "math",
    "topic": "algebra basics",
    "grade_level": 8,
    "difficulty": "medium",
    "content_types": ["explanations"],
    "include_visuals": false
  }'
```

## Alternative Testing (Without API Keys)

The system includes mock API functionality for testing without real API keys:

1. Navigate to `/phase2-testing` in your browser
2. Use the "Health Check" to verify service configuration
3. Use "Full Tests" to run comprehensive testing with mock APIs
4. Test content generation with simulated responses

## Troubleshooting

### Common Issues

**Google Vertex AI Authentication Error**:
- Verify your service account JSON file path
- Ensure the service account has Vertex AI permissions
- Check that the Vertex AI API is enabled in your project

**Symbolab API Access Denied**:
- Confirm you've been approved for API access
- Check if your API key is correctly formatted
- Verify your subscription status

**VectorArt.ai Rate Limit Exceeded**:
- Check your subscription plan limits
- Implement proper rate limiting in your application
- Consider upgrading your plan if needed

**General Configuration Issues**:
- Ensure `.env.local` file is in the project root
- Restart your development server after adding environment variables
- Check for typos in environment variable names

### Getting Help

1. **Phase 2 Testing Interface**: Use `/phase2-testing` for guided testing
2. **Console Logs**: Check browser console and server logs for detailed error messages
3. **API Documentation**: Refer to each service's official documentation
4. **Testing Framework**: Use the comprehensive test suite to isolate issues

## Next Steps

Once all API keys are configured and tested:

1. Run the full test suite to verify all services
2. Test content generation workflows
3. Integrate with the main worksheet generation interface
4. Set up monitoring and logging for production use
5. Consider implementing caching for improved performance

## Cost Management

### Estimated Monthly Costs (Light Usage)
- **Google Vertex AI**: $5-20/month
- **Symbolab API**: Contact for pricing
- **VectorArt.ai**: $10-30/month

### Cost Optimization Tips
1. Implement response caching
2. Use rate limiting to control usage
3. Monitor API usage dashboards
4. Set up billing alerts
5. Consider batch processing for bulk operations