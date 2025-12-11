/**
 * Route Graph Visualization using D3.js
 * Displays routes in a hierarchical tree/graph structure
 */

export function initRouteGraph(containerId, routes) {
    // Build hierarchical structure from routes
    const hierarchyData = buildRouteHierarchy(routes);

    // Create SVG container
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = 800;

    // Clear any existing content
    container.innerHTML = '';

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'var(--bg-secondary)')
        .style('border-radius', '8px');

    const g = svg.append('g')
        .attr('transform', `translate(40, 40)`);

    // Create tree layout
    const tree = d3.tree()
        .size([height - 80, width - 200]);

    const root = d3.hierarchy(hierarchyData);
    tree(root);

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Add links (edges)
    g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x))
        .style('fill', 'none')
        .style('stroke', 'var(--border-color)')
        .style('stroke-width', '2px')
        .style('stroke-dasharray', '5,5');

    // Add nodes
    const node = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y}, ${d.x})`);

    // Add circles for nodes
    node.append('circle')
        .attr('r', d => d.data.isEndpoint ? 6 : 8)
        .style('fill', d => {
            if (d.data.isEndpoint) {
                return getMethodColor(d.data.methods?.[0] || 'GET');
            }
            return 'var(--accent-primary)';
        })
        .style('stroke', 'var(--bg-primary)')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', d.data.isEndpoint ? 8 : 10);
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', d.data.isEndpoint ? 6 : 8);
        });

    // Add labels
    node.append('text')
        .attr('dy', -12)
        .attr('text-anchor', 'middle')
        .text(d => d.data.name)
        .style('fill', 'var(--text-primary)')
        .style('font-size', '12px')
        .style('font-weight', d => d.data.isEndpoint ? 'normal' : 'bold');

    // Add method badges for endpoints
    node.filter(d => d.data.isEndpoint && d.data.methods)
        .append('text')
        .attr('dy', 20)
        .attr('text-anchor', 'middle')
        .text(d => d.data.methods.join(','))
        .style('fill', d => getMethodColor(d.data.methods[0]))
        .style('font-size', '10px')
        .style('font-weight', 'bold');
}

function buildRouteHierarchy(routes) {
    const root = {
        name: 'root',
        children: []
    };

    const pathMap = new Map();
    pathMap.set('/', root);

    routes.forEach(route => {
        const parts = route.path.split('/').filter(p => p);
        let currentPath = '';
        let parent = root;

        parts.forEach((part, index) => {
            currentPath += '/' + part;

            if (!pathMap.has(currentPath)) {
                const isLastPart = index === parts.length - 1;
                const node = {
                    name: part,
                    path: currentPath,
                    isEndpoint: isLastPart,
                    children: []
                };

                if (isLastPart) {
                    node.routeName = route.name;
                    node.methods = route.methods;
                    node.controller = route.controller;
                }

                parent.children.push(node);
                pathMap.set(currentPath, node);
                parent = node;
            } else {
                parent = pathMap.get(currentPath);
            }
        });
    });

    return root;
}

function getMethodColor(method) {
    const colors = {
        GET: '#3b82f6',
        POST: '#10b981',
        PUT: '#f59e0b',
        DELETE: '#ef4444',
        PATCH: '#8b5cf6',
        ANY: '#64748b'
    };
    return colors[method] || '#64748b';
}

// Export for use in main dashboard
export function destroyRouteGraph(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}
