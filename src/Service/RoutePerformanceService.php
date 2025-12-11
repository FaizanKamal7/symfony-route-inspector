<?php

namespace FaizanKamal\RouteInspector\Service;

use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Contracts\Cache\CacheInterface;

/**
 * Service to retrieve route performance metrics
 */
class RoutePerformanceService
{
    public function __construct(
        private ?CacheInterface $cache = null,
        private ?RouteInspectorService $routeInspectorService = null
    ) {
        // Use filesystem cache if no cache provided
        if (!$this->cache) {
            $this->cache = new FilesystemAdapter('route_inspector', 0, sys_get_temp_dir());
        }
    }

    /**
     * Get performance data for all routes
     */
    public function getAllRoutePerformance(): array
    {
        $routes = $this->routeInspectorService?->getAllRoutes() ?? [];
        $performanceData = [];

        foreach ($routes as $route) {
            $cacheKey = 'route_performance_' . md5($route['name']);

            try {
                $data = $this->cache->get($cacheKey, function() {
                    return null;
                });

                if ($data) {
                    $performanceData[] = $data;
                }
            } catch (\Exception $e) {
                // Skip if cache read fails
                continue;
            }
        }

        // Sort by hits (most popular first)
        usort($performanceData, fn($a, $b) => $b['hits'] <=> $a['hits']);

        return $performanceData;
    }

    /**
     * Get performance data for a specific route
     */
    public function getRoutePerformance(string $routeName): ?array
    {
        $cacheKey = 'route_performance_' . md5($routeName);

        try {
            return $this->cache->get($cacheKey, function() {
                return null;
            });
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get top N routes by hits
     */
    public function getTopRoutes(int $limit = 10): array
    {
        $allPerformance = $this->getAllRoutePerformance();
        return array_slice($allPerformance, 0, $limit);
    }

    /**
     * Get slowest routes
     */
    public function getSlowestRoutes(int $limit = 10): array
    {
        $allPerformance = $this->getAllRoutePerformance();

        // Sort by average response time (slowest first)
        usort($allPerformance, fn($a, $b) => $b['avgResponseTime'] <=> $a['avgResponseTime']);

        return array_slice($allPerformance, 0, $limit);
    }

    /**
     * Clear all performance data
     */
    public function clearPerformanceData(): void
    {
        $routes = $this->routeInspectorService?->getAllRoutes() ?? [];

        foreach ($routes as $route) {
            $cacheKey = 'route_performance_' . md5($route['name']);
            $this->cache->delete($cacheKey);
        }
    }

    /**
     * Get routes with performance issues (slow routes)
     * Returns routes where avg response time > 500ms
     */
    public function getSlowRoutes(int $threshold = 500): array
    {
        $allPerformance = $this->getAllRoutePerformance();
        $slowRoutes = [];

        foreach ($allPerformance as $route) {
            if ($route['avgResponseTime'] > $threshold) {
                $slowRoutes[] = [
                    'name' => $route['name'],
                    'path' => $route['path'],
                    'avgResponseTime' => round($route['avgResponseTime'], 2),
                    'maxResponseTime' => round($route['maxResponseTime'], 2),
                    'minResponseTime' => round($route['minResponseTime'], 2),
                    'hits' => $route['hits'],
                    'severity' => $this->calculateSeverity($route['avgResponseTime']),
                ];
            }
        }

        // Sort by severity and response time
        usort($slowRoutes, fn($a, $b) => $b['avgResponseTime'] <=> $a['avgResponseTime']);

        return $slowRoutes;
    }

    /**
     * Calculate severity level based on response time
     */
    private function calculateSeverity(float $responseTime): string
    {
        if ($responseTime > 2000) {
            return 'critical'; // > 2s
        } elseif ($responseTime > 1000) {
            return 'high'; // > 1s
        } elseif ($responseTime > 500) {
            return 'medium'; // > 500ms
        }
        return 'low';
    }

    /**
     * Get performance summary statistics
     */
    public function getPerformanceSummary(): array
    {
        $allPerformance = $this->getAllRoutePerformance();

        if (empty($allPerformance)) {
            return [
                'totalTrackedRoutes' => 0,
                'totalRequests' => 0,
                'averageResponseTime' => 0,
                'slowestRoute' => null,
                'fastestRoute' => null,
                'mostPopularRoute' => null,
            ];
        }

        $totalRequests = array_sum(array_column($allPerformance, 'hits'));
        $avgResponseTimes = array_column($allPerformance, 'avgResponseTime');
        $overallAvg = array_sum($avgResponseTimes) / count($avgResponseTimes);

        // Find slowest route
        $slowest = array_reduce($allPerformance, function($carry, $item) {
            return (!$carry || $item['avgResponseTime'] > $carry['avgResponseTime']) ? $item : $carry;
        });

        // Find fastest route (with at least 1 hit)
        $fastest = array_reduce($allPerformance, function($carry, $item) {
            return (!$carry || $item['avgResponseTime'] < $carry['avgResponseTime']) ? $item : $carry;
        });

        // Most popular is already first (sorted by hits)
        $mostPopular = $allPerformance[0] ?? null;

        return [
            'totalTrackedRoutes' => count($allPerformance),
            'totalRequests' => $totalRequests,
            'averageResponseTime' => round($overallAvg, 2),
            'slowestRoute' => $slowest ? [
                'name' => $slowest['name'],
                'avgResponseTime' => round($slowest['avgResponseTime'], 2),
            ] : null,
            'fastestRoute' => $fastest ? [
                'name' => $fastest['name'],
                'avgResponseTime' => round($fastest['avgResponseTime'], 2),
            ] : null,
            'mostPopularRoute' => $mostPopular ? [
                'name' => $mostPopular['name'],
                'hits' => $mostPopular['hits'],
            ] : null,
        ];
    }
}
