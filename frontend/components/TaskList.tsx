import React, { useEffect, useRef, useState } from 'react';
import { ScheduleProps } from '../types/index'
import TaskCard from './TaskCard'


const TaskList = ({ earlyTimes, latestTimes, handleUpdate }: ScheduleProps) => {
    useEffect(() => {
        console.log('EarlyTimes or LatestTimes changed');
    }, [earlyTimes, latestTimes]);

    return (
        <div className='mt-12 padding-x padding-y bg-[#446cfc] h-full flex flex-col items-center justify-center'>
            <h1 className='text-4xl font-extrabold text-left mt-6 text-white'>{'Your Schedule'}</h1>
            {earlyTimes.map((_, index) => { return <TaskCard index={index} earlyTime={earlyTimes[index]} latestTime={latestTimes[index]} handleUpdate={handleUpdate} /> })}
        </div>
    );
}

export default TaskList;

