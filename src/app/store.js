import { configureStore } from '@reduxjs/toolkit';
import fileUploadReducer from '../features/fileUpload/fileUploadSlice';

export default configureStore({
    reducer: {
        fileUpload: fileUploadReducer,
    },
});