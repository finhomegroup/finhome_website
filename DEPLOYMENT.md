# Deployment Guide for AWS Amplify

## Prerequisites
- AWS Amplify Console access
- GitHub repository connected
- Node.js 18+ environment

## Configuration Files

### 1. amplify.yml
This file configures the build process for AWS Amplify:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 2. public/_redirects
This file handles client-side routing:
```
/*    /index.html   200
```

## Build Commands
- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Preview**: `npm run preview`

## Environment Variables
Make sure these are set in AWS Amplify Console:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Common Issues and Solutions

### 1. White Screen
- Check browser console for JavaScript errors
- Verify all environment variables are set
- Ensure build completes successfully

### 2. Routing Issues
- Verify `_redirects` file is in the `public` folder
- Check that all routes are properly configured

### 3. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

## Troubleshooting Steps

1. **Check Build Logs**: Look for any build errors in Amplify Console
2. **Verify Environment Variables**: Ensure all required env vars are set
3. **Test Locally**: Run `npm run build` locally to catch issues early
4. **Check Browser Console**: Look for JavaScript errors in production
5. **Verify Dependencies**: Ensure all packages are compatible

## Performance Optimization

- The build includes code splitting for better performance
- Static assets are optimized and compressed
- Consider implementing lazy loading for routes if needed 