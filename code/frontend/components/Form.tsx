"use client"
import React, { useState } from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CustomButton from './CustomButton';
import axios from 'axios';
import { FormProps } from '../types/index'



const Form = ({ setGraph }: FormProps) => {

    // Create state variables for each input field
    const [numberOfTasks, setNumberOfTasks] = useState('');
    const [taskDurations, setTaskDuration] = useState<string[]>([]);
    const [dayStart, setDayStart] = useState('');
    const [dayEnd, setDayEnd] = useState('');

    const handleScroll = () => {
        const nextSection = document.getElementById("visualize");

        if (nextSection) {
            nextSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleNumberOfTasksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNumberOfTasks(event.target.value);
    };

    const handleTaskDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const durationArr = event.target.value.split('\n')

        setTaskDuration(durationArr);
    };

    const handleDayStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDayStart(event.target.value);
    };

    const handleDayEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDayEnd(event.target.value);
    };

    const handleFormSubmit = async () => {
        const updatedData = {
            numTasks: numberOfTasks,
            taskDuration: taskDurations,
            start: dayStart,
            end: dayEnd,
        };
        try {
            const response = await axios.post('http://localhost:5002/visualize', updatedData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setGraph(response.data.nodes, response.data.edges, response.data.earlyTimes, response.data.latestTimes, response.data.constraints, dayStart, dayEnd, response.data.shortestPathEarliest, response.data.shortestPathLatest)
            handleScroll()
        } catch (error) {
            console.error('There was an error!', error.response);
        }
    };




    return (
        <div className='mt-12 padding-x padding-y bg-[#446cfc] h-full' id='discover'>
            <div className='home__text-container'>
                <h1 className='text-4xl font-extrabold text-left mt-3'>Create Your Schedule</h1>
                <p>Answer the questions below to generate your optimal scehdule</p>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '98%' }, // set width to 90% for all text fields
                        width: '100%', // ensure the Box takes full width of its container
                        textAlign: 'left', // aligns the text to the left
                        marginLeft: '5%', // centers the form with a 5% margin on either side to sum up to 100% with 90% width
                        marginRight: '5%',
                        paddingBottom: '10px',
                        paddingLeft: '10px'

                    }}
                    noValidate
                    autoComplete="off"
                >
                    <h2 style={{ marginBottom: '2px', marginLeft: '10px', fontWeight: 'bold' }}>Enter number of tasks</h2>
                    <TextField
                        id="number-of-tasks"
                        hiddenLabel
                        variant="outlined"
                        onChange={handleNumberOfTasksChange}
                        style={{ marginTop: '4px' }} // Adjust the top margin as needed to reduce the space
                    />

                    <h2 style={{ marginBottom: '2px', marginLeft: '10px', fontWeight: 'bold', marginTop: '10px' }}>Enter each task's duration and separate each one with a newline (e.g. '2' or '1-2' for a range)</h2>
                    <TextField
                        id="tasks-duration"
                        multiline
                        rows={4}
                        maxRows={20}
                        onChange={handleTaskDurationChange}
                        defaultValue="1 hour"
                    />

                    <h2 style={{ marginBottom: '2px', marginLeft: '10px', fontWeight: 'bold', marginTop: '10px' }}>Enter the start of your day (eg. 5 am)</h2>
                    <TextField
                        id="day-start"
                        hiddenLabel
                        onChange={handleDayStartChange}
                        variant="outlined"
                    />

                    <h2 style={{ marginBottom: '2px', marginLeft: '10px', fontWeight: 'bold', marginTop: '10px' }}>Enter the end of your day (eg. 10 pm)</h2>
                    <TextField
                        id="day-end"
                        hiddenLabel
                        onChange={handleDayEndChange}
                        variant="outlined"
                    />
                    <CustomButton
                        title="Generate Schedule"
                        containerStyles='bg-primary-blue text-white rounded-md mt-10'
                        handleClick={handleFormSubmit}
                    />
                </Box>
            </div>
        </div>
    )
}

export default Form

