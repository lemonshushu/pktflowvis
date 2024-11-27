import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Slider } from '@mui/material';
import { setFilteredPackets, setFilterEpoch } from './timeSliderSlice';

export default function TimeSlider(props) {
    const packets = useSelector((state) => state.data.packets);
    const startEpoch = useSelector((state) => state.data.startEpoch);
    const endEpoch = useSelector((state) => state.data.endEpoch);
    const filterStartEpoch = useSelector((state) => state.timeSlider.filterStartEpoch);
    const filterEndEpoch = useSelector((state) => state.timeSlider.filterEndEpoch);

    const dispatch = useDispatch(); 
    
    const handleChange = (event, newValue) => {
        dispatch(setFilterEpoch(newValue));
        const filteredPackets = packets.filter((packet) => {
            const epoch = packet._source.layers.frame["frame.time_epoch"] *10**6;
            return ((startEpoch+filterStartEpoch <= epoch) && (epoch <= startEpoch+filterEndEpoch));
        })
        dispatch(setFilteredPackets(filteredPackets));
    };

    const epochToTime = (epoch) => {
        const totalSeconds = Math.floor(epoch / 1_000_000);
        const microseconds = String(epoch % 1_000_000).padStart(6, '0');

        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        if (hours === "00") {
            if (minutes === "00") {
                return `${seconds}.${microseconds}s`;
            }
            return `${minutes}m:${seconds}.${microseconds}s`;
        }

        return `${hours}h:${minutes}m:${seconds}s`;
    }

    return (
        <div>
            <Slider
                style={{width:'90%'}}
                value={[filterStartEpoch, filterEndEpoch]}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={0}
                max={endEpoch-startEpoch}
            />
            <p>{epochToTime(filterStartEpoch)} - {epochToTime(filterEndEpoch)}</p>
        </div>
    )
}

