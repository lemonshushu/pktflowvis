import { createSlice } from '@reduxjs/toolkit';

export const dataSlice = createSlice({
    name: 'data',
    initialState: {
        packets: null,
        startEpoch: 0,
        endEpoch: 0,
        currentView: 'fileUpload',
    },
    reducers: {
        setPackets: (state, action) => {
            state.packets = action.payload;
        },
        setEpoches: (state, action) => {
            console.log(action.payload);
            state.startEpoch = action.payload[0];
            state.endEpoch = action.payload[1];
        },
        setCurrentView: (state, action) => {
            state.currentView = action.payload;
        },
    },
});

export const { setPackets, setEpoches, setCurrentView } = dataSlice.actions;

export default dataSlice.reducer;