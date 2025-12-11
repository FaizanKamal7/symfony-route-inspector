<?php

namespace FaizanKamal\RouteInspector\Service;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouterInterface;

class RouteInspectorService
{
    public function __construct(
        private RouterInterface $router,
        private ContainerInterface $container
    ) {
    }

    /**
     * Get all routes with detailed information
     */
    public function getAllRoutes(): array
    {
        $routes = [];
        $routeCollection = $this->router->getRouteCollection();

        foreach ($routeCollection->all() as $name => $route) {
            $routes[] = $this->extractRouteData($name, $route);
        }

        return $routes;
    }

    /**
     * Get routes grouped by controller/bundle
     */
    public function getGroupedRoutes(): array
    {
        $grouped = [];
        $routeCollection = $this->router->getRouteCollection();

        foreach ($routeCollection->all() as $name => $route) {
            $controller = $this->getControllerName($route);
            $bundle = $this->extractBundleName($controller);

            if (!isset($grouped[$bundle])) {
                $grouped[$bundle] = [
                    'name' => $bundle,
                    'routes' => [],
                ];
            }

            $grouped[$bundle]['routes'][] = $this->extractRouteData($name, $route);
        }

        return array_values($grouped);
    }

    /**
     * Get route tree structure for visualization
     */
    public function getRouteTree(): array
    {
        $tree = [];
        $routeCollection = $this->router->getRouteCollection();

        foreach ($routeCollection->all() as $name => $route) {
            $path = $route->getPath();
            $parts = array_filter(explode('/', $path));

            $this->buildTree($tree, $parts, $name, $route);
        }

        return $tree;
    }

    /**
     * Get route statistics
     */
    public function getRouteStatistics(): array
    {
        $routeCollection = $this->router->getRouteCollection();
        $stats = [
            'total' => 0,
            'byMethod' => [],
            'byBundle' => [],
            'secured' => 0,
            'withMiddleware' => 0,
        ];

        foreach ($routeCollection->all() as $name => $route) {
            $stats['total']++;

            // Count by HTTP method
            foreach ($route->getMethods() as $method) {
                $stats['byMethod'][$method] = ($stats['byMethod'][$method] ?? 0) + 1;
            }

            // Count by bundle
            $controller = $this->getControllerName($route);
            $bundle = $this->extractBundleName($controller);
            $stats['byBundle'][$bundle] = ($stats['byBundle'][$bundle] ?? 0) + 1;

            // Check if secured
            if ($this->isRouteSecured($route)) {
                $stats['secured']++;
            }
        }

        return $stats;
    }

    /**
     * Extract detailed route data
     */
    private function extractRouteData(string $name, Route $route): array
    {
        $controller = $this->getControllerName($route);

        return [
            'name' => $name,
            'path' => $route->getPath(),
            'methods' => $route->getMethods() ?: ['ANY'],
            'controller' => $controller,
            'bundle' => $this->extractBundleName($controller),
            'requirements' => $route->getRequirements(),
            'defaults' => $route->getDefaults(),
            'options' => $route->getOptions(),
            'host' => $route->getHost(),
            'schemes' => $route->getSchemes(),
            'condition' => $route->getCondition(),
            'security' => $this->extractSecurityInfo($route),
            'middleware' => $this->extractMiddleware($route),
        ];
    }

    /**
     * Get controller name from route
     */
    private function getControllerName(Route $route): string
    {
        $defaults = $route->getDefaults();

        if (isset($defaults['_controller'])) {
            return $defaults['_controller'];
        }

        return 'Unknown';
    }

    /**
     * Extract bundle name from controller
     */
    private function extractBundleName(string $controller): string
    {
        // Handle controller service notation (App\Controller\FooController::method)
        if (str_contains($controller, '\\')) {
            $parts = explode('\\', $controller);

            // Try to get bundle name (usually second part like "App" or "FooBundle")
            if (count($parts) >= 2) {
                return $parts[0] . '\\' . $parts[1];
            }

            return $parts[0] ?? 'Unknown';
        }

        // Handle service notation (foo.controller:indexAction)
        if (str_contains($controller, ':')) {
            $parts = explode(':', $controller);
            return explode('.', $parts[0])[0] ?? 'Unknown';
        }

        return 'Core';
    }

    /**
     * Extract security information
     */
    private function extractSecurityInfo(Route $route): ?array
    {
        $defaults = $route->getDefaults();

        if (isset($defaults['_firewall'])) {
            return [
                'firewall' => $defaults['_firewall'],
                'roles' => $defaults['_roles'] ?? [],
            ];
        }

        return null;
    }

    /**
     * Check if route is secured
     */
    private function isRouteSecured(Route $route): bool
    {
        $defaults = $route->getDefaults();
        return isset($defaults['_firewall']) || isset($defaults['_roles']);
    }

    /**
     * Extract middleware information
     */
    private function extractMiddleware(Route $route): array
    {
        $middleware = [];
        $options = $route->getOptions();

        if (isset($options['middleware'])) {
            $middleware = (array) $options['middleware'];
        }

        return $middleware;
    }

    /**
     * Build tree structure from path parts
     */
    private function buildTree(array &$tree, array $parts, string $name, Route $route): void
    {
        if (empty($parts)) {
            return;
        }

        $current = array_shift($parts);
        $key = $current;

        if (!isset($tree[$key])) {
            $tree[$key] = [
                'segment' => $current,
                'children' => [],
                'routes' => [],
            ];
        }

        if (empty($parts)) {
            $tree[$key]['routes'][] = [
                'name' => $name,
                'path' => $route->getPath(),
                'methods' => $route->getMethods() ?: ['ANY'],
            ];
        } else {
            $this->buildTree($tree[$key]['children'], $parts, $name, $route);
        }
    }

    /**
     * Mock usage analytics (can be replaced with real tracking later)
     */
    public function getMockAnalytics(): array
    {
        $routes = $this->getAllRoutes();
        $analytics = [];

        foreach ($routes as $route) {
            $analytics[] = [
                'name' => $route['name'],
                'path' => $route['path'],
                'hits' => rand(0, 1000),
                'avgResponseTime' => rand(10, 500),
                'lastAccessed' => (new \DateTime())->modify('-' . rand(1, 30) . ' days'),
            ];
        }

        // Sort by hits
        usort($analytics, fn($a, $b) => $b['hits'] <=> $a['hits']);

        return $analytics;
    }
}
