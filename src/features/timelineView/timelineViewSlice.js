import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        currentEntry: null, // Index of the entry being currently operated on
        alignTime: false, // Whether to align the time of multiple timeline entries
        metadata: [],
        isMetaNew: false,
        timelineData: [],
        formOpts: [],
        formSelections: [],
    },
    reducers: {
        setCurrentEntry: (state, action) => {
            state.currentEntry = action.payload;
        },
        addEntry: (state, action) => {
            let {metadata, formSelections} = action.payload;
            if (!metadata) metadata = { hostA: "", portA: "", hostB: "", portB: "" };
            if (!formSelections) formSelections = { hostA: "", hostAIndex: null, portA: "", hostB: "", hostBIndex: null, portB: "", radioASelected: true };
            state.metadata.push(metadata);
            state.timelineData.push([]);
            state.formSelections.push(formSelections);
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
            state.isMetaNew = true;
        },
        setIsMetaNew: (state, action) => {
            state.isMetaNew = action.payload;
        },
        setTimelineData: (state, action) => {
            state.timelineData[ state.currentEntry ] = action.payload;
        },
    },
});

export const { setCurrentEntry, addEntry, toggleAlignTime, removeEntry, setFormOpts, setFormSelections, setMetadata, setTimelineData, setIsMetaNew } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;