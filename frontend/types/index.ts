import { MouseEventHandler } from "react";

export interface CustomButtonProps {
    title: string;
    containerStyles?: string;
    handleClick?: MouseEventHandler<HTMLButtonElement>
}

export interface VisualizerProps {
    nodes: string[];
    edges: string[];
}

export interface FormProps {
    setGraph: (nodes: string[], edges: string[], early: string[], late: string[], constraints: any[][], start: string, end: string) => void;
}

export interface ScheduleProps {
    earlyTimes: string[];
    latestTimes: string[];
    handleUpdate: (i: number, prev_start: string, start_hour: string, end_hour: string) => void;
}

export interface TaskCardProps {
    earlyTime: string;
    latestTime: string;
    index: number;
    handleUpdate: (i: number, prev_start: string, start_hour: string, end_hour: string) => void;
    // changeSchedule: (newETime: string, newLtime: string) => string;
}
