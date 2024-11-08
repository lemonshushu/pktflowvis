import { createSlice } from '@reduxjs/toolkit';

export const controlPanelSlice = createSlice({
    name: 'controlPanel',
    initialState: {
        nicknameMapping: {},
        isSimulationStable: false,
        isNicknameChangeOpen: false,
        isShowProtocolsOpen: false,
        showL4Protocol: false,
        showL7Protocol: false
    },
    reducers: {
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
        setIsSimulationStable: (state, action) => {
            state.isSimulationStable = action.payload;
        },
        setIsNicknameChangeOpen: (state, action) => {
            state.isNicknameChangeOpen = action.payload;
        },
        setIsShowProtocolsOpen: (state, action) => {
            if (action.payload) {
                state.showL4Protocol = false;
                state.showL7Protocol = false;
            }
            state.isShowProtocolsOpen = !state.isShowProtocolsOpen;
        },
        setShowL4Protocol: (state, action) => {
            state.showL4Protocol = action.payload;
        },
        setShowL7Protocol: (state, action) => {
            state.showL7Protocol = action.payload;
        }
    },
});

export const {
                setNicknameMapping, 
                resetNicknameMapping, 
                setIsSimulationStable, 
                setIsNicknameChangeOpen, 
                setIsShowProtocolsOpen, 
                setShowL4Protocol, 
                setShowL7Protocol
            } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;