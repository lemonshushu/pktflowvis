import { createSlice, current } from '@reduxjs/toolkit';

export const controlPanelSlice = createSlice({
    name: 'controlPanel',
    initialState: {
        nicknameMapping: {},
        isSimulationStable: false,
        isNicknameChangeOpen: false,
        isShowProtocolsOpen: false,
        showL4Protocol: false,
        L4Protocols : [],
        selectedL4Protocols: {},
        showL7Protocol: false,
        L7Protocols : [],
        selectedL7Protocols: {}
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
        },
        addProtocols: (state, action) => {
            const { l4Protocols, l7Protocols } = action.payload;
            state.L4Protocols = [...new Set([...state.L4Protocols, ...l4Protocols])];
            state.L4Protocols.forEach((protocol) => {state.selectedL4Protocols[protocol] = false;});
            state.L7Protocols = [...new Set([...state.L7Protocols, ...l7Protocols])];
            state.L7Protocols.forEach((protocol) => {state.selectedL7Protocols[protocol] = false;});
            console.log(state.L4Protocols);
            console.log(current(state.selectedL4Protocols));
            console.log(state.L7Protocols);
            console.log(current(state.selectedL7Protocols));
        },
        // 프로토콜 선택 상태 토글 리듀서
        toggleL4Protocol: (state, action) => {
            const protocol = action.payload;
            state.selectedL4Protocols[protocol] = !state.selectedL4Protocols[protocol];
        },
        toggleL7Protocol: (state, action) => {
            const protocol = action.payload;
            state.selectedL7Protocols[protocol] = !state.selectedL7Protocols[protocol];
        },

    },
});

export const {
                setNicknameMapping, 
                resetNicknameMapping, 
                setIsSimulationStable, 
                setIsNicknameChangeOpen, 
                setIsShowProtocolsOpen, 
                setShowL4Protocol,
                setShowL7Protocol,
                addProtocols,
                toggleL4Protocol,
                toggleL7Protocol,

            } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;