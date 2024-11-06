import { createSlice } from '@reduxjs/toolkit';

export const graphViewSlice = createSlice({
    name: 'graphView',
    initialState: {
        hostGraphData: null,
        portGraphData: null,
        nicknameMapping: {},
        mode: 'host',
    },
    reducers: {
        setHostGraphData: (state, action) => {
            state.hostGraphData = action.payload;
        },
        setPortGraphData: (state, action) => {
            state.portGraphData = action.payload;
        },
        setNicknameMapping: (state, action) => {
            state.nicknameMapping = {
                ...state.nicknameMapping,
                ...action.payload
            };
        },
        resetNicknameMapping: (state, action) => {
            if (action.payload) {
                // 특정 키의 닉네임 초기화
                const { [action.payload]: _, ...rest } = state.nicknameMapping;
                state.nicknameMapping = rest;
            } else {
                // 전체 초기화
                state.nicknameMapping = {};
            }
        },
        setMode: (state, action) => {
            state.mode = action.payload;
        }
    },
});

export const { setHostGraphData, setPortGraphData, setNicknameMapping, resetNicknameMapping, setMode } = graphViewSlice.actions;

export default graphViewSlice.reducer;