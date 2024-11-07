import { createSlice } from '@reduxjs/toolkit';

export const dataSlice = createSlice({
    name: 'data',
    initialState: {
        packets: null,
    },
    reducers: {
        setPackets: (state, action) => {
            state.packets = action.payload;
        },
    },
});

export const { setPackets } = dataSlice.actions;

export default dataSlice.reducer;