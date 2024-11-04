import { useState } from "react";
import { Button, CloseButton, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { removeEntry } from '../timelineViewSlice';
import "./TimelineEntry.css";

export default function TimelineEntry({ entryIndex }) {
    const dispatch = useDispatch();
    const timelineViewOpts = useSelector((state) => state.timelineView.timelineViewOpts);

    const [ hostA, setHostA ] = useState("");
    const [ hostAIndex, setHostAIndex ] = useState(null);
    const [ portA, setPortA ] = useState("");
    const [ hostB, setHostB ] = useState("");
    const [ hostBIndex, setHostBIndex ] = useState(null);
    const [ portB, setPortB ] = useState("");
    const [ radioASelected, setRadioASelected ] = useState(true);


    const onHostAChange = (e) => {
        setHostA(e.target.value);
        setHostAIndex(timelineViewOpts.findIndex((opt) => opt.ip_addr === e.target.value));
    };

    const onPortAChange = (e) => {
        setPortA(e.target.value);
    };

    const onHostBChange = (e) => {
        setHostB(e.target.value);
        setHostBIndex(timelineViewOpts.findIndex((opt) => opt.ip_addr === e.target.value));
    };

    const onPortBChange = (e) => {
        setPortB(e.target.value);
    };

    const onRadioChange = (e) => {
        setRadioASelected(e.target.value === "A");
    };

    return (
        <div className="timeline-entry d-flex align-items-center flex-column mb-3">
            <CloseButton className="align-self-end mt-3 me-3" onClick={() => {
                dispatch(removeEntry(entryIndex));
            }} />
            <Form.Control placeholder="Entry title" className="entry-title mb-2" />
            <svg width="80%" height="200px" className="timeline-svg" />
            <Form className="entry-form p-4">
                <Row>
                    <Col xs={5}></Col>
                    <Col xs={3}></Col>
                    <Col xs={2}>localhost</Col>
                    <Col xs={1}></Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={5} className="d-flex align-items-center justify-content-center">
                        <Form.Label><strong>Host A: </strong></Form.Label>
                        <Form.Select className="ms-3" style={{ width: 250 }} onChange={onHostAChange}>
                            <option></option>
                            {timelineViewOpts.map((opt, index) => {
                                return (<option key={index}>{opt.ip_addr}</option>);
                            })}
                        </Form.Select>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-center">
                        <Form.Label>Port: </Form.Label>
                        <Form.Select className="ms-3" style={{ width: 150 }} onChange={onPortAChange}>
                            {timelineViewOpts[ hostAIndex ] ? timelineViewOpts[ hostAIndex ].ports.map((port, index) => {
                                return (<option key={index}>{port}</option>);
                            }) : null
                            }
                        </Form.Select>
                    </Col>
                    <Col xs={2} className="d-flex align-items-center justify-content-center">
                        <Form.Check type="radio" name="localhost" value="A" onChange={onRadioChange} defaultChecked />
                    </Col>
                    <Col xs={1} className="d-flex align-items-center justify-content-center">
                        <Button>Save</Button>
                    </Col>
                </Row>
                <Row>
                    <Col xs={5} className="d-flex align-items-center justify-content-center">
                        <Form.Label><strong>Host B: </strong></Form.Label>
                        <Form.Select className="ms-3" style={{ width: 250 }} onChange={onHostBChange}>
                            <option></option>
                            {timelineViewOpts.map((opt, index) => {
                                return (<option key={index}>{opt.ip_addr}</option>);
                            })}</Form.Select>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-center">
                        <Form.Label>Port: </Form.Label>
                        <Form.Select className="ms-3" style={{ width: 150 }} onChange={onPortBChange}>
                            {timelineViewOpts[ hostBIndex ] ? timelineViewOpts[ hostBIndex ].ports.map((port, index) => {
                                return (<option key={index}>{port}</option>);
                            }) : null
                            }
                        </Form.Select>
                    </Col>
                    <Col xs={2} className="d-flex align-items-center justify-content-center">
                        <Form.Check type="radio" name="localhost" value="B" onChange={onRadioChange} />
                    </Col>
                    <Col xs={1} className="d-flex align-items-center justify-content-center">
                    </Col>
                </Row>
            </Form>
        </div>
    );
}