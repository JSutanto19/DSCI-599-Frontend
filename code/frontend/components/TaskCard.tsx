import React, { useEffect, useRef, useState } from 'react';
import CustomButton from './CustomButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TaskCardProps } from '../types/index'


const TaskCard = ({ earlyTime, latestTime, index, handleUpdate }: TaskCardProps) => {
    const [open, setOpen] = React.useState(false);
    const [newStart, setNewStart] = useState<string>('');

    const handleEdit = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        handleUpdate(index + 1, earlyTime, newStart, latestTime)
        handleClose()
    }

    const handleNewStart = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewStart(event.target.value);
    };

    return (
        <div className='bg-white p-4 rounded-xl mt-5 h-20 w-full flex flex-row items-center justify-between'>
            <div className='flex flex-row'>
                <h1 className='text-xl font-extrabold text-left text-blue-600 '>Task {index + 1}</h1>
                <h1 className='text-xl font-extrabold text-left ml-10 text-green-600'>Earliest Start Time: {earlyTime} </h1>
                <h1 className='text-xl font-extrabold text-left ml-10 text-red-600'>Latest Start Time: {latestTime} </h1>
            </div>

            <CustomButton
                title="Edit Schedule"
                containerStyles='bg-orange-500 text-white rounded-md'
                handleClick={handleEdit}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Would you like to edit this task in the schedule?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please pick a start time between {earlyTime} to {latestTime}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Earliest Start Time "
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleNewStart}
                    />
                </DialogContent>
                <DialogActions>
                    <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={handleClose}>Cancel</Button>
                    <Button style={{ backgroundColor: 'Green', color: 'white' }} onClick={handleConfirm}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default TaskCard
