# Symfony Route Inspector

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.1-blue.svg)](https://php.net)
[![Symfony Version](https://img.shields.io/badge/symfony-%5E7.0%20%7C%7C%20%5E8.0-green.svg)](https://symfony.com)

> A visual, interactive developer dashboard for inspecting, analyzing, and exploring Symfony routes with real-time insights and API explorer capabilities.

<img width="1366" height="927" alt="Thumbnail" src="https://github.com/user-attachments/assets/2a46671d-6118-41c2-8fce-3fe40aa43a35" />

## Why This Bundle?

While Symfony provides `bin/console debug:router` and the Symfony Profiler for route inspection, **Symfony Route Inspector** takes it several steps further by providing:

- **Visual Interactive Dashboard** - Beautiful, modern UI with dark/light theme and real-time route exploration
- **Route Graph Visualization** - Interactive hierarchical tree view showing your entire route structure with zoom and pan
- **SQL Query Tracking** - Real-time SQL query monitoring with N+1 detection, slow query identification, and duplicate query tracking
- **Performance Issue Detection** - Automatically identifies slow routes and N+1 query problems with severity ratings
- **Grouped Route Visualization** - Routes organized by bundles/controllers for better architectural understanding
- **Usage Analytics** - Track endpoint usage with heatmaps and performance metrics (mock data included, ready for real integration)
- **HTTP Method Badges** - Instantly see which HTTP methods (GET, POST, PUT, DELETE, PATCH) each route supports
- **Developer-Friendly** - Built specifically for development environments with zero configuration

This isn't just another route listing tool - it's a comprehensive route analysis and performance monitoring dashboard that provides architectural insights no standard Symfony tool offers visually.

## Symfony Route Inspector vs Symfony Profiler

| Feature | Symfony Route Inspector | Symfony Profiler |
|---------|------------------------|------------------|
| **Route Visualization** | ✅ Interactive graph with hierarchy | ❌ No visual representation |
| **All Routes Overview** | ✅ Single dashboard view of all routes | ❌ Shows only current request's route |
| **Route Grouping** | ✅ Grouped by bundles/controllers | ❌ No grouping |
| **SQL Query Tracking** | ✅ Aggregated view across requests | ✅ Per-request only |
| **N+1 Query Detection** | ✅ Automatic detection with alerts | ⚠️ Manual inspection required |
| **Performance Issues** | ✅ Dashboard with severity ratings | ❌ Not available |
| **Route Graph** | ✅ Interactive tree with zoom/pan | ❌ Not available |
| **Search & Filter** | ✅ Advanced filtering by method, bundle, name | ❌ Limited search |
| **Dark/Light Theme** | ✅ Toggle between themes | ❌ Single theme |
| **Real-time Statistics** | ✅ Route counts, methods breakdown | ❌ Not available |
| **Zero Configuration** | ✅ Works out of the box | ✅ Built-in |
| **Export Capabilities** | ✅ SVG export for graphs | ❌ Not available |

### Why Choose Symfony Route Inspector?

**Symfony Profiler** is excellent for debugging individual requests, but **Symfony Route Inspector** provides:

1. **Complete Application Overview** - See ALL your routes at once, not just the current request
2. **Proactive Problem Detection** - Identifies N+1 queries and slow routes before they become issues
3. **Better Route Organization** - Understand your application architecture through visual grouping
4. **Performance Monitoring** - Track query performance across all endpoints in one place
5. **Modern UX** - Beautiful, intuitive interface that developers love to use
6. **Architectural Insights** - Route hierarchy visualization shows how your application is structured

**Use Both Together**: Symfony Profiler for per-request debugging + Route Inspector for application-wide route analysis and performance monitoring.

---

## Features

### Core Features
- **Interactive Route Map** - Graphical tree of all routes grouped by bundles or controllers
- **Real-Time Statistics** - Total routes, secured routes, HTTP methods breakdown
- **Advanced Filtering** - Search by name, path, controller, HTTP method, or bundle
- **Route Analytics** - Mock endpoint usage tracking with hit counts and response times (ready for production integration)
- **Security Insights** - Quickly identify secured vs public routes
- **Middleware Visualization** - See which services and middleware are attached to each route
- **Beautiful Dashboard** - Modern, dark-themed UI built with Vue.js 3

### Technical Highlights
- Zero build step required (uses CDN Vue.js)
- Fully responsive design
- Works with Symfony 7.0+ and 8.0+
- PHP 8.1+ compatible
- No database required
- Production-safe (disabled by default, only active in dev mode)

---

## Installation

Install via Composer:

```bash
composer require faizankamal/symfony-route-inspector --dev
```

If you're using Symfony Flex, the bundle will be automatically registered. Otherwise, register it manually in `config/bundles.php`:

```php
<?php

return [
    // ... other bundles
    FaizanKamal\RouteInspector\RouteInspectorBundle::class => ['dev' => true],
];
```

### Enable Routes

Add the bundle routes to your application in `config/routes/dev/route_inspector.yaml`:

```yaml
route_inspector:
    resource: '@RouteInspectorBundle/config/routes.yaml'
    prefix: /_route_inspector
```

Or configure routes directly in `config/routes.yaml`:

```yaml
# config/routes.yaml (only in dev environment)
when@dev:
    route_inspector:
        resource: '@RouteInspectorBundle/config/routes.yaml'
        prefix: /_route_inspector
```

### Configure Twig Paths

Add the bundle's template path in `config/packages/twig.yaml`:

```yaml
twig:
    paths:
        '%kernel.project_dir%/vendor/faizankamal/symfony-route-inspector/templates': RouteInspector
```

---

## Usage

### Access the Dashboard

Once installed, start your Symfony development server:

```bash
symfony server:start
```

Then visit:

```
http://localhost:8000/_route_inspector/dashboard
```

### Dashboard Tabs

#### 1. Overview
- Total routes count
- Secured routes count
- Routes grouped by HTTP method (GET, POST, PUT, DELETE, etc.)
- Routes grouped by bundle/namespace
- Visual distribution charts

#### 2. All Routes
- Complete route listing with search and filters
- Filter by HTTP method, bundle, or search query
- Detailed route information including:
  - Route name
  - Path/pattern
  - HTTP methods
  - Controller
  - Security status
  - Requirements and defaults

#### 3. By Bundle
- Routes organized by bundle/namespace
- Collapsible groups for easy navigation
- Quick overview of each bundle's endpoints

#### 4. Analytics (Mock Data)
- Top 10 most used routes
- Hit counts and average response times
- Last accessed timestamps
- Performance insights with color-coded response times
  - Green: < 100ms
  - Yellow: 100-300ms
  - Red: > 300ms

> Note: Analytics currently uses mock data. For production use, integrate with your logging/monitoring system.

---

## API Endpoints

The bundle exposes several JSON API endpoints for programmatic access:

```bash
# Get all routes
GET /_route_inspector/api/routes

# Get routes grouped by bundle
GET /_route_inspector/api/routes/grouped

# Get route tree structure
GET /_route_inspector/api/routes/tree

# Get statistics
GET /_route_inspector/api/statistics

# Get analytics (mock data)
GET /_route_inspector/api/analytics
```

### Example Response

```json
{
  "routes": [
    {
      "name": "app_home",
      "path": "/",
      "methods": ["GET"],
      "controller": "App\\Controller\\HomeController::index",
      "bundle": "App\\Controller",
      "security": null,
      "middleware": [],
      "requirements": {},
      "defaults": {
        "_controller": "App\\Controller\\HomeController::index"
      }
    }
  ]
}
```

---

## Configuration

### Security (Production Safety)

By default, the bundle is only active in the `dev` environment. To ensure it's never exposed in production:

```yaml
# config/bundles.php
return [
    // Only load in dev environment
    FaizanKamal\RouteInspector\RouteInspectorBundle::class => ['dev' => true],
];
```

### Custom Prefix

Change the route prefix if needed:

```yaml
# config/routes/dev/route_inspector.yaml
route_inspector:
    resource: '@RouteInspectorBundle/config/routes.yaml'
    prefix: /_custom_prefix  # Change this
```

---

## Extending the Bundle

### Add Real Analytics

Replace mock analytics with real tracking:

```php
// src/Service/RouteAnalyticsService.php
namespace App\Service;

use FaizanKamal\RouteInspector\Service\RouteInspectorService;

class RouteAnalyticsService
{
    public function __construct(
        private RouteInspectorService $inspector,
        private YourLoggingService $logger
    ) {}

    public function getRealAnalytics(): array
    {
        $routes = $this->inspector->getAllRoutes();
        $analytics = [];

        foreach ($routes as $route) {
            $analytics[] = [
                'name' => $route['name'],
                'path' => $route['path'],
                'hits' => $this->logger->getHitCount($route['name']),
                'avgResponseTime' => $this->logger->getAvgResponseTime($route['name']),
                'lastAccessed' => $this->logger->getLastAccess($route['name']),
            ];
        }

        return $analytics;
    }
}
```

### Custom Route Grouping

Extend the `RouteInspectorService` to customize grouping logic:

```php
namespace App\Service;

use FaizanKamal\RouteInspector\Service\RouteInspectorService;

class CustomRouteInspectorService extends RouteInspectorService
{
    protected function extractBundleName(string $controller): string
    {
        // Your custom grouping logic
        return parent::extractBundleName($controller);
    }
}
```

---

## Architecture

### File Structure

```
symfony-route-inspector/
│
├─ src/
│  ├─ Controller/
│  │  └─ DashboardController.php       # Main dashboard and API endpoints
│  ├─ Service/
│  │  └─ RouteInspectorService.php     # Core route inspection logic
│  ├─ Twig/
│  │  └─ RouteInspectorExtension.php   # Twig functions (if needed)
│  ├─ DependencyInjection/
│  │  └─ RouteInspectorExtension.php   # Service container configuration
│  └─ RouteInspectorBundle.php         # Bundle entry point
│
├─ templates/
│  └─ dashboard.html.twig              # Vue.js powered dashboard UI
│
├─ config/
│  ├─ services.yaml                    # Service definitions
│  └─ routes.yaml                      # Route configuration
│
├─ composer.json                       # Package metadata
├─ package.json                        # Frontend metadata (CDN-based, no build)
└─ README.md                           # Documentation
```

### Key Components

1. **RouteInspectorService** - Analyzes Symfony's route collection and extracts detailed metadata
2. **DashboardController** - Serves the dashboard UI and JSON API endpoints
3. **dashboard.html.twig** - Vue.js 3 application (CDN-based, no build required)
4. **RouteInspectorExtension** - Loads services and configuration

---

## Development

### Prerequisites
- PHP 8.1+
- Symfony 7.0+ or 8.0+
- Composer

### Local Development

Clone and install dependencies:

```bash
git clone https://github.com/FaizanKamal7/symfony-route-inspector.git
cd symfony-route-inspector
composer install
```

### Testing

Create a test Symfony application:

```bash
symfony new test-app
cd test-app
composer config repositories.local path ../symfony-route-inspector
composer require faizankamal/symfony-route-inspector:@dev --dev
```

Run the dev server:

```bash
symfony server:start
```

Visit `http://localhost:8000/_route_inspector/dashboard`

---

## Why This Matters for Developers

### Problem
Standard Symfony tools like `debug:router` output static text in the terminal. You can't easily:
- Visualize route relationships
- Group routes by architecture
- Identify performance bottlenecks
- Track endpoint usage
- Explore APIs interactively

### Solution
**Symfony Route Inspector** provides a visual, interactive dashboard that:
- Shows architectural insights (bundles, controllers, dependencies)
- Identifies security configurations at a glance
- Provides mock analytics ready for production integration
- Offers a beautiful, modern UI that developers actually want to use
- Requires zero configuration or build steps

---

## Roadmap

- [ ] Real-time analytics integration with Monolog
- [ ] Export route documentation as PDF/Markdown
- [ ] Route testing interface (like Postman, but integrated)
- [ ] Performance profiling integration
- [ ] GraphQL route inspection
- [ ] Route dependency graph visualization
- [ ] Custom route annotations support
- [ ] Route changelog/version tracking

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Faizan Kamal**
- Email: faizankhan619.fk@gmail.com
- GitHub: [@FaizanKamal7](https://github.com/FaizanKamal7)

---

## Support

If you find this bundle useful, please consider:
- Starring the repository ⭐
- Reporting issues on [GitHub Issues](https://github.com/FaizanKamal7/symfony-route-inspector/issues)
- Contributing improvements
- Sharing with other Symfony developers

---

## Acknowledgments

Built with:
- [Symfony](https://symfony.com) - PHP Framework
- [Vue.js 3](https://vuejs.org) - Progressive JavaScript Framework
- [Tailwind CSS](https://tailwindcss.com) concepts (inline styles)

Inspired by the need for better developer tools in the Symfony ecosystem.

---

## Frequently Asked Questions

### Is this safe for production?

No, this bundle is designed for **development only**. It's automatically disabled in production when registered with `['dev' => true]` in `config/bundles.php`.

### Do I need to build frontend assets?

No! The dashboard uses Vue.js 3 from CDN, so there's no build step required. Just install and use.

### Can I integrate real analytics?

Yes! The mock analytics can be replaced with your own logging/monitoring service. See the "Extending the Bundle" section.

### Does it work with API Platform?

Yes! It will show all routes including those generated by API Platform.

### What about custom route loaders?

The bundle works with any route loader that integrates with Symfony's routing system.

### Can I customize the UI?

Absolutely! Override the `dashboard.html.twig` template in your application or create your own frontend using the JSON API endpoints.

---

**Built with ❤️ for the Symfony community**
