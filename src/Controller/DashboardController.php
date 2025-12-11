<?php

namespace FaizanKamal\RouteInspector\Controller;

use FaizanKamal\RouteInspector\Service\RouteInspectorService;
use FaizanKamal\RouteInspector\Service\SqlQueryCollector;
use FaizanKamal\RouteInspector\Service\RoutePerformanceService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DashboardController extends AbstractController
{
    public function __construct(
        private RouteInspectorService $inspectorService,
        private SqlQueryCollector $sqlQueryCollector,
        private RoutePerformanceService $performanceService
    ) {
    }

    #[Route('/_route_inspector/dashboard', name: 'route_inspector_dashboard')]
    public function dashboard(): Response
    {
        return $this->render('@RouteInspector/dashboard.html.twig', [
            'title' => 'Symfony Route Inspector',
        ]);
    }

    #[Route('/_route_inspector/api/routes', name: 'route_inspector_api_routes', methods: ['GET'])]
    public function routes(): JsonResponse
    {
        return $this->json([
            'routes' => $this->inspectorService->getAllRoutes(),
        ]);
    }

    #[Route('/_route_inspector/api/routes/grouped', name: 'route_inspector_api_routes_grouped', methods: ['GET'])]
    public function routesGrouped(): JsonResponse
    {
        return $this->json([
            'groups' => $this->inspectorService->getGroupedRoutes(),
        ]);
    }

    #[Route('/_route_inspector/api/routes/tree', name: 'route_inspector_api_routes_tree', methods: ['GET'])]
    public function routesTree(): JsonResponse
    {
        return $this->json([
            'tree' => $this->inspectorService->getRouteTree(),
        ]);
    }

    #[Route('/_route_inspector/api/statistics', name: 'route_inspector_api_statistics', methods: ['GET'])]
    public function statistics(): JsonResponse
    {
        return $this->json([
            'stats' => $this->inspectorService->getRouteStatistics(),
        ]);
    }

    #[Route('/_route_inspector/api/analytics', name: 'route_inspector_api_analytics', methods: ['GET'])]
    public function analytics(): JsonResponse
    {
        $realData = $this->performanceService->getTopRoutes(10);

        // If no real data yet, use mock data
        if (empty($realData)) {
            return $this->json([
                'analytics' => $this->inspectorService->getMockAnalytics(),
                'isRealData' => false,
            ]);
        }

        return $this->json([
            'analytics' => $realData,
            'isRealData' => true,
        ]);
    }

    #[Route('/_route_inspector/api/performance/summary', name: 'route_inspector_api_performance_summary', methods: ['GET'])]
    public function performanceSummary(): JsonResponse
    {
        return $this->json($this->performanceService->getPerformanceSummary());
    }

    #[Route('/_route_inspector/api/performance/slowest', name: 'route_inspector_api_performance_slowest', methods: ['GET'])]
    public function slowestRoutes(): JsonResponse
    {
        return $this->json([
            'routes' => $this->performanceService->getSlowestRoutes(10),
        ]);
    }

    #[Route('/_route_inspector/api/sql/queries', name: 'route_inspector_api_sql_queries', methods: ['GET'])]
    public function sqlQueries(): JsonResponse
    {
        if (!$this->sqlQueryCollector->isEnabled()) {
            return $this->json([
                'enabled' => false,
                'message' => 'SQL query collection requires Symfony Profiler to be enabled in dev mode.',
                'queries' => [],
                'stats' => [],
            ]);
        }

        return $this->json([
            'enabled' => true,
            'queries' => $this->sqlQueryCollector->getQueriesForCurrentRequest(),
            'stats' => $this->sqlQueryCollector->getQueryStats(),
        ]);
    }

    #[Route('/_route_inspector/api/sql/stats', name: 'route_inspector_api_sql_stats', methods: ['GET'])]
    public function sqlStats(): JsonResponse
    {
        if (!$this->sqlQueryCollector->isEnabled()) {
            return $this->json([
                'enabled' => false,
                'totalQueries' => 0,
                'totalTime' => 0,
                'slowQueries' => 0,
                'duplicateQueries' => 0,
            ]);
        }

        return $this->json([
            'enabled' => true,
            ...$this->sqlQueryCollector->getQueryStats(),
        ]);
    }

    #[Route('/_route_inspector/api/performance-issues', name: 'route_inspector_api_performance_issues', methods: ['GET'])]
    public function performanceIssues(): JsonResponse
    {
        $slowRoutes = $this->performanceService->getSlowRoutes(500);
        $nPlusOneIssues = $this->sqlQueryCollector->isEnabled()
            ? $this->sqlQueryCollector->detectNPlusOneQueries()
            : [];

        return $this->json([
            'slowRoutes' => $slowRoutes,
            'nPlusOneIssues' => $nPlusOneIssues,
            'summary' => [
                'totalSlowRoutes' => count($slowRoutes),
                'totalNPlusOneIssues' => count($nPlusOneIssues),
                'criticalIssues' => count(array_filter($slowRoutes, fn($r) => $r['severity'] === 'critical')),
                'highIssues' => count(array_filter($slowRoutes, fn($r) => $r['severity'] === 'high')),
            ],
        ]);
    }
}
