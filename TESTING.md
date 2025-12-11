# Testing & Development Guide

## Quick Start - See Your Bundle in Action

### Option 1: Quick Test (Recommended for First Time)

1. **Create a test Symfony application** (in a separate directory):

```bash
# Navigate to parent directory
cd "d:\Software And Games (E)\Side Hustles"

# Create new Symfony app
symfony new test-app
# OR using composer
composer create-project symfony/skeleton test-app

cd test-app
```

2. **Link your bundle as a local repository**:

```bash
# Add your bundle as a local Composer repository
composer config repositories.route-inspector path "../symfony-route-inspector"

# Require your bundle
composer require faizankamal/symfony-route-inspector:@dev --dev
```

3. **Register the bundle** in `config/bundles.php`:

```php
<?php

return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    // ... other bundles
    FaizanKamal\RouteInspector\RouteInspectorBundle::class => ['dev' => true],
];
```

4. **Configure Twig paths** in `config/packages/twig.yaml`:

```yaml
twig:
    default_path: '%kernel.project_dir%/templates'
    paths:
        '%kernel.project_dir%/vendor/faizankamal/symfony-route-inspector/templates': RouteInspector
```

5. **Add bundle routes** in `config/routes/dev/route_inspector.yaml`:

```yaml
# Create this file: config/routes/dev/route_inspector.yaml
route_inspector:
    resource: '@RouteInspectorBundle/config/routes.yaml'
    prefix: /_route_inspector
```

6. **Install assets**:

```bash
php bin/console assets:install --symlink public
```

7. **Start the server**:

```bash
symfony server:start
# OR
php -S localhost:8000 -t public
```

8. **Visit the dashboard**:

```
http://localhost:8000/_route_inspector/dashboard
```

---

## Option 2: Use the Setup Script (Faster)

I'll create a script that does all of this automatically.

Create `setup-test-app.sh` (or `.bat` for Windows):

```bash
#!/bin/bash

echo "Setting up test Symfony application..."

# Navigate to parent directory
cd ..

# Create test app
if [ ! -d "test-app" ]; then
    symfony new test-app
    cd test-app
else
    cd test-app
fi

# Add local repository
composer config repositories.route-inspector path "../symfony-route-inspector"

# Require bundle
composer require faizankamal/symfony-route-inspector:@dev --dev

# Create directories
mkdir -p config/routes/dev

# Add bundle to config/bundles.php
echo "Adding bundle to config/bundles.php..."
cat > config/bundles.php << 'EOF'
<?php

return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Symfony\Bundle\TwigBundle\TwigBundle::class => ['all' => true],
    Symfony\Bundle\MonologBundle\MonologBundle::class => ['all' => true],
    Symfony\Bundle\DebugBundle\DebugBundle::class => ['dev' => true],
    Symfony\Bundle\WebProfilerBundle\WebProfilerBundle::class => ['dev' => true],
    FaizanKamal\RouteInspector\RouteInspectorBundle::class => ['dev' => true],
];
EOF

# Configure Twig paths
cat > config/packages/twig.yaml << 'EOF'
twig:
    default_path: '%kernel.project_dir%/templates'
    paths:
        '%kernel.project_dir%/vendor/faizankamal/symfony-route-inspector/templates': RouteInspector
EOF

# Add routes
cat > config/routes/dev/route_inspector.yaml << 'EOF'
route_inspector:
    resource: '@RouteInspectorBundle/config/routes.yaml'
    prefix: /_route_inspector
EOF

# Install assets
php bin/console assets:install --symlink public

# Create a sample controller for testing
mkdir -p src/Controller
cat > src/Controller/HomeController.php << 'EOF'
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        return new Response('<html><body><h1>Test App</h1><p><a href="/_route_inspector/dashboard">View Route Inspector</a></p></body></html>');
    }

    #[Route('/api/users', name: 'api_users', methods: ['GET'])]
    public function users(): Response
    {
        return $this->json(['users' => []]);
    }

    #[Route('/api/users', name: 'api_create_user', methods: ['POST'])]
    public function createUser(): Response
    {
        return $this->json(['success' => true]);
    }
}
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  cd test-app"
echo "  symfony server:start"
echo ""
echo "Then visit: http://localhost:8000/_route_inspector/dashboard"
```

---

## Development Workflow

### Making Changes to Your Bundle

1. **Edit files in your bundle** (`symfony-route-inspector/`)
2. **Changes are immediately reflected** (symlinked via Composer)
3. **Refresh browser** to see updates

### Hot Reloading Assets

For JavaScript/CSS changes:

```bash
# In test-app directory
php bin/console cache:clear
php bin/console assets:install --symlink public
```

Or just refresh the browser (assets are symlinked).

### Debugging

1. **Check Symfony logs**:
```bash
tail -f test-app/var/log/dev.log
```

2. **Enable debug toolbar** (should be on by default in dev mode)

3. **Check route registration**:
```bash
cd test-app
php bin/console debug:router | grep route_inspector
```

Expected output:
```
route_inspector_dashboard              ANY      ANY      ANY    /_route_inspector/dashboard
route_inspector_api_routes            GET      ANY      ANY    /_route_inspector/api/routes
route_inspector_api_routes_grouped    GET      ANY      ANY    /_route_inspector/api/routes/grouped
...
```

---

## Testing Different Scenarios

### Add More Sample Routes

Edit `test-app/src/Controller/HomeController.php`:

```php
#[Route('/admin/dashboard', name: 'admin_dashboard')]
public function adminDashboard(): Response
{
    return new Response('Admin Dashboard');
}

#[Route('/api/products/{id}', name: 'api_product_detail', methods: ['GET', 'PUT', 'DELETE'])]
public function productDetail(int $id): Response
{
    return $this->json(['id' => $id]);
}
```

Refresh the Route Inspector to see new routes.

### Test with Security

Add security bundle:

```bash
cd test-app
composer require symfony/security-bundle
```

Configure security and add secured routes to test the "secured routes" feature.

---

## Common Issues & Solutions

### Issue: Assets not loading

**Solution:**
```bash
cd test-app
php bin/console cache:clear
php bin/console assets:install --symlink public
```

### Issue: Routes not showing up

**Solution:**
Check that routes are registered:
```bash
php bin/console debug:router
```

### Issue: Twig template not found

**Solution:**
Verify Twig paths in `config/packages/twig.yaml`:
```yaml
twig:
    paths:
        '%kernel.project_dir%/vendor/faizankamal/symfony-route-inspector/templates': RouteInspector
```

### Issue: Bundle not registered

**Solution:**
Check `config/bundles.php` includes:
```php
FaizanKamal\RouteInspector\RouteInspectorBundle::class => ['dev' => true],
```

---

## Rapid Development Tips

### 1. Use Browser DevTools
- Open Chrome/Firefox DevTools
- Check Console for JavaScript errors
- Use Network tab to debug API calls

### 2. Edit CSS in Browser
- Make changes in browser DevTools
- Copy changes to `public/dashboard.css`
- Refresh to persist

### 3. Watch for Changes
You can use a file watcher to auto-refresh:

```bash
# Install browser-sync (optional)
npm install -g browser-sync

# Watch files and auto-reload
browser-sync start --proxy "localhost:8000" --files "symfony-route-inspector/**/*"
```

### 4. Use Vue DevTools
Install Vue DevTools browser extension:
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org/en-US/firefox/

Then inspect Vue components in browser.

---

## Visual Improvements Checklist

Once you see the dashboard, you can improve:

- [ ] Color scheme and branding
- [ ] Add route filters (by method, by bundle)
- [ ] Add route search functionality
- [ ] Improve mobile responsiveness
- [ ] Add dark/light theme toggle
- [ ] Add route dependency visualization
- [ ] Add export functionality (PDF, CSV)
- [ ] Improve loading states
- [ ] Add animations and transitions
- [ ] Add tooltips and help text

---

## Next Steps

1. Run the setup script or follow manual steps
2. Visit `http://localhost:8000/_route_inspector/dashboard`
3. Make changes to CSS/JS in your bundle
4. Refresh browser to see changes
5. Iterate and improve!

Happy coding! 🚀
