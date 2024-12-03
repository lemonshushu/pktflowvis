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
    const entryVisibleStates = useSelector((state) => state.timelineView.entryVisibleStates);

    useEffect(() => {

        if (shouldFocusLastEntry) {
            if (!timelineVisible) setTimelineVisible(true);
            else {
                dispatch(setShouldFocusLastEntry(false));
                const lastEntry = document.getElementById(`entry-${timelineData.length - 1}`);
                lastEntry.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

                // Flash the entry (shadow)
                lastEntry.style.boxShadow = "0 0 10px 5px lightblue";
                setTimeout(() => {
                    lastEntry.style.boxShadow = "none";
                }, 1000);
            }
        }
    }, [ dispatch, shouldFocusLastEntry, timelineData.length, timelineVisible ]);




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
                        <TimelineEntry entryIndex={index} key={index} hidden={!entryVisibleStates[index]} />
                    );
                })}
            </Container>) : null}
        </div>
    );


}
/*
import { faChevronLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { setCurrentView } from '../data/dataSlice';
import TimelineEntry from './components/TimelineEntry';
import { addEntry } from './timelineViewSlice';
import { Top } from '../Menubar';

export default function TimelineView() {
    const dispatch = useDispatch();
    const timelineData = useSelector((state) => state.timelineView.timelineData);
    const currentView = useSelector((state) => state.data.currentView);

    useEffect(() => {
        //setCurrentView('timeline');
    }
        , [ dispatch ]);

    const onNavigateToGraph = () => {
        dispatch(setCurrentView('graph'));
    };

    const onNavigateToTimeline = () => {
        dispatch(setCurrentView('timeline'));
    };

    switch (currentView) {
        case 'fileUpload':
            return <Navigate to="/" />;
        case 'graph':
            return <Navigate to="/graph" />;
        case 'timeline':
            return (
                <div>
                    <Top onNavigateToTimeline={onNavigateToTimeline} onNavigateToGraph={onNavigateToGraph} />
                    <Container>
                        <Row className="mt-3 mb-3">
                            <Col xs={3}><Form.Check type="switch" label="Align Time" className="ms-3 text-start" /></Col>
                            <Col></Col>
                            <Col xs={3}>
                                <Button className="rounded-circle" variant="light" onClick={
                                    () => {
                                        dispatch(addEntry({ metadata: null, formSelections: null }));
                                    }
                                } ><FontAwesomeIcon icon={faPlus} size="l" /></Button>  Add entry</Col>
                        </Row>
                        {timelineData.map((entry, index) => {
                            return (
                                <TimelineEntry entryIndex={index} key={index} />
                            );
                        })}
                    </Container>
                    <div style={{ position: "absolute", left: 40, top: "50vh", zIndex: 10 }}>
                        <Button className="rounded-circle" variant="light" onClick={onNavigateToGraph}><FontAwesomeIcon icon={faChevronLeft} size="2xl" /></Button>
                    </div>
                </div>
            );
        default:
            break;
    }


}
*/