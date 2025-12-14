/**
 * Route Hierarchy Builder Service
 * Converts flat route list into hierarchical tree structure for visualization
 */

export class RouteHierarchyBuilder {
  /**
   * Build hierarchical tree from flat routes array
   * @param {Array} routes - Array of route objects
   * @returns {Object} Hierarchical tree structure
   */
  build(routes) {
    const root = {
      name: "localhost:8080",
      children: [],
    };

    const pathMap = new Map();
    pathMap.set("/", root);

    routes.forEach((route) => {
      this.addRouteToTree(route, root, pathMap);
    });

    return root;
  }

  /**
   * Add a single route to the tree
   * @param {Object} route - Route object
   * @param {Object} root - Root node
   * @param {Map} pathMap - Map of paths to nodes
   */
  addRouteToTree(route, root, pathMap) {
    const parts = route.path.split("/").filter((p) => p);
    let currentPath = "";
    let parent = root;

    // Handle root path "/"
    if (parts.length === 0) {
      root.children.push({
        name: "/",
        path: "/",
        isEndpoint: true,
        routeName: route.name,
        methods: route.methods,
        controller: route.controller,
        children: [],
      });
      return;
    }

    // Build hierarchy from path parts
    parts.forEach((part, index) => {
      currentPath += "/" + part;

      if (!pathMap.has(currentPath)) {
        const isLastPart = index === parts.length - 1;
        const node = this.createNode(part, currentPath, isLastPart, route);

        parent.children.push(node);
        pathMap.set(currentPath, node);
        parent = node;
      } else {
        parent = pathMap.get(currentPath);
      }
    });
  }

  /**
   * Create a tree node
   * @param {string} name - Node name (path segment)
   * @param {string} path - Full path to this node
   * @param {boolean} isEndpoint - Whether this is a route endpoint
   * @param {Object} route - Route object (if endpoint)
   * @returns {Object} Tree node
   */
  createNode(name, path, isEndpoint, route) {
    const node = {
      name,
      path,
      isEndpoint,
      children: [],
    };

    if (isEndpoint) {
      node.routeName = route.name;
      node.methods = route.methods;
      node.controller = route.controller;
    }

    return node;
  }
}
