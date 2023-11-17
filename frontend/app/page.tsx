"use client"
import Hero from '../components/hero';
import Form from '../components/Form';
import Visualizer from '../components/Visualizer';
import React, { useState } from 'react'

export default function Home() {

  const [nodes, setNodes] = useState<string[]>([]);
  const [edges, setEdges] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [showGraph, setShow] = useState<boolean>(false);

  const setGraph = (n: string[], e: string[], sched: string[]) => {
    setNodes(n)
    setEdges(e)
    setSchedule(sched)
    setShow(true)
  };

  // const earlyTimes = ["3 AM", "4 AM", "5 AM", "6 AM", "8 AM"]
  // const latestTimes = ["4 AM", "6 AM", "7 AM", "8 AM", "10 AM"]

  return (
    <main className="overlow-hidden">
      <Hero />
      <Form setGraph={setGraph} />
      {showGraph && <Visualizer nodes={nodes} edges={edges} />}
    </main>
  )
}