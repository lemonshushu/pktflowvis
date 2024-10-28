import { createSlice } from '@reduxjs/toolkit';

export const graphViewSlice = createSlice({
    name: 'graphView',
    initialState: {
        hostGraphData: null,
        portGraphData: null,
        mode: 'host',
    },
    reducers: {
        setHostGraphData: (state, action) => {
            state.hostGraphData = action.payload;
        },
        setPortGraphData: (state, action) => {
            state.portGraphData = action.payload;
        },
        setMode: (state, action) => {
            state.mode = action.payload;
        }
    },
});

export const { setHostGraphData, setPortGraphData, setMode } = graphViewSlice.actions;

export default graphViewSlice.reducer;