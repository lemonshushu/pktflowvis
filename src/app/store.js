import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../features/data/dataSlice';
import graphViewReducer from '../features/graphView/graphViewSlice';

export default configureStore({
    reducer: {
        data: dataReducer,
        graphView: graphViewReducer,
    },
});