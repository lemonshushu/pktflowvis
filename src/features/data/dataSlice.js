import { createSlice } from '@reduxjs/toolkit';

export const dataSlice = createSlice({
    name: 'data',
    initialState: {
        packets: null,
        timelineViewOpts: [],
    },
    reducers: {
        setPackets: (state, action) => {
            state.packets = action.payload;
        },
        setTimelineViewOpts: (state, action) => {
            state.timelineViewOpts = action.payload;
        },
    },
});

export const { setPackets, setTimelineViewOpts } = dataSlice.actions;

export default dataSlice.reducer;