import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Button, Container, Form, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import TimelineEntry from './components/TimelineEntry';
import { addEntry, setShouldFocusLastEntry, toggleAlignTime } from './timelineViewSlice';

export default function TimelineView() {
    const dispatch = useDispatch();
    const timelineData = useSelector((state) => state.timelineView.timelineData);
    const shouldFocusLastEntry = useSelector((state) => state.timelineView.shouldFocusLastEntry);
    const [ timelineVisible, setTimelineVisible ] = useState(true);

    useEffect(() => {

        if (shouldFocusLastEntry) {
            dispatch(setShouldFocusLastEntry(false));
            if (timelineVisible) {
                const lastEntry = document.getElementById(`entry-${timelineData.length - 1}`);
                lastEntry.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

                // Flash the entry (shadow)
                lastEntry.style.boxShadow = "0 0 10px 5px lightblue";
                setTimeout(() => {
                    lastEntry.style.boxShadow = "none";
                }, 1000);
            }
        }
    }, [dispatch, shouldFocusLastEntry, timelineData.length, timelineVisible]);




    return (
        <div>
            <Navbar fixed="top" className="bg-body-tertiary d-flex justify-content-end pe-5">
                <Form.Check type="switch" label="Align Time" className="ms-3 text-start me-4" onChange={() => dispatch(toggleAlignTime())} />
                <div className="me-4">
                    <Button className="rounded-circle" variant="light" onClick={
                        () => {
                            dispatch(addEntry({ metadata: null, formSelections: null }));
                        }
                    } >
                        <FontAwesomeIcon icon={faPlus} size="l" />
                    </Button>  Add entry
                </div>
                <Button variant="light" onClick={() => { setTimelineVisible(!timelineVisible); }}>({timelineVisible ? "Hide" : "Show"} Timeline)</Button>
            </Navbar>
            {timelineVisible ? (<Container>
                {timelineData.map((entry, index) => {
                    return (
                        <TimelineEntry entryIndex={index} key={index} />
                    );
                })}
            </Container>) : null}
        </div>
    );


}