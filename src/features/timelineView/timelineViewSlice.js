import { createSlice } from '@reduxjs/toolkit';

export const timelineViewSlice = createSlice({
    name: 'timelineView',
    initialState: {
        /**
         * Index of the entry being currently operated on
         */
        currentEntry: null,

        /**
         * Whether to align the time of multiple timeline entries
         */
        alignTime: false,

        /**
         * The current {hostA, portA, hostB, portB, localhost, propDelay} for each timeline entry
         */
        metadata: [],

        /**
         * Whether the metadata has been changed since the last time it was saved
         */
        isMetaNew: false,

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
    },
    reducers: {
        /**
         * Set the current entry index (for the purpose of operating on it) \
         * - action.payload : index of the entry
         */
        setCurrentEntry: (state, action) => {
            state.currentEntry = action.payload;
        },

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
         * - action.payload: { hostA: string, portA: string, hostB: string, portB: string, radioASelected: boolean }
         */
        setFormSelections: (state, action) => {
            state.formSelections[ state.currentEntry ] = action.payload;
        },

        /**
         * Set the `metadata` for the current entry
         * - action.payload: { hostA: string, portA: string, hostB: string, portB: string, localhost: string }
         */
        setMetadata: (state, action) => {
            state.metadata[ state.currentEntry ] = action.payload;
            state.isMetaNew = true;
        },

        /**
         * Set whether the metadata has been changed since the last time it was saved
         */
        setIsMetaNew: (state, action) => {
            state.isMetaNew = action.payload;
        },

        /**
         * Set the D3 data for the current entry
         */
        setTimelineData: (state, action) => {
            state.timelineData[ state.currentEntry ] = action.payload;
        },
    },
});

export const { setCurrentEntry, addEntry, toggleAlignTime, removeEntry, setFormOpts, setFormSelections, setMetadata, setTimelineData, setIsMetaNew } = timelineViewSlice.actions;

export default timelineViewSlice.reducer;