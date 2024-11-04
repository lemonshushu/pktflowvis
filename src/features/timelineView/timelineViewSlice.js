import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        alignTime: false, // Whether to align the time of multiple timeline entries
        timelinePackets: [],
        selections: [], // Selected options for the timeline entries. Keys: host_a, host_b, port_a, port_b, localhost_is_a
    },
    reducers: {
        addEntry: (state, action) => {
            state.timelinePackets.push([]);
            state.selections.push({host_a: null, host_b: null, port_a: null, port_b: null, localhost_is_a: true});
        },
        toggleAlignTime: (state) => {
            state.alignTime = !state.alignTime;
        },
        removeEntry: (state, action) => {
            // action.payload is entry index
            state.timelinePackets.splice(action.payload, 1);
            state.selections.splice(action.payload, 1);
        },
    },
});

export const { addEntry, toggleAlignTime, removeEntry } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;