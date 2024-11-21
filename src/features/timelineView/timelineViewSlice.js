import {createSlice} from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        /**
         * Whether to align the time of multiple timeline entries
         */
        alignTime: false,

        /**
         * The current {hostA, portA, hostB, portB, localhost, propDelay} for each timeline entry
         */
        metadata: [],

        /**
         * D3 data for each timeline entry, according to `metadata`
         */
        timelineData: [],

        /**
         * Dropdown options for the form (list of selectable hosts and ports)
         */
        formOpts: [],

        /**
         * The current form selections for each timeline entry \
         * (주의! `metadata`는 실제로 현재 D3에 반영된 데이터이며, `formSelections`는 현재 dropdown에서 선택만 되어있고 아직 `Save`를 통해 반영되지는 않음)
         */
        formSelections: [],

        /**
         * Titles for each timeline entry
         */
        entryTitles: [],

        /**
         * Propagation delays for each timeline entry
         */
        propDelays: [],

        /**
         * Whether to focus on the last entry on view initialization
         */
        shouldFocusLastEntry: false,

    },
    reducers: {

        /**
         * Add a new timeline entry \
         * - action.payload: { metadata, formSelections } \
         * - metadata: { hostA: string, portA: string, hostB: string, portB: string } \
         * - formSelections: { hostA: string, portA: string, hostB: string, portB: string, radioASelected: boolean } \
         */
        addEntry: (state, action) => {
            let { metadata, formSelections } = action.payload;
            if (!metadata) metadata = { hostA: "", portA: "", hostB: "", portB: "" };
            if (!formSelections) formSelections = { hostA: "", portA: "", hostB: "", portB: "", radioASelected: true };
            state.metadata.push(metadata);
            state.timelineData.push([]);
            state.formSelections.push(formSelections);
            state.entryTitles.push("");
            state.propDelays.push(null);
        },

        /**
         * Toggle the `alignTime` state
         */
        toggleAlignTime: (state) => {
            state.alignTime = !state.alignTime;
        },

        /**
         * Remove a timeline entry
         * - action.payload: index of the entry
         */
        removeEntry: (state, action) => {
            // action.payload is entry index
            state.metadata.splice(action.payload, 1);
            state.timelineData.splice(action.payload, 1);
            state.formSelections.splice(action.payload, 1);
            state.entryTitles.splice(action.payload, 1);
            state.propDelays.splice(action.payload, 1);
        },

        /**
         * Set the dropdown options for the form
         * - action.payload: {ip_addr: string, ports: string[]}[]
         */
        setFormOpts: (state, action) => {
            state.formOpts = action.payload;
        },

        /**
         * Set the current form selections for the current entry
         * - action.payload: {formSelection: { hostA: string, portA: string, hostB: string, portB: string, radioASelected: boolean }, index}
         */
        setFormSelections: (state, action) => {
            const {data, index} = action.payload;
            state.formSelections[ index ] = data;
        },

        swapFormSelections: (state, action) => {
            // action.payload is entry index
            const index = action.payload;
            const formSelections = state.formSelections[ index ];
            const { hostA, portA, hostB, portB, radioASelected } = formSelections;
            state.formSelections[ index ] = { hostA: hostB, portA: portB, hostB: hostA, portB: portA, radioASelected: !radioASelected };
        },

        /**
         * Set the `metadata` for the current entry
         * - action.payload: {metadata: { hostA: string, portA: string, hostB: string, portB: string, localhost: string }, index}
         */
        setMetadata: (state, action) => {
            const {data, index} = action.payload;
            state.metadata[ index ] = data;
        },

        /**
         * Set the D3 data for the current entry
         */
        setTimelineData: (state, action) => {
            const {data, index} = action.payload;
            state.timelineData[ index ] = data;
        },

        /**
         * Set the title of the current entry
         */
        setEntryTitle: (state, action) => {
            const {data, index} = action.payload;
            state.entryTitles[ index ] = data;
        },

        /**
         * Set the propagation delay for the current entry
         */
        setPropDelay: (state, action) => {
            const {data, index} = action.payload;
            state.propDelays[ index ] = data;
        },

        /**
         * Set whether to focus on the last entry on view initialization
         */
        setShouldFocusLastEntry: (state, action) => {
            state.shouldFocusLastEntry = action.payload;
        },
    },
});

export const {
    addEntry,
    toggleAlignTime,
    removeEntry,
    setFormOpts,
    setFormSelections,
    setMetadata,
    setTimelineData,
    setEntryTitle,
    setPropDelay,
    swapFormSelections,
    setShouldFocusLastEntry,
} = timelineViewSlice.actions;

export default timelineViewSlice.reducer;