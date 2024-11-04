import "./TimelineEntry.css";
import { CloseButton, Form } from "react-bootstrap";
import { removeEntry } from '../timelineViewSlice';
import { useDispatch } from 'react-redux';

export default function TimelineEntry({ entryIndex }) {
    const dispatch = useDispatch();
    return (
        <div className="timeline-entry d-flex align-items-center flex-column">
            <CloseButton className="align-self-end mt-3 me-3" onClick={() => {
                dispatch(removeEntry(entryIndex));
            }} />
            <Form.Control placeholder="Entry title" className="entry-title mb-2" />
        </div>
    );
}