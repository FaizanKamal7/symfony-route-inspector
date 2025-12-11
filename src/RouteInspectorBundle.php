<?php

namespace FaizanKamal\RouteInspector;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class RouteInspectorBundle extends Bundle
{
    public function getPath(): string
    {
        return \dirname(__DIR__);
    }
}
