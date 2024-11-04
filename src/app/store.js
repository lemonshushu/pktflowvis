import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../features/data/dataSlice';
import graphViewReducer from '../features/graphView/graphViewSlice';
import timelineViewReducer from '../features/timelineView/timelineViewSlice';

export default configureStore({
    reducer: {
        data: dataReducer,
        graphView: graphViewReducer,
        timelineView: timelineViewReducer,
    },
});