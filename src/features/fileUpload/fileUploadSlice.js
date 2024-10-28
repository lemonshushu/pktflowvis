import { createSlice } from '@reduxjs/toolkit';

export const fileUploadSlice = createSlice({
    name: 'fileUpload',
    initialState: {
        pcapFile: null,
    },
    reducers: {
        setPcapFile: (state, action) => {
            state.pcapFile = action.payload;
        },
    },
});

export const { setPcapFile } = fileUploadSlice.actions;

export default fileUploadSlice.reducer;