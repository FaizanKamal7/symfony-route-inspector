<?php

namespace FaizanKamal\RouteInspector\Twig;

use FaizanKamal\RouteInspector\Service\RouteInspectorService;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class RouteInspectorExtension extends AbstractExtension
{
    public function __construct(
        private RouteInspectorService $inspectorService
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('route_inspector_stats', [$this, 'getStatistics']),
            new TwigFunction('route_inspector_count', [$this, 'getRouteCount']),
        ];
    }

    public function getStatistics(): array
    {
        return $this->inspectorService->getRouteStatistics();
    }

    public function getRouteCount(): int
    {
        return $this->inspectorService->getRouteStatistics()['total'];
    }
}
