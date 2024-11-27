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

    const max_epoch = endEpoch - startEpoch;
    const dispatch = useDispatch(); 
    
    const handleChange = (event, newValue) => {
        dispatch(setFilterEpoch(newValue));
        const filteredPackets = packets.filter((packet) => {
            const epoch = packet._source.layers.frame["frame.time_epoch"] *10**6;
            return ((startEpoch+filterStartEpoch <= epoch) && (epoch <= startEpoch+filterEndEpoch));
        })
        dispatch(setFilteredPackets(filteredPackets));
    };

    function roundToDecimal(value, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
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
            <p>{roundToDecimal(filterStartEpoch/max_epoch*100, 2)}% - {roundToDecimal(filterEndEpoch/max_epoch*100, 2)}%</p>
        </div>
    )
}

