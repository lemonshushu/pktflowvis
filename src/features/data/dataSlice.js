import { createSlice } from '@reduxjs/toolkit';

export const dataSlice = createSlice({
    name: 'data',
    initialState: {
        packets: null,
        currentView: 'fileUpload',
    },
    reducers: {
        setPackets: (state, action) => {
            state.packets = action.payload;
        },
        setCurrentView: (state, action) => {
            state.currentView = action.payload;
        },
    },
});

export const { setPackets, setCurrentView } = dataSlice.actions;

export default dataSlice.reducer;