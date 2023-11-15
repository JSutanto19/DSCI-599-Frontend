"use client"
import Hero from '../components/hero';
import Form from '../components/Form';
import Visualizer from '../components/Visualizer';
import React, { useState } from 'react'

export default function Home() {

  // const [nodes, setNodes] = useState<string[]>([]);
  // const [edges, setEdges] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<string[]>([]);

  const nodes = [
    { id: 'node1' },
    { id: 'node2' },
    { id: 'node3' },
    { id: 'node4' },
    { id: 'node5' }
  ];

  const links = [
    { source: 'node1', target: 'node2' },
    { source: 'node2', target: 'node1' },
    { source: 'node2', target: 'node3' },
    { source: 'node3', target: 'node4' },
    { source: 'node4', target: 'node5' },
    { source: 'node5', target: 'node1' } // This creates a loop back to node1
  ];

  const setGraph = (n: string[], e: string[], sched: string[]) => {
    // setNodes(n)
    // setEdges(e)
    setSchedule(sched)
  };

  return (
    <main className="overlow-hidden">
      <Hero />
      <Form setGraph={setGraph} />
      <Visualizer nodes={nodes} edges={links} />
    </main>
  )
}