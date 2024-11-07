import { Button, CloseButton, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { removeEntry } from '../timelineViewSlice';
import "./TimelineEntry.css";
import { setFormSelections } from '../timelineViewSlice';

export default function TimelineEntry({ entryIndex }) {
    const dispatch = useDispatch();
    const formOpts = useSelector((state) => state.timelineView.formOpts);
    const formSelections = useSelector((state) => state.timelineView.formSelections);
    const formSelection = formSelections[entryIndex];

    const onHostAChange = (e) => {
        dispatch(setFormSelections({index: entryIndex, selection: {...formSelection, hostA: e.target.value, hostAIndex: formOpts.findIndex((opt) => opt.ip_addr === e.target.value)} }));
    };

    const onPortAChange = (e) => {
        dispatch(setFormSelections({index: entryIndex, selection: {...formSelection, portA: e.target.value}}));
    };

    const onHostBChange = (e) => {
        dispatch(setFormSelections({index: entryIndex, selection:  {...formSelection,hostB: e.target.value, hostBIndex: formOpts.findIndex((opt) => opt.ip_addr === e.target.value)} }));
    };

    const onPortBChange = (e) => {
        dispatch(setFormSelections({index: entryIndex, selection: {...formSelection,portB: e.target.value}}));
    };

    const onRadioChange = (e) => {
        dispatch(setFormSelections({index: entryIndex, selection: {...formSelection,radioASelected: e.target.value === "A"} }));
    };

    const onResetClick = () => {
        dispatch(setFormSelections({index: entryIndex, selection: {hostA: "", hostAIndex: null, portA: "", hostB: "", hostBIndex: null, portB: "", radioASelected: true}}));
    }

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
                        <Form.Select className="ms-3" style={{ width: 250 }} onChange={onHostAChange} value={formSelection.hostA}>
                            <option></option>
                            {formOpts.map((opt, index) => {
                                return (<option key={index}>{opt.ip_addr}</option>);
                            })}
                        </Form.Select>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-center">
                        <Form.Label>Port: </Form.Label>
                        <Form.Select className="ms-3" style={{ width: 150 }} onChange={onPortAChange} value={formSelection.portA}>
                            {formOpts[ formSelection.hostAIndex ] ? formOpts[ formSelection.hostAIndex ].ports.map((port, index) => {
                                return (<option key={index}>{port}</option>);
                            }) : null
                            }
                        </Form.Select>
                    </Col>
                    <Col xs={2} className="d-flex align-items-center justify-content-center">
                        <Form.Check type="radio" name="localhost" value="A" onChange={onRadioChange} checked={formSelection.radioASelected} />
                    </Col>
                    <Col xs={1} className="d-flex align-items-center justify-content-center">
                        <Button variant="light" onClick={onResetClick}>Reset</Button>
                    </Col>
                </Row>
                <Row>
                    <Col xs={5} className="d-flex align-items-center justify-content-center">
                        <Form.Label><strong>Host B: </strong></Form.Label>
                        <Form.Select className="ms-3" style={{ width: 250 }} onChange={onHostBChange} value={formSelection.hostB}>
                            <option></option>
                            {formOpts.map((opt, index) => {
                                return (<option key={index}>{opt.ip_addr}</option>);
                            })}</Form.Select>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-center">
                        <Form.Label>Port: </Form.Label>
                        <Form.Select className="ms-3" style={{ width: 150 }} onChange={onPortBChange} value={formSelection.portB}>
                            {formOpts[ formSelection.hostBIndex ] ? formOpts[ formSelection.hostBIndex ].ports.map((port, index) => {
                                return (<option key={index}>{port}</option>);
                            }) : null
                            }
                        </Form.Select>
                    </Col>
                    <Col xs={2} className="d-flex align-items-center justify-content-center">
                        <Form.Check type="radio" name="localhost" value="B" onChange={onRadioChange} checked={!formSelection.radioASelected} />
                    </Col>
                    <Col xs={1} className="d-flex align-items-center justify-content-center">
                    <Button>Save</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}