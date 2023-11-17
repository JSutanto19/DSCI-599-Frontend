import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { VisualizerProps } from '../types/index'

interface GraphNode {
    data: {
        id: string;
    };
}

interface GraphEdge {
    data: {
        id: string;
        source: string;
        target: string;
        weight: number;
    };
}

// Union type
type GraphElement = GraphNode | GraphEdge;


// Define the component
const CytoscapeGraph = ({ nodes, edges }: VisualizerProps) => {
    const cyContainerRef = useRef<HTMLDivElement>(null);
    const [graphElem, setGraphElem] = useState<GraphElement[]>([]);

    const processGraph = () => {

        const objectArray = nodes.map(element => {
            return { data: { id: element } };
        });

        const edgeArray = edges.map(element => {
            // Splitting the string to extract source, target, and weight
            const parts = element.split(/ -> | \(weight: |\)/);
            // parts[0] is the source, parts[1] is the target, and parts[2] is the weight

            const source = parts[0];
            const target = parts[1];
            const weight = parseInt(parts[2], 10); // Converting the weight to an integer

            // Constructing the object
            return {
                data: {
                    id: source + target, // Concatenating source and target for id
                    source: source,
                    target: target,
                    weight: weight
                }
            };
        });


        let mergedArr = [...objectArray, ...edgeArray]
        console.log(mergedArr)
        return mergedArr

    }

    useEffect(() => {
        if (cyContainerRef.current) {
            const cy = cytoscape({
                container: cyContainerRef.current,

                elements: processGraph(),

                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': '#666',
                            'label': 'data(id)',
                            'width': '10px',
                            'height': '10px',
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 2,
                            'line-color': '#ccc',
                            'target-arrow-color': '#ccc',
                            'target-arrow-shape': 'triangle',
                            'curve-style': 'bezier',
                            'label': 'data(weight)',
                            'text-margin-y': -10,
                            'text-margin-x': 10, // Adjust this value to move the label above the line
                        }
                    }
                ],
                layout: {
                    name: 'cose',
                    nodeRepulsion: function (node) { return 400000; },  // Adjusted repulsion
                    idealEdgeLength: function (edge) { return 100; },   // Adjusted edge length
                    nodeOverlap: 10,                                    // Adjusted node overlap
                    gravity: 1,                                         // Optional: Adjust gravity
                    numIter: 1000,                                      // Optional: Increase iterations
                    // Additional parameters...
                }

            });
        }
    }, []);

    return (
        <div className='graph-container' id='visualize'>
            <h1 className='text-4xl font-extrabold text-left mt-6'>{'Your CSP Graph'}</h1>
            <div ref={cyContainerRef} style={{ width: 800, height: 600 }} />
        </div>
    );
};

export default CytoscapeGraph;