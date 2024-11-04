import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        alignTime: false, // Whether to align the time of multiple timeline entries
        timelineData: [],
    },
    reducers: {
        addEntry: (state, action) => {
            state.timelineData.push([]);
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

export const { addEntry, toggleAlignTime, removeEntry } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;