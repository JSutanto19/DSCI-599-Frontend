"use client"
import Hero from '../components/hero';
import Form from '../components/Form';
import Visualizer from '../components/Visualizer';
import Schedule from '../components/TaskList';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function Home() {

  const [nodes, setNodes] = useState<string[]>([]);
  const [edges, setEdges] = useState<string[]>([]);
  const [earlyTimes, setEarly] = useState<string[]>([]);
  const [latestTimes, setLatest] = useState<string[]>([]);
  const [constraints1, setConstraints] = useState<any[][]>([]);
  const [showGraph, setShow] = useState<boolean>(false);
  const [start_hour1, setStart] = useState<string>('');
  const [end_hour1, setEnd] = useState<string>('');

  useEffect(() => {
    console.log('update happened');
    console.log(nodes)
  }, [earlyTimes, latestTimes, nodes, edges]);


  const setGraph = (n: string[], e: string[], early: string[], late: string[], constraints: any[][], start: string, end: string) => {
    console.log('setgraph: ', end)
    setNodes(n)
    setEdges(e)
    setEarly(early)
    setLatest(late)
    setConstraints(constraints)
    setShow(true)
    setStart(start)
    setEnd(end)
  };

  const handleUpdate = async (i: number, prev_start: string, start_hour: string, end_hour: string) => {
    const updatedData = {
      task_index: i,
      earlyTimes: earlyTimes,
      latestTimes: latestTimes,
      start_hour: start_hour,
      start_hour1: start_hour1,
      end_hour: end_hour1,
      constraints: constraints1,
      prev_start: prev_start
    };
    try {
      const response = await axios.post('http://localhost:5002/schedule', updatedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setEarly(response.data.earlyTimes)
      setLatest(response.data.latestTimes)
      setNodes(response.data.nodes)
      setEdges(response.data.edges)
      setConstraints(response.data.constraints)
    } catch (error) {
      console.error('There was an error!', error.response);
    }
  };

  return (
    <main className="overlow-hidden">
      <Hero />
      <Form setGraph={setGraph} />
      {showGraph && <Visualizer nodes={nodes} edges={edges} />}
      {showGraph && <Schedule earlyTimes={earlyTimes} latestTimes={latestTimes} handleUpdate={handleUpdate} />}
    </main>
  )
}