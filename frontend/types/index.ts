import { MouseEventHandler } from "react";

export interface CustomButtonProps {
    title: string;
    containerStyles?: string;
    handleClick?: MouseEventHandler<HTMLButtonElement>
}

export interface VisualizerProps {
    nodes: string[];
    edges: string[];
    schedule: string[];
}

export interface FormProps {
    setGraph: (nodes: string[], edges: string[], schedule: string[]) => void;
}