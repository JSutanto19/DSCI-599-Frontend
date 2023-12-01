import React, { useEffect, useRef, useState } from 'react';
import { ScheduleProps } from '../types/index'
import TaskCard from './TaskCard'


const TaskList = ({ earlyTimes, latestTimes, handleUpdate }: ScheduleProps) => {
    const [cleanEarlyTimes, setEarly] = useState<string[]>([]);
    const [cleanLatestTimes, setLatest] = useState<string[]>([]);

    const cleanArrays = () => {
        let cleanedArray1 = earlyTimes.map(time => time.split(":")[1].trim());
        let cleanedArray2 = latestTimes.map(time => time.split(":")[1].trim());
        setEarly(cleanedArray1)
        setLatest(cleanedArray2)

    }
    useEffect(() => {
        cleanArrays()
    }, [earlyTimes, latestTimes]);

    return (
        <div className='mt-12 padding-x padding-y bg-[#446cfc] h-full flex flex-col items-center justify-center'>
            <h1 className='text-4xl font-extrabold text-left mt-6 text-white'>{'Your Schedule'}</h1>
            {earlyTimes.map((_, index) => { return <TaskCard index={index} earlyTime={cleanEarlyTimes[index]} latestTime={cleanLatestTimes[index]} handleUpdate={handleUpdate} /> })}
        </div>
    );
}

export default TaskList;

