import { faChevronLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { Button, Col, Container, Form, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
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
                    <Navbar fixed="top" className="bg-body-tertiary">
                        <Container>
                            <Form.Check type="switch" label="Align Time" className="ms-3 text-start" />
                            <div className="me-5">
                                <Button className="rounded-circle" variant="light" onClick={
                                    () => {
                                        dispatch(addEntry({ metadata: null, formSelections: null }));
                                    }
                                } ><FontAwesomeIcon icon={faPlus} size="l" /></Button>  Add entry
                            </div>
                        </Container>
                    </Navbar>
                    <Container style={{"margin-top": "60px"}}>
                        {timelineData.map((entry, index) => {
                            return (
                                <TimelineEntry entryIndex={index} key={index} />
                            );
                        })}
                    </Container>
                    <div style={{ position: "fixed", left: 40, top: "50vh", zIndex: 10 }}>
                        <Button className="rounded-circle" variant="light" onClick={onNavigateToGraph}><FontAwesomeIcon icon={faChevronLeft} size="2xl" /></Button>
                    </div>
                </div>
            );
        default:
            break;
    }


}