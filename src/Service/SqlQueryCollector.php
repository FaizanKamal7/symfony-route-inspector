<?php

namespace FaizanKamal\RouteInspector\Service;

use Symfony\Component\HttpKernel\Profiler\Profiler;

/**
 * Collects SQL queries executed during requests
 */
class SqlQueryCollector
{
    public function __construct(
        private ?Profiler $profiler = null
    ) {
    }

    /**
     * Get queries from recent requests
     */
    public function getQueriesForCurrentRequest(): array
    {
        if (!$this->profiler) {
            return [];
        }

        // Get the last 10 profiles to find one with DB queries
        $profiles = $this->profiler->find('', '', 10, '', '', '');

        if (empty($profiles)) {
            return [];
        }

        // Look through recent profiles to find one with DB queries
        foreach ($profiles as $profileData) {
            $profile = $this->profiler->loadProfile($profileData['token']);

            if (!$profile || !$profile->hasCollector('db')) {
                continue;
            }

            $collector = $profile->getCollector('db');

            // Check if the collector has the getQueries method
            if (!method_exists($collector, 'getQueries')) {
                continue;
            }

            $profileQueries = $collector->getQueries();

            // If this profile has queries, return them
            if (!empty($profileQueries)) {
                $queries = [];
                foreach ($profileQueries as $query) {
                    $queries[] = [
                        'sql' => $query['sql'] ?? '',
                        'params' => $query['params'] ?? [],
                        'types' => $query['types'] ?? [],
                        'executionMS' => $query['executionMS'] ?? 0,
                        'explainable' => $query['explainable'] ?? false,
                        'isSlow' => ($query['executionMS'] ?? 0) > 100, // >100ms is slow
                        'route' => $profileData['url'] ?? '',
                    ];
                }
                return $queries;
            }
        }

        return [];
    }

    /**
     * Get query statistics
     */
    public function getQueryStats(): array
    {
        if (!$this->profiler) {
            return [
                'totalQueries' => 0,
                'totalTime' => 0,
                'slowQueries' => 0,
                'duplicateQueries' => 0,
            ];
        }

        // Get the last 10 profiles to find one with DB queries
        $profiles = $this->profiler->find('', '', 10, '', '', '');

        if (empty($profiles)) {
            return [
                'totalQueries' => 0,
                'totalTime' => 0,
                'slowQueries' => 0,
                'duplicateQueries' => 0,
            ];
        }

        // Look through recent profiles to find one with DB queries
        foreach ($profiles as $profileData) {
            $profile = $this->profiler->loadProfile($profileData['token']);

            if (!$profile || !$profile->hasCollector('db')) {
                continue;
            }

            $collector = $profile->getCollector('db');

            // Check if the collector has the getQueries method
            if (!method_exists($collector, 'getQueries')) {
                continue;
            }

            $queries = $collector->getQueries();

            // If this profile has queries, calculate stats
            if (!empty($queries)) {
                $totalTime = 0;
                $slowQueries = 0;
                $querySignatures = [];
                $duplicates = 0;

                foreach ($queries as $query) {
                    $time = $query['executionMS'] ?? 0;
                    $totalTime += $time;

                    if ($time > 100) {
                        $slowQueries++;
                    }

                    // Check for duplicate queries
                    $signature = $query['sql'] ?? '';
                    if (isset($querySignatures[$signature])) {
                        $duplicates++;
                    }
                    $querySignatures[$signature] = true;
                }

                return [
                    'totalQueries' => count($queries),
                    'totalTime' => round($totalTime, 2),
                    'slowQueries' => $slowQueries,
                    'duplicateQueries' => $duplicates,
                ];
            }
        }

        return [
            'totalQueries' => 0,
            'totalTime' => 0,
            'slowQueries' => 0,
            'duplicateQueries' => 0,
        ];
    }

    /**
     * Detect N+1 query problems
     * Returns array of routes with potential N+1 issues
     */
    public function detectNPlusOneQueries(): array
    {
        if (!$this->profiler) {
            return [];
        }

        $profiles = $this->profiler->find('', '', 50, '', '', '');
        $nPlusOneIssues = [];

        foreach ($profiles as $profileData) {
            $profile = $this->profiler->loadProfile($profileData['token']);

            if (!$profile || !$profile->hasCollector('db')) {
                continue;
            }

            $collector = $profile->getCollector('db');

            if (!method_exists($collector, 'getQueries')) {
                continue;
            }

            $queries = $collector->getQueries();

            if (empty($queries)) {
                continue;
            }

            // Detect N+1 by finding similar queries executed multiple times
            $queryPatterns = [];
            foreach ($queries as $query) {
                // Normalize query by removing specific values
                $normalizedSql = preg_replace('/\b\d+\b/', '?', $query['sql'] ?? '');
                $normalizedSql = preg_replace("/'[^']*'/", '?', $normalizedSql);

                if (!isset($queryPatterns[$normalizedSql])) {
                    $queryPatterns[$normalizedSql] = [
                        'count' => 0,
                        'totalTime' => 0,
                        'example' => $query['sql'] ?? '',
                    ];
                }

                $queryPatterns[$normalizedSql]['count']++;
                $queryPatterns[$normalizedSql]['totalTime'] += $query['executionMS'] ?? 0;
            }

            // Find patterns that appear more than 5 times (likely N+1)
            foreach ($queryPatterns as $pattern => $data) {
                if ($data['count'] > 5) {
                    $nPlusOneIssues[] = [
                        'route' => $profileData['url'] ?? 'Unknown',
                        'method' => $profileData['method'] ?? 'GET',
                        'queryPattern' => $data['example'],
                        'occurrences' => $data['count'],
                        'totalTime' => round($data['totalTime'], 2),
                        'avgTime' => round($data['totalTime'] / $data['count'], 2),
                    ];
                }
            }
        }

        // Sort by occurrences (most problematic first)
        usort($nPlusOneIssues, fn($a, $b) => $b['occurrences'] <=> $a['occurrences']);

        return array_slice($nPlusOneIssues, 0, 10); // Return top 10
    }

    /**
     * Get queries grouped by route
     * This would require session/cache storage to work across requests
     */
    public function getQueriesByRoute(): array
    {
        // TODO: Implement persistent storage
        // For now, return empty array
        // This will be implemented in Phase 2
        return [];
    }

    /**
     * Check if profiler is available
     */
    public function isEnabled(): bool
    {
        return $this->profiler !== null;
    }
}
