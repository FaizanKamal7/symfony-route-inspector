<?php

namespace FaizanKamal\RouteInspector\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Contracts\Cache\CacheInterface;

/**
 * Tracks route performance metrics in real-time
 */
class RoutePerformanceSubscriber implements EventSubscriberInterface
{
    private array $requestStartTimes = [];

    public function __construct(
        private ?CacheInterface $cache = null
    ) {
        // Use filesystem cache if no cache provided
        if (!$this->cache) {
            $this->cache = new FilesystemAdapter('route_inspector', 0, sys_get_temp_dir());
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 0],
            KernelEvents::RESPONSE => ['onKernelResponse', 0],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $requestId = spl_object_hash($request);

        // Store the start time for this request
        $this->requestStartTimes[$requestId] = microtime(true);
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $requestId = spl_object_hash($request);

        // Skip if we don't have a start time (shouldn't happen)
        if (!isset($this->requestStartTimes[$requestId])) {
            return;
        }

        // Get route name
        $routeName = $request->attributes->get('_route');
        if (!$routeName) {
            return; // Skip requests without routes
        }

        // Skip route inspector's own routes
        if (str_starts_with($routeName, 'route_inspector_')) {
            return;
        }

        // Calculate response time
        $startTime = $this->requestStartTimes[$requestId];
        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        // Get existing data for this route
        $cacheKey = 'route_performance_' . md5($routeName);
        $routeData = $this->cache->get($cacheKey, function() use ($request, $routeName) {
            return [
                'name' => $routeName,
                'path' => $request->getPathInfo(),
                'hits' => 0,
                'totalResponseTime' => 0,
                'avgResponseTime' => 0,
                'minResponseTime' => PHP_FLOAT_MAX,
                'maxResponseTime' => 0,
                'lastAccessed' => null,
                'history' => [], // Store last 100 response times
            ];
        });

        // Update metrics
        $routeData['hits']++;
        $routeData['totalResponseTime'] += $responseTime;
        $routeData['avgResponseTime'] = $routeData['totalResponseTime'] / $routeData['hits'];
        $routeData['minResponseTime'] = min($routeData['minResponseTime'], $responseTime);
        $routeData['maxResponseTime'] = max($routeData['maxResponseTime'], $responseTime);
        $routeData['lastAccessed'] = (new \DateTime())->format('Y-m-d H:i:s');

        // Store response time history (keep last 100)
        $routeData['history'][] = [
            'time' => $responseTime,
            'timestamp' => time(),
        ];
        if (count($routeData['history']) > 100) {
            array_shift($routeData['history']);
        }

        // Save updated data
        $this->cache->delete($cacheKey);
        $this->cache->get($cacheKey, fn() => $routeData);

        // Clean up
        unset($this->requestStartTimes[$requestId]);
    }
}
