import { faChevronLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Toggle from 'react-toggle';
import { setCurrentView } from '../data/dataSlice';
import TimelineEntry from './components/TimelineEntry';
import { addEntry } from './timelineViewSlice';

export default function TimelineView() {
    const dispatch = useDispatch();
    const timelineData = useSelector((state) => state.timelineView.timelineData);
    const currentView = useSelector((state) => state.data.currentView);

    useEffect(() => {
        setCurrentView('timeline');
    }
        , [ dispatch ]);

    const onNavigateToGraph = () => {
        dispatch(setCurrentView('graph'));
    };


    switch (currentView) {
        case 'fileUpload':
            return <Navigate to="/" />;
        case 'graph':
            return <Navigate to="/graph" />;
        case 'timeline':
            return (
                <div>
                    <Container>
                        <Row className="mt-3 mb-3">
                            <Col xs={3}>Align time: <Toggle></Toggle></Col>
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