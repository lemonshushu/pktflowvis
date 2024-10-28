import { createSlice } from '@reduxjs/toolkit';

export const fileUploadSlice = createSlice({
    name: 'fileUpload',
    initialState: {
        data: null,
    },
    reducers: {
        setData: (state, action) => {
            state.data = action.payload;
        },
    },
});

export const { setData } = fileUploadSlice.actions;

export default fileUploadSlice.reducer;