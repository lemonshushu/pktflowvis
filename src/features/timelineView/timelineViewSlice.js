import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        currentEntry: null, // Index of the entry being currently operated on
        alignTime: false, // Whether to align the time of multiple timeline entries
        metadata: [],
        timelineData: [],
        formOpts: [],
        formSelections: [],
    },
    reducers: {
        setCurrentEntry: (state, action) => {
            state.currentEntry = action.payload;
        },
        addEntry: (state, action) => {
            state.metadata.push({ hostA: "", portA: "", hostB: "", portB: "" });
            state.timelineData.push([]);
            state.formSelections.push({ hostA: "", hostAIndex: null, portA: "", hostB: "", hostBIndex: null, portB: "", radioASelected: true });
        },
        toggleAlignTime: (state) => {
            state.alignTime = !state.alignTime;
        },
        removeEntry: (state, action) => {
            // action.payload is entry index
            state.metadata.splice(action.payload, 1);
            state.timelineData.splice(action.payload, 1);
            state.formSelections.splice(action.payload, 1);
        },
        setFormOpts: (state, action) => {
            state.formOpts = action.payload;
        },
        setFormSelections: (state, action) => {
            state.formSelections[ state.currentEntry ] = action.payload;
        },
        setMetadata: (state, action) => {
            state.metadata[ state.currentEntry ] = action.payload;
        },
        setTimelineData: (state, action) => {
            state.timelineData[ state.currentEntry ] = action.payload;
        },
    },
});

export const { setCurrentEntry, addEntry, toggleAlignTime, removeEntry, setFormOpts, setFormSelections, setMetadata, setTimelineData } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;