import { faChevronLeft, faCirclePlus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import Toggle from 'react-toggle';
import { addEntry } from './timelineViewSlice';
import TimelineEntry from './components/TimelineEntry';

export default function TimelineView() {
    const packets = useSelector((state) => state.data.packets);
    const dispatch = useDispatch();

    useEffect(() => {
    }
        , [ dispatch ]);


    return (
        packets ? 
        <div>
            <Container>
                <Row className="mt-3 mb-3">
                    <Col xs={3}>Align time: <Toggle></Toggle></Col>
                    <Col></Col>
                    <Col xs={3}>
                        <Button className="rounded-circle" variant="light" onClick={
                            () => {
                                dispatch(addEntry());
                            }
                        } ><FontAwesomeIcon icon={faPlus} size="l" /></Button>  Add entry</Col>
                </Row>
                <TimelineEntry />
            </Container>
            <div style={{ position: "absolute", left: 40, top: "50vh", zIndex: 10 }}>
                <Link to="/graph">
                    <Button className="rounded-circle" variant="light"><FontAwesomeIcon icon={faChevronLeft} size="2xl" /></Button>
                </Link>
            </div>
        </div> : <Navigate to="/" />
    );
}