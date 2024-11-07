import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        alignTime: false, // Whether to align the time of multiple timeline entries
        timelineData: [],
        formOpts: [],
        formSelections: [],
    },
    reducers: {
        addEntry: (state, action) => {
            state.timelineData.push([]);
            state.formSelections.push({hostA: "", hostAIndex: null, portA: "", hostB: "", hostBIndex: null, portB: "", radioASelected: true});
        },
        toggleAlignTime: (state) => {
            state.alignTime = !state.alignTime;
        },
        removeEntry: (state, action) => {
            // action.payload is entry index
            state.timelineData.splice(action.payload, 1);
            state.formSelections.splice(action.payload, 1);
        },
        setFormOpts: (state, action) => {
            state.formOpts = action.payload;
        },
        setFormSelections: (state, action) => {
            const {index, selection} = action.payload;
            state.formSelections[index] = selection;
        },
    },
});

export const { addEntry, toggleAlignTime, removeEntry, setFormOpts, setFormSelections } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;