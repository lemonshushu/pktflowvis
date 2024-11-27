import { createSlice, current } from '@reduxjs/toolkit';

export const timeSliderSlice = createSlice({
    name : 'timeSlider',
    initialState : {
        filterStartEpoch: 0,
        filterEndEpoch: 0,
        filteredPackets: null, 
    },
    reducers : {
        setFilterEpoch: (state, action) => {
            state.filterStartEpoch = action.payload[0];
            state.filterEndEpoch = action.payload[1];
        },
        setFilteredPackets: (state, action) => {
            state.filteredPackets = action.payload;
        }
    },
});

export const { setFilterEpoch, setFilteredPackets } = timeSliderSlice.actions;

export default timeSliderSlice.reducer;