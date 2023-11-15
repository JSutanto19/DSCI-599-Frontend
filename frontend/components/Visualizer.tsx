import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    // Add other node properties here
}

interface Link extends d3.SimulationLinkDatum<Node> {
    // ... other properties
    x: number;
    y: number;
}

interface GraphProps {
    nodes: Node[];
    edges: Link[];
}

const Visualizer: React.FC<GraphProps> = ({ nodes, edges }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Add this block to define the arrow marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 24) // Adjust this depending on the size of your nodes
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 15)
            .attr('markerHeight', 15)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999');

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id((d: d3.SimulationNodeDatum) => (d as Node).id).distance(400)) // Increase distance
            .force("charge", d3.forceManyBody().strength(-100)) // Increase repulsive force
            .force("center", d3.forceCenter(1200 / 2, 600 / 2));

        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(edges)
            .enter().append("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1)
            .attr('marker-end', 'url(#arrowhead)'); // This references the defined marker

        const linkText = svg.append("g")
            .attr("class", "link-texts")
            .selectAll("text")
            .data(edges)
            .enter().append("text")
            .text(d => d.weight)
            .attr("x", 8)
            .attr("y", 3)
            .attr("font-size", "10px")
            .attr("fill", "black");

        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 20)
            .attr("fill", "blue");

        // Create labels (text elements)
        const labels = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .text(d => d.id)
            .attr("x", 8)
            .attr("y", 3)
            .attr("font-size", "16px")
            .attr("fill", "black");

        // Update positions on simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as Node).x ?? 0)
                .attr("y1", d => (d.source as Node).y ?? 0)
                .attr("x2", d => (d.target as Node).x ?? 0)
                .attr("y2", d => (d.target as Node).y ?? 0);

            node
                .attr("cx", d => d.x ?? 0)
                .attr("cy", d => d.y ?? 0);

            labels
                .attr("x", d => (d.x ?? 0) + 35)
                .attr("y", d => (d.y ?? 0) + 8);

            linkText
                .attr("x", d => (((d.source as Node).x ?? 0) + ((d.target as Node).x ?? 0)) / 2)
                .attr("y", d => (((d.source as Node).y ?? 0) + ((d.target as Node).y ?? 0)) / 2);


        });

    }, [nodes, edges]);

    return (<div className='graph-container'>
        <h1 className='text-4xl font-extrabold text-left mt-6'>{'Your CSP Graph'}</h1>
        <svg style={{ marginTop: 0, position: 'relative' }} ref={svgRef} width="100%" height="100%" viewBox="0 0 1200 700"></svg>
    </div>);

};

export default Visualizer;



