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
const CytoscapeGraph = ({ nodes, edges, shortestPathEarliest, shortestPathLatest }: VisualizerProps) => {
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
        console.log('here', shortestPathEarliest)
        console.log('here2', shortestPathLatest)
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
                            'background-color': '#446cfc',
                            'label': 'data(id)',
                            'color': '#fff', // Text color
                            'text-valign': 'center', // Vertical alignment
                            'text-halign': 'center', // Horizontal alignment
                            'font-size': '10px', // Font size
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
                            'label': 'data(weight)', // Adjust this value for horizontal offset
                            'color': '#000', // Label text color
                            'font-size': '10px', // Adjust font size
                            'text-background-opacity': 1, // Background opacity
                            'text-background-color': '#fff', // Background color
                            'text-background-padding': '3px', // Padding around text
                            'text-border-opacity': 1, // Border opacity
                            'text-border-width': 1, // Border width
                            'text-border-color': '#000', // Border color
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
    }, [nodes, edges, shortestPathEarliest, shortestPathLatest]);

    return (
        <div className='flex flex-row' id='visualize'>
            <div className='graph-container'>
                <h1 className='text-4xl font-extrabold text-left mt-6'>{'Your Graph'}</h1>
                <div ref={cyContainerRef} style={{ width: 800, height: 600 }} />
            </div>
            <div className='sp-container'>
                <h1 className='text-4xl font-extrabold text-left mt-6'>{'Shortest Path Computation for Earliest Times'}</h1>
                <div className='ml-5 mt-2'>
                    {shortestPathEarliest.map((x) => { return <h4 className='text-xl text-left mt-2'>{x}</h4> })}
                </div>
                <h1 className='text-4xl font-extrabold text-left mt-8'>{'Shortest Path Computation for Latest Times'}</h1>
                <div className='ml-5 mt-2'>
                    {shortestPathLatest.map((x) => { return <h4 className='text-xl text-left mt-2'>{x}</h4> })}
                </div>

            </div>
        </div>
    );
};

export default CytoscapeGraph;