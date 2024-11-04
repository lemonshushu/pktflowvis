import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        alignTime: false, // Whether to align the time of multiple timeline entries
        timelineData: [],
        timelineViewOpts: [],
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
        setTimelineViewOpts: (state, action) => {
            state.timelineViewOpts = action.payload;
        },
    },
});

export const { addEntry, toggleAlignTime, removeEntry, setTimelineViewOpts } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;