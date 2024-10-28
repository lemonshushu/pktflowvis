import { createSlice } from '@reduxjs/toolkit';

export const fileUploadSlice = createSlice({
    name: 'fileUpload',
    initialState: {
        packets: null,
    },
    reducers: {
        setPackets: (state, action) => {
            state.packets = action.payload;
        },
    },
});

export const { setPackets } = fileUploadSlice.actions;

export default fileUploadSlice.reducer;