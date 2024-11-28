import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../features/data/dataSlice';
import graphViewReducer from '../features/graphView/graphViewSlice';
import timelineViewReducer from '../features/timelineView/timelineViewSlice';
import controlPanelReducer from '../features/graphView/components/controlPanelSlice';
import timeSliderReducer from '../features/graphView/components/timeSliderSlice';

export default configureStore({
    reducer: {
        data: dataReducer,
        graphView: graphViewReducer,
        timelineView: timelineViewReducer,
        controlPanel: controlPanelReducer,
        timeSlider: timeSliderReducer
    },
});