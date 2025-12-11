@echo off
echo ============================================
echo Setting up test Symfony application...
echo ============================================
echo.

cd ..

REM Create test app if it doesn't exist
if not exist "test-app" (
    echo Creating new Symfony application...
    symfony new test-app
    if errorlevel 1 (
        echo Symfony CLI not found, using Composer...
        composer create-project symfony/skeleton:^7.0 test-app
    )
)

cd test-app

echo.
echo Adding local repository...
composer config repositories.route-inspector path "../symfony-route-inspector"

echo.
echo Requiring bundle...
composer require faizankamal/symfony-route-inspector:@dev --dev

echo.
echo Creating configuration directories...
if not exist "config\routes\dev" mkdir config\routes\dev

echo.
echo Configuring bundle...

REM Update bundles.php
echo ^<?php > config\bundles.php
echo. >> config\bundles.php
echo return [ >> config\bundles.php
echo     Symfony\Bundle\FrameworkBundle\FrameworkBundle::class =^> ['all' =^> true], >> config\bundles.php
echo     Symfony\Bundle\TwigBundle\TwigBundle::class =^> ['all' =^> true], >> config\bundles.php
echo     FaizanKamal\RouteInspector\RouteInspectorBundle::class =^> ['dev' =^> true], >> config\bundles.php
echo ]; >> config\bundles.php

REM Configure Twig
echo twig: > config\packages\twig.yaml
echo     default_path: '%%kernel.project_dir%%/templates' >> config\packages\twig.yaml
echo     paths: >> config\packages\twig.yaml
echo         '%%kernel.project_dir%%/vendor/faizankamal/symfony-route-inspector/templates': RouteInspector >> config\packages\twig.yaml

REM Add routes
echo route_inspector: > config\routes\dev\route_inspector.yaml
echo     resource: '@RouteInspectorBundle/config/routes.yaml' >> config\routes\dev\route_inspector.yaml
echo     prefix: /_route_inspector >> config\routes\dev\route_inspector.yaml

REM Create sample controller
if not exist "src\Controller" mkdir src\Controller

echo ^<?php > src\Controller\HomeController.php
echo. >> src\Controller\HomeController.php
echo namespace App\Controller; >> src\Controller\HomeController.php
echo. >> src\Controller\HomeController.php
echo use Symfony\Bundle\FrameworkBundle\Controller\AbstractController; >> src\Controller\HomeController.php
echo use Symfony\Component\HttpFoundation\Response; >> src\Controller\HomeController.php
echo use Symfony\Component\Routing\Attribute\Route; >> src\Controller\HomeController.php
echo. >> src\Controller\HomeController.php
echo class HomeController extends AbstractController >> src\Controller\HomeController.php
echo { >> src\Controller\HomeController.php
echo     #[Route('/', name: 'app_home')] >> src\Controller\HomeController.php
echo     public function index(): Response >> src\Controller\HomeController.php
echo     { >> src\Controller\HomeController.php
echo         return new Response('^<html^>^<body^>^<h1^>Test App^</h1^>^<p^>^<a href="/_route_inspector/dashboard"^>View Route Inspector^</a^>^</p^>^</body^>^</html^>'); >> src\Controller\HomeController.php
echo     } >> src\Controller\HomeController.php
echo. >> src\Controller\HomeController.php
echo     #[Route('/api/users', name: 'api_users', methods: ['GET'])] >> src\Controller\HomeController.php
echo     public function users(): Response >> src\Controller\HomeController.php
echo     { >> src\Controller\HomeController.php
echo         return $this-^>json(['users' =^> []]); >> src\Controller\HomeController.php
echo     } >> src\Controller\HomeController.php
echo. >> src\Controller\HomeController.php
echo     #[Route('/api/users', name: 'api_create_user', methods: ['POST'])] >> src\Controller\HomeController.php
echo     public function createUser(): Response >> src\Controller\HomeController.php
echo     { >> src\Controller\HomeController.php
echo         return $this-^>json(['success' =^> true]); >> src\Controller\HomeController.php
echo     } >> src\Controller\HomeController.php
echo } >> src\Controller\HomeController.php

echo.
echo Installing assets...
php bin\console assets:install --symlink public

echo.
echo ============================================
echo Setup complete!
echo ============================================
echo.
echo To start the server:
echo   cd test-app
echo   symfony server:start
echo.
echo   OR
echo.
echo   php -S localhost:8000 -t public
echo.
echo Then visit: http://localhost:8000/_route_inspector/dashboard
echo.
pause
