import { CloseButton, Form } from "react-bootstrap";
import { useDispatch } from 'react-redux';
import { removeEntry } from '../timelineViewSlice';
import "./TimelineEntry.css";

export default function TimelineEntry({ entryIndex }) {
    const dispatch = useDispatch();
    return (
        <div className="timeline-entry d-flex align-items-center flex-column mb-3">
            <CloseButton className="align-self-end mt-3 me-3" onClick={() => {
                dispatch(removeEntry(entryIndex));
            }} />
            <Form.Control placeholder="Entry title" className="entry-title mb-2" />
        </div>
    );
}