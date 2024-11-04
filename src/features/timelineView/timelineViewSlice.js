import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        timelineData: [],
        alignTime: false, // Whether to align the time of multiple timeline entries
    },
    reducers: {
        addEntry: (state, action) => {
            //
        },
        toggleAlignTime: (state) => {
            state.alignTime = !state.alignTime;
        },
        removeEntry: (state, action) => {
            // action.payload is entry index
            state.timelineData.splice(action.payload, 1);
        },
            
    },
});

export const { setHostGraphData, setPortGraphData, setMode } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;