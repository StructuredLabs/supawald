# Contributing to Supawald

Thank you for your interest in contributing to Supawald! This document provides guidelines and steps for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the issues section
2. If not, create a new issue with:
   - A clear description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Your environment details (OS, Node.js version, etc.)

### Suggesting Enhancements

1. Check if the enhancement has already been suggested
2. Create a new issue with:
   - A clear description of the enhancement
   - Why this enhancement would be useful
   - Any specific implementation ideas you have

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```
3. Make your changes
4. Write/update tests if applicable
5. Update documentation if needed
6. Commit your changes with clear commit messages
7. Push to your fork
8. Create a Pull Request

### Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/supawald.git
   cd supawald
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your Supabase credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Use proper error handling

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Update tests when modifying existing features

### Documentation

- Update README.md if needed
- Add comments for complex code
- Update API documentation if applicable

## Questions?

Feel free to open an issue for any questions or concerns about contributing.

Thank you for contributing to Supawald! 