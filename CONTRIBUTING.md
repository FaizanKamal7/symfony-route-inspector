# Contributing to Symfony Route Inspector

Thank you for considering contributing to Symfony Route Inspector! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help maintain a positive community

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Symfony version
- PHP version
- Any relevant error messages or logs

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear, descriptive title
- Detailed description of the proposed feature
- Explain why this enhancement would be useful
- Possible implementation approach (if you have ideas)

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/FaizanKamal7/symfony-route-inspector.git
   cd symfony-route-inspector
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**
   - Test in a real Symfony application
   - Ensure backward compatibility
   - Test with both Symfony 7.0 and 8.0 if possible

5. **Commit Your Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

   Use clear, descriptive commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Explain the motivation for the changes

## Development Setup

### Prerequisites
- PHP 8.1 or higher
- Composer
- Symfony 7.0+ or 8.0+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/FaizanKamal7/symfony-route-inspector.git
   cd symfony-route-inspector
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Create a test Symfony application**
   ```bash
   cd ..
   symfony new test-app
   cd test-app
   composer config repositories.local path ../symfony-route-inspector
   composer require faizankamal/symfony-route-inspector:@dev --dev
   ```

4. **Configure the bundle**
   Add to `config/bundles.php`:
   ```php
   FaizanKamal\RouteInspector\RouteInspectorBundle::class => ['dev' => true],
   ```

5. **Run the development server**
   ```bash
   symfony server:start
   ```

6. **Access the dashboard**
   Visit `http://localhost:8000/_route_inspector/dashboard`

## Code Style

- Follow PSR-12 coding standards
- Use type hints for all parameters and return types
- Write descriptive variable and method names
- Add PHPDoc blocks for classes and public methods
- Keep methods focused and single-purpose

### Example

```php
<?php

namespace FaizanKamal\RouteInspector\Service;

/**
 * Service for inspecting and analyzing Symfony routes.
 */
class RouteInspectorService
{
    /**
     * Get all routes with detailed information.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllRoutes(): array
    {
        // Implementation
    }
}
```

## Testing Guidelines

- Test your changes in multiple scenarios
- Test with both Symfony 7.0 and 8.0 when possible
- Test with different route configurations
- Verify the dashboard UI works correctly
- Test API endpoints return expected JSON

## Documentation

- Update README.md for new features
- Add inline code comments for complex logic
- Update API documentation if endpoints change
- Include usage examples for new features

## Areas We Need Help

- Real analytics integration examples
- Performance optimizations
- Additional route visualization options
- Export functionality (PDF/Markdown)
- Test coverage
- Documentation improvements
- Bug fixes

## Questions?

If you have questions about contributing:

- Open a GitHub Discussion
- Create an issue with the "question" label
- Contact the maintainer at faizankhan619.fk@gmail.com

## Recognition

Contributors will be recognized in:
- README.md acknowledgments
- Release notes
- Project documentation

Thank you for contributing to Symfony Route Inspector!
