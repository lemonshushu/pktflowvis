import { createSlice } from '@reduxjs/toolkit';

export const graphViewSlice = createSlice({
    name: 'graphView',
    initialState: {
        hostGraphData: null,
        availableIPs: null,
        portGraphData: null,
        mode: 'host',
    },
    reducers: {
        setHostGraphData: (state, action) => {
            state.hostGraphData = action.payload;
        },
        setAvailableIPs: (state, action) => {
            state.availableIPs = action.payload;
        },
        setPortGraphData: (state, action) => {
            state.portGraphData = action.payload;
        },
        setMode: (state, action) => {
            state.mode = action.payload;
        },
    },
});

export const { setHostGraphData, setAvailableIPs, setPortGraphData, setNicknameMapping, resetNicknameMapping, setMode } = graphViewSlice.actions;

export default graphViewSlice.reducer;