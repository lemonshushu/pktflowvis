import * as d3 from "d3";
import { useEffect, useRef } from 'react';
import { Button, CloseButton, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { removeEntry, setMetadata, setFormSelections, setTimelineData, setCurrentEntry, setIsMetaNew } from '../timelineViewSlice';
import "./TimelineEntry.css";

export default function TimelineEntry({ entryIndex }) {
    const dispatch = useDispatch();
    const formOpts = useSelector((state) => state.timelineView.formOpts);
    const formSelections = useSelector((state) => state.timelineView.formSelections);
    const formSelection = formSelections[ entryIndex ];
    const metadata = useSelector((state) => state.timelineView.metadata);
    const packets = useSelector((state) => state.data.packets);
    const timelineData = useSelector((state) => state.timelineView.timelineData);
    const svgRef = useRef(null);
    const isMetaNew = useSelector((state) => state.timelineView.isMetaNew);

    useEffect(() => {
        const ipA = metadata[ entryIndex ].hostA;
        const ipB = metadata[ entryIndex ].hostB;
        const portA = metadata[ entryIndex ].portA;
        const portB = metadata[ entryIndex ].portB;
        if (isMetaNew) {
            dispatch(setIsMetaNew(false));
            // Filter out data from `packets`
            const data = packets.filter((packet) => {

                if (packet._source.layers.ip["ip.src"] === ipA && packet._source.layers.ip["ip.dst"] === ipB) {
                    if (packet._source.layers.tcp && packet._source.layers.tcp["tcp.srcport"] === portA && packet._source.layers.tcp["tcp.dstport"] === portB) {
                        return true;
                    } else if (packet._source.layers.udp && packet._source.layers.udp["udp.srcport"] === portA && packet._source.layers.udp["udp.dstport"] === portB) {
                        return true;
                    }
                } else if (packet._source.layers.ip["ip.src"] === ipB && packet._source.layers.ip["ip.dst"] === ipA) {
                    if (packet._source.layers.tcp && packet._source.layers.tcp["tcp.srcport"] === portB && packet._source.layers.tcp["tcp.dstport"] === portA) {
                        return true;
                    }
                    else if (packet._source.layers.udp && packet._source.layers.udp["udp.srcport"] === portB && packet._source.layers.udp["udp.dstport"] === portA) {
                        return true;
                    }
                }

                return false;
            }
            );

            // If data is empty, return
            if (data.length === 0) {
                alert("No data found for the selected hosts and ports");
                return;
            }

            // Sort data by time
            data.sort((a, b) => a._source.layers.frame["frame.time_epoch"] - b._source.layers.frame["frame.time_epoch"]);

            dispatch(setCurrentEntry(entryIndex));
            dispatch(setTimelineData(data));
        }

    }, [ metadata, packets, dispatch, entryIndex, isMetaNew ]);

    useEffect(() => {

        // Calculate average propagation delay and add to `metadata`
        if (timelineData[ entryIndex ].length > 0 && !metadata[ entryIndex ].propDelay) {
            const data = timelineData[ entryIndex ];
            const delays = [];
            for (let i = 0; i < data.length - 1; i++) {
                const delay = data[ i + 1 ]._source.layers.frame["frame.time_epoch"] - data[ i ]._source.layers.frame["frame.time_epoch"];
                delays.push(delay);
            }

            const avgDelay = delays.reduce((acc, curr) => acc + curr, 0) / delays.length;
            dispatch(setMetadata({ ...metadata[ entryIndex ], propDelay: avgDelay }));
        }
    }, [ timelineData, entryIndex, dispatch, metadata ]);

    useEffect(() => {
        // Only proceed if `propDelay` is available in `metadata`
        if (!metadata[ entryIndex ].propDelay) {
            return;
        }
        // Render timeline from `timelineData`
        const data = timelineData[ entryIndex ];
        if (data.length === 0) {
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // The timeline has two horizontal lines, one for each host. The x-axis represents time.
        // The timestamp in the packets is the time of the host selected as localhost in `metadata`
        // Packets are displayed as arrows pointing from the source host to the destination host.
        // The slope of the arrow represents the propagation delay between the two hosts.
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = svgRef.current.clientHeight - margin.top - margin.bottom;

        // Draw Host A line
        svg.append("line")
            .attr("x1", margin.left)
            .attr("y1", height / 5)
            .attr("x2", width + margin.left)
            .attr("y2", height / 5)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw Host B line
        svg.append("line")
            .attr("x1", margin.left)
            .attr("y1", height * 4 / 5)
            .attr("x2", width + margin.left)
            .attr("y2", height * 4 / 5)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Label Host A
        svg.append("text")
            .attr("x", margin.left)
            .attr("y", height / 5 - 5)
            .text(metadata[ entryIndex ].hostA + ":" + metadata[ entryIndex ].portA)
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black");

        // Label Host B
        svg.append("text")
            .attr("x", margin.left)
            .attr("y", height * 4 / 5 - 5)
            .text(metadata[ entryIndex ].hostB + ":" + metadata[ entryIndex ].portB)
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black");




    }, [ metadata, entryIndex, timelineData, dispatch ]);


    const onHostAChange = (e) => {
        dispatch(setCurrentEntry(entryIndex));
        dispatch(setFormSelections({ ...formSelection, hostA: e.target.value, hostAIndex: formOpts.findIndex((opt) => opt.ip_addr === e.target.value) }));

    };

    const onPortAChange = (e) => {
        // dispatch(setFormSelections({ index: entryIndex, selection: { ...formSelection, portA: e.target.value } }));
        dispatch(setCurrentEntry(entryIndex));
        dispatch(setFormSelections({ ...formSelection, portA: e.target.value }));
    };

    const onHostBChange = (e) => {
        // dispatch(setFormSelections({ index: entryIndex, selection: { ...formSelection, hostB: e.target.value, hostBIndex: formOpts.findIndex((opt) => opt.ip_addr === e.target.value) } }));
        dispatch(setCurrentEntry(entryIndex));
        dispatch(setFormSelections({ ...formSelection, hostB: e.target.value, hostBIndex: formOpts.findIndex((opt) => opt.ip_addr === e.target.value) }));
    };

    const onPortBChange = (e) => {
        // dispatch(setFormSelections({ index: entryIndex, selection: { ...formSelection, portB: e.target.value } }));
        dispatch(setCurrentEntry(entryIndex));
        dispatch(setFormSelections({ ...formSelection, portB: e.target.value }));
    };

    const onRadioChange = (e) => {
        // dispatch(setFormSelections({ index: entryIndex, selection: { ...formSelection, radioASelected: e.target.value === "A" } }));
        dispatch(setCurrentEntry(entryIndex));
        dispatch(setFormSelections({ ...formSelection, radioASelected: e.target.value === "A" }));
    };

    const onResetClick = () => {
        const currentMeta = metadata[ entryIndex ];
        dispatch(setCurrentEntry(entryIndex));
        dispatch(setFormSelections({ hostA: currentMeta.hostA, portA: currentMeta.portA, hostB: currentMeta.hostB, portB: currentMeta.portB, radioASelected: currentMeta.localhost === "A" }));
    };

    const onFormSubmit = () => {
        if (!formSelection.hostA || !formSelection.portA || !formSelection.hostB || !formSelection.portB) {
            alert("Please fill out all fields");
            return;
        }

        if (formSelection.hostA === formSelection.hostB && formSelection.portA === formSelection.portB) {
            alert("Both hosts and ports cannot be the same");
            return;
        }
        dispatch(setCurrentEntry(entryIndex));
        dispatch(setMetadata({ hostA: formSelection.hostA, portA: formSelection.portA, hostB: formSelection.hostB, portB: formSelection.portB, localhost: formSelection.radioASelected ? "A" : "B" }));

    };

    return (
        <div className="timeline-entry d-flex align-items-center flex-column mb-3">
            <CloseButton className="align-self-end mt-3 me-3" onClick={() => {
                dispatch(removeEntry(entryIndex));
            }} />
            <Form.Control placeholder="Entry title" className="entry-title mb-2" />
            <svg width="80%" height="200px" className="timeline-svg" ref={svgRef} />
            <Form className="entry-form p-4">
                <Row>
                    <Col xs={5}></Col>
                    <Col xs={3}></Col>
                    <Col xs={2}>localhost</Col>
                    <Col xs={1}></Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={5} className="d-flex align-items-center justify-content-center">
                        <Form.Label column={false}><strong>Host A: </strong></Form.Label>
                        <Form.Select className="ms-3" style={{ width: 250 }} onChange={onHostAChange} value={formSelection.hostA}>
                            {formOpts.map((opt, index) => {
                                return (<option key={index}>{opt.ip_addr}</option>);
                            })}
                        </Form.Select>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-center">
                        <Form.Label column={false}>Port: </Form.Label>
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
                        <Form.Label column={false}><strong>Host B: </strong></Form.Label>
                        <Form.Select className="ms-3" style={{ width: 250 }} onChange={onHostBChange} value={formSelection.hostB}>
                            {formOpts.map((opt, index) => {
                                return (<option key={index}>{opt.ip_addr}</option>);
                            })}</Form.Select>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-center">
                        <Form.Label column={false}>Port: </Form.Label>
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
                        <Button onClick={onFormSubmit}>Save</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}