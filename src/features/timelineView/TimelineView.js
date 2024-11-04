import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Toggle from 'react-toggle';

export default function TimelineView() {
    const packets = useSelector((state) => state.data.packets);
    const dispatch = useDispatch();

    useEffect(() => {
    }
        , [ dispatch ]);


    return (
        <div>
            <Container>
                <Row className="mt-3 mb-3">
                    <Col xs={3}>Align time: <Toggle></Toggle></Col>
                    <Col></Col>
                    <Col xs={3}><FontAwesomeIcon icon={faCirclePlus} size="xl" />  Add entry</Col>
                </Row>
            </Container>
        </div>
    );
}