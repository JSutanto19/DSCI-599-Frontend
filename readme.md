# README.md for Task Scheduling Application

## Overview
This application is a Flask-based web service designed to manage and optimize task scheduling using graph theory and the Bellman-Ford algorithm. It interfaces with a front-end (expected to run on `localhost:3000`) to visualize task schedules, allowing users to define tasks with variable durations and determine the earliest and latest possible start times for each task within a daily schedule.

## Features
- **Task Duration Input**: Accepts a range of durations for each task.
- **Time Format Conversion**: Converts time inputs to a 24-hour format.
- **Graph-Based Scheduling**: Utilizes NetworkX to build a directed graph representing tasks and their constraints.
- **Bellman-Ford Algorithm**: Computes the earliest and latest start times for tasks.
- **Dynamic Rescheduling**: Allows users to adjust task start times and recalculates the schedule accordingly.

## Setup & Installation
Ensure you have Python and Node.js installed, and install the required libraries and dependencies.

### Backend Installation
```bash
pip install flask flask-cors networkx
```

### Frontend Installation
Navigate to the frontend directory and install the necessary Node.js packages:
```bash
cd frontend
npm install
```

## Running the Application

### Starting the Backend
To start the Flask server, run:
```bash
python <name_of_script>.py
```
The server will start on `http://0.0.0.0:5002`. Ensure that the front-end service is running on `localhost:3000` to allow CORS.

### Running the Frontend
To start the frontend application:

```bash
npm install
```

```bash
npm run dev
```
This will launch the front-end service, typically accessible via `http://localhost:3000`.

## API Endpoints
- **POST /visualize**: Receives task data (durations, start and end times) and returns the calculated earliest and latest start times for each task, along with the graph representation.

## How It Works
1. **Receiving Task Data**: The application receives a list of tasks and their durations through the `/visualize` endpoint.
2. **Time Format Conversion**: Converts provided start and end times into a 24-hour format.
3. **Graph Construction**: Creates a directed graph where nodes represent tasks, and edges represent the constraints between them.
4. **Applying Bellman-Ford Algorithm**: Utilizes the algorithm to compute the earliest and latest start times for each task.
5. **Sending Response**: The response includes task timings, graph details, and constraints, formatted for visualization on the front-end.

## User Interaction
Users interact with the system via a front-end interface, which communicates with this Flask service. Users can:
- Enter task durations and daily start/end times.
- Receive visual feedback on the earliest and latest start times.
- Modify task start times and request a schedule recalculation.

## Rescheduling Logic
The system allows for dynamic rescheduling. When a user changes the start time of a task, the application recalculates constraints relative to this new start time and applies the Bellman-Ford algorithm to update the schedule.
