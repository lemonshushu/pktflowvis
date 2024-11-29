import { faFloppyDisk, faPencil, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as d3 from "d3";
import { useEffect, useRef, useState } from 'react';
import { Button, Card, CloseButton, Col, Form, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import {
    removeEntry,
    setEntryTitle,
    setFormSelections,
    setMetadata,
    setPropDelay,
    setTimelineData,
} from '../timelineViewSlice';
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
    const entryTitles = useSelector((state) => state.timelineView.entryTitles);
    const propDelays = useSelector((state) => state.timelineView.propDelays);

    const [ titleText, setTitleText ] = useState(entryTitles[ entryIndex ]);
    const [ titleEditMode, setTitleEditMode ] = useState(false);
    const [ previousMetadata, setPreviousMetadata ] = useState(null);
    const [ formShouldReset, setFormShouldReset ] = useState(false);
    const [ timelineDataShouldUpdate, setTimelineDataShouldUpdate ] = useState(false);
    const [ propDelayShouldUpdate, setPropDelayShouldUpdate ] = useState(false);
    const [ d3ShouldRender, setD3ShouldRender ] = useState(true);


    /**
     * Filter out packets based on the selected hosts and ports, sort them by time, and set the timeline data for D3 visualization
     */
    useEffect(() => {
        const ipA = metadata[ entryIndex ].hostA;
        const ipB = metadata[ entryIndex ].hostB;
        const portA = metadata[ entryIndex ].portA;
        const portB = metadata[ entryIndex ].portB;
        if (timelineDataShouldUpdate && !formShouldReset) {
            setTimelineDataShouldUpdate(false);
            // Filter out data from `packets`
            let data = packets.filter((packet) => {

                if (packet._source.layers.ip[ "ip.src" ] === ipA && packet._source.layers.ip[ "ip.dst" ] === ipB) {
                    if (packet._source.layers.tcp && packet._source.layers.tcp[ "tcp.srcport" ] === portA && packet._source.layers.tcp[ "tcp.dstport" ] === portB) {
                        return true;
                    } else if (packet._source.layers.udp && packet._source.layers.udp[ "udp.srcport" ] === portA && packet._source.layers.udp[ "udp.dstport" ] === portB) {
                        return true;
                    }
                } else if (packet._source.layers.ip[ "ip.src" ] === ipB && packet._source.layers.ip[ "ip.dst" ] === ipA) {
                    if (packet._source.layers.tcp && packet._source.layers.tcp[ "tcp.srcport" ] === portB && packet._source.layers.tcp[ "tcp.dstport" ] === portA) {
                        return true;
                    }
                    else if (packet._source.layers.udp && packet._source.layers.udp[ "udp.srcport" ] === portB && packet._source.layers.udp[ "udp.dstport" ] === portA) {
                        return true;
                    }
                }
                return false;
            }
            );

            // If data is empty, return (i.e., No traffic between the selected hosts and ports)
            if (data.length === 0) {
                alert("No data found for the selected hosts and ports");

                // Revert to previous metadata
                dispatch(setMetadata({ data: previousMetadata, index: entryIndex }));
                setFormShouldReset(true);
                return;
            }

            // Sort data by time
            data = data.sort((a, b) => parseFloat(a._source.layers.frame[ "frame.time_epoch" ]) - parseFloat(b._source.layers.frame[ "frame.time_epoch" ]));

            dispatch(setTimelineData({ data, index: entryIndex }));
            setPropDelayShouldUpdate(true);
        }

    }, [ metadata, packets, dispatch, entryIndex, timelineDataShouldUpdate, previousMetadata, formShouldReset ]);


    /**
    * Calculate average propagation delay between packets and set it in `metadata.propDelay`
    */
    useEffect(() => {
        // Calculate propagation delay using RTT between TX and RX packets
        if (propDelayShouldUpdate) {
            const data = timelineData[ entryIndex ];
            // Print `data`
            console.log(data);
            const delays = [];

            // Determine local and remote IP addresses and ports
            const isLocalHostA = metadata[ entryIndex ].localhost === "A";
            const localIP = isLocalHostA ? metadata[ entryIndex ].hostA : metadata[ entryIndex ].hostB;
            const localPort = isLocalHostA ? metadata[ entryIndex ].portA : metadata[ entryIndex ].portB;
            const remoteIP = isLocalHostA ? metadata[ entryIndex ].hostB : metadata[ entryIndex ].hostA;
            const remotePort = isLocalHostA ? metadata[ entryIndex ].portB : metadata[ entryIndex ].portA;

            // Helper function to extract packet info
            function getPacketInfo(packet) {
                const srcIP = packet._source.layers.ip[ "ip.src" ];
                const dstIP = packet._source.layers.ip[ "ip.dst" ];
                let srcPort, dstPort;

                if (packet._source.layers.tcp) {
                    srcPort = packet._source.layers.tcp[ "tcp.srcport" ];
                    dstPort = packet._source.layers.tcp[ "tcp.dstport" ];
                } else if (packet._source.layers.udp) {
                    srcPort = packet._source.layers.udp[ "udp.srcport" ];
                    dstPort = packet._source.layers.udp[ "udp.dstport" ];
                } else {
                    // Not TCP or UDP, cannot get ports
                    srcPort = null;
                    dstPort = null;
                }

                return { srcIP, dstIP, srcPort, dstPort };
            }

            for (let i = 0; i < data.length - 1; i++) {
                const currentPacket = data[ i ];
                const currentTime = parseFloat(currentPacket._source.layers.frame[ "frame.time_epoch" ]);
                const currentPacketInfo = getPacketInfo(currentPacket);

                // Determine if current packet is TX (from local IP and port to remote IP and port)
                const isCurrentTX = currentPacketInfo.srcIP === localIP &&
                    currentPacketInfo.dstIP === remoteIP &&
                    currentPacketInfo.srcPort === localPort &&
                    currentPacketInfo.dstPort === remotePort;

                if (isCurrentTX) {
                    // Skip all consecutive TX packets
                    let nextPacket;
                    let nextTime;
                    let isNextRX = false;

                    let j = i + 1;
                    while (j < data.length) {
                        nextPacket = data[ j ];
                        nextTime = parseFloat(nextPacket._source.layers.frame[ "frame.time_epoch" ]);
                        const nextPacketInfo = getPacketInfo(nextPacket);

                        // Check if next packet is RX
                        isNextRX = nextPacketInfo.srcIP === remoteIP &&
                            nextPacketInfo.dstIP === localIP &&
                            nextPacketInfo.srcPort === remotePort &&
                            nextPacketInfo.dstPort === localPort;

                        if (isNextRX) {
                            break; // Exit loop once RX packet is found
                        }
                        j++;
                    }

                    if (isNextRX) {
                        const delta = nextTime - currentTime;
                        if (delta > 0) {
                            delays.push(delta);
                        }
                        i = j + 1; // Update i to skip processed packets
                    }
                }
            }


            // If no valid delays are found, set a default propagation delay
            let avgDelay;
            if (delays.length > 0) {
                // Since delta is RTT, the propagation delay is half of the average RTT
                avgDelay = (delays.reduce((acc, curr) => acc + curr, 0) / delays.length) / 2;
            } else {
                avgDelay = 0.001; // Default to 1 millisecond if no delays are found
            }

            dispatch(setPropDelay({ data: avgDelay, index: entryIndex }));
            setPropDelayShouldUpdate(false);
            setD3ShouldRender(true);
        }
    }, [ timelineData, entryIndex, dispatch, metadata, propDelayShouldUpdate ]);






    /**
     * D3 visualization of the timeline
     */
    useEffect(() => {
        if (!d3ShouldRender) return;
        setD3ShouldRender(false);
        const propDelay = propDelays[ entryIndex ];
        // Print propd
        console.log("propDelay: " + propDelay);
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
        // ADD YOUR CODE HERE
        // After svg.selectAll("*").remove();

        const margin = { top: 20, right: 30, bottom: 50, left: 80 };
        const svgWidth = svgRef.current.clientWidth - margin.left - margin.right;
        const svgHeight = svgRef.current.clientHeight - margin.top - margin.bottom;

        const svgGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Define host positions
        const hostAY = 0;
        const hostBY = svgHeight;

        // Get metadata and constants
        const ipA = metadata[ entryIndex ].hostA;
        const ipB = metadata[ entryIndex ].hostB;
        const localhost = metadata[ entryIndex ].localhost; // "A" or "B"

        // Extract times and define scales
        let times = data.map(d => parseFloat(d._source.layers.frame[ "frame.time_epoch" ]));

        const timeMin = d3.min(times);
        const timeMax = d3.max(times);

        // Add padding to time domain
        const timePadding = (timeMax - timeMin) * 0.05; // 5% padding on each side
        const timeDomainStart = timeMin - timePadding;
        const timeDomainEnd = timeMax + timePadding;

        const xScale = d3.scaleTime()
            .domain([ new Date(timeDomainStart * 1000), new Date(timeDomainEnd * 1000) ])
            .range([ 0, svgWidth ]);

        const xAxis = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.timeFormat("%H:%M:%S.%L")); // Format to show hours, minutes, seconds, milliseconds

        const yPositions = {
            "A": hostAY,
            "B": hostBY
        };

        // Draw host lines
        svgGroup.append("line")
            .attr("class", "host-line")
            .attr("x1", 0)
            .attr("y1", hostAY)
            .attr("x2", svgWidth)
            .attr("y2", hostAY)
            .attr("stroke", "black");

        svgGroup.append("line")
            .attr("class", "host-line")
            .attr("x1", 0)
            .attr("y1", hostBY)
            .attr("x2", svgWidth)
            .attr("y2", hostBY)
            .attr("stroke", "black");

        // Add host labels
        svgGroup.append("text")
            .attr("x", -margin.left + 10)
            .attr("y", hostAY)
            .attr("dy", "0.35em")
            .text(`${ipA}:${metadata[ entryIndex ].portA}`)
            .style("font-size", "12px");

        svgGroup.append("text")
            .attr("x", -margin.left + 10)
            .attr("y", hostBY)
            .attr("dy", "0.35em")
            .text(`${ipB}:${metadata[ entryIndex ].portB}`)
            .style("font-size", "12px");

        // Define arrowhead marker
        svg.append("defs").append("marker")
            .attr("id", `arrowhead-${entryIndex}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 10)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "currentColor"); // Use current color

        // Define color scale for protocols
        const protocolSet = new Set();
        data.forEach(packet => {
            const layers = Object.keys(packet._source.layers);
            layers.forEach(layer => protocolSet.add(layer));
        });
        const protocolList = Array.from(protocolSet);
        const protocolColor = d3.scaleOrdinal()
            .domain(protocolList)
            .range(d3.schemeCategory10.concat(d3.schemeSet3)); // Extend color scheme if needed

        // Process packets
        const packets = data.map(packet => {
            const time = parseFloat(packet._source.layers.frame[ "frame.time_epoch" ]);
            const srcIP = packet._source.layers.ip[ "ip.src" ];
            const dstIP = packet._source.layers.ip[ "ip.dst" ];
            let sourceHost, destHost;
            if (srcIP === ipA && dstIP === ipB) {
                sourceHost = "A";
                destHost = "B";
            } else if (srcIP === ipB && dstIP === ipA) {
                sourceHost = "B";
                destHost = "A";
            } else {
                // Should not happen
                console.warn("Packet does not match hosts", packet);
            }

            // Extract all protocol layers excluding frame and ip
            const layers = Object.keys(packet._source.layers);
            const l7Protocols = layers.filter(layer => ![ "frame", "ip", "eth", "data" ].includes(layer));

            // Join protocols into a single string
            const l7Protocol = l7Protocols.length > 0 ? l7Protocols.join(", ") : "Unknown";

            return {
                time,
                sourceHost,
                destHost,
                l7Protocol,
            };
        });

        // Compute send and receive times
        const processedPackets = packets.map(packet => {
            const { time, sourceHost, destHost, l7Protocol } = packet;
            let sendTime, receiveTime;
            if (localhost === sourceHost) {
                // Timestamps are send times
                sendTime = time;
                receiveTime = sendTime + propDelay;
            } else {
                // Timestamps are receive times
                receiveTime = time;
                sendTime = receiveTime - propDelay;
            }
            return {
                sendTime,
                receiveTime,
                sourceHost,
                destHost,
                l7Protocol,
            };
        });

        // Create tooltip div (hidden by default)
        const tooltip = d3.select(svgRef.current.parentNode)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#f9f9f9")
            .style("padding", "5px")
            .style("border", "1px solid #d3d3d3")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Draw packets as arrows
        const packetLinesGroup = svgGroup.append("g").attr("class", "packet-lines");

        const packetLines = packetLinesGroup.selectAll(".packet")
            .data(processedPackets)
            .enter()
            .append("line")
            .attr("class", "packet")
            .attr("x1", d => xScale(new Date(d.sendTime * 1000)))
            .attr("y1", d => yPositions[ d.sourceHost ])
            .attr("x2", d => xScale(new Date(d.receiveTime * 1000)))
            .attr("y2", d => yPositions[ d.destHost ])
            .attr("stroke", d => protocolColor(d.l7Protocol))
            .attr("stroke-width", 3) // Increased thickness
            .attr("marker-end", `url(#arrowhead-${entryIndex})`)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", 5);
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`Protocol: ${d.l7Protocol}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 3);
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add x-axis
        const xAxisGroup = svgGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${svgHeight + 10})`)
            .call(xAxis);

        // Add grid lines with dotted lines
        svgGroup.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0, ${svgHeight + 10})`)
            .call(
                d3.axisBottom(xScale)
                    .ticks(5)
                    .tickSize(-svgHeight - 10) // Extend grid lines upward
                    .tickFormat("")
            )
            .selectAll(".tick line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-dasharray", "2,2"); // Dotted lines

        // Bring the x-axis to the front
        svgGroup.selectAll(".x-axis").raise();

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([ 0.5, 20 ]) // Adjust scale extent as needed
            .translateExtent([ [ 0, 0 ], [ svgWidth, svgHeight ] ])
            .on("zoom", zoomed);

        svg.call(zoom);

        // Zoom function
        function zoomed(event) {
            const newXScale = event.transform.rescaleX(xScale);

            // Update x-axis
            xAxisGroup.call(
                xAxis.scale(newXScale)
            );

            // Update grid lines
            svgGroup.select(".grid")
                .call(
                    d3.axisBottom(newXScale)
                        .ticks(5)
                        .tickSize(-svgHeight - 10)
                        .tickFormat("")
                )
                .selectAll(".tick line")
                .attr("stroke", "#e0e0e0")
                .attr("stroke-dasharray", "2,2"); // Dotted lines

            // Update packet lines
            packetLines.attr("x1", d => newXScale(new Date(d.sendTime * 1000)))
                .attr("x2", d => newXScale(new Date(d.receiveTime * 1000)));

            // Update host lines
            svgGroup.selectAll(".host-line")
                .attr("x1", newXScale.range()[ 0 ])
                .attr("x2", newXScale.range()[ 1 ]);
        }




    }, [ metadata, entryIndex, timelineData, dispatch, d3ShouldRender, propDelays ]);

    useEffect(() => {
        if (formShouldReset) {
            const currentMeta = metadata[ entryIndex ];
            dispatch(setFormSelections({ data: { hostA: currentMeta.hostA, portA: currentMeta.portA, hostB: currentMeta.hostB, portB: currentMeta.portB, radioASelected: currentMeta.localhost === "A" }, index: entryIndex }));
            setFormShouldReset(false);
        }
    }, [ dispatch, entryIndex, formShouldReset, metadata ]);

    const onHostAChange = (e) => {
        dispatch(setFormSelections({ data: { ...formSelection, hostA: e.target.value }, index: entryIndex }));

    };

    const onPortAChange = (e) => {
        dispatch(setFormSelections({ data: { ...formSelection, portA: e.target.value }, index: entryIndex }));
    };

    const onHostBChange = (e) => {
        dispatch(setFormSelections({ data: { ...formSelection, hostB: e.target.value }, index: entryIndex }));
    };

    const onPortBChange = (e) => {
        dispatch(setFormSelections({ data: { ...formSelection, portB: e.target.value }, index: entryIndex }));
    };

    const onRadioChange = (e) => {
        dispatch(setFormSelections({ data: { ...formSelection, radioASelected: e.target.value === "A" }, index: entryIndex }));
    };

    /**
     * Reset the form fields to the original values in `metadata`
     */
    const onResetClick = () => {
        const currentMeta = metadata[ entryIndex ];
        dispatch(setFormSelections({ data: { hostA: currentMeta.hostA, portA: currentMeta.portA, hostB: currentMeta.hostB, portB: currentMeta.portB, radioASelected: currentMeta.localhost === "A" }, index: entryIndex }));
    };

    /**
     * Save the form selections to `metadata`
     */
    const onFormSubmit = () => {
        if (!formSelection.hostA || !formSelection.portA || !formSelection.hostB || !formSelection.portB) {
            alert("Please fill out all fields");
            return;
        }

        if (formSelection.hostA === formSelection.hostB && formSelection.portA === formSelection.portB) {
            alert("Both hosts and ports cannot be the same");
            return;
        }
        setPreviousMetadata(metadata[ entryIndex ]);
        dispatch(setMetadata({ data: { hostA: formSelection.hostA, portA: formSelection.portA, hostB: formSelection.hostB, portB: formSelection.portB, localhost: formSelection.radioASelected ? "A" : "B" }, index: entryIndex }));
        setTimelineDataShouldUpdate(true);
    };

    const onTitleSave = () => {
        dispatch(setEntryTitle({ data: titleText, index: entryIndex }));
        setTitleEditMode(false);
    };

    return (
        <Card className="text-center mb-3">
            <CloseButton className="align-self-end mt-3 me-3" onClick={() => {
                dispatch(removeEntry(entryIndex));
                setD3ShouldRender(true);
            }} />
            <Card.Body>
                {titleEditMode ?
                    <div className="mb-2 align-self-center d-flex justify-content-center">
                        <Form.Control placeholder="Entry title" className="entry-title" value={titleText} onChange={(e) => setTitleText(e.target.value)} />
                        <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faFloppyDisk} className="ms-2 align-self-center" onClick={onTitleSave} />
                        <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faX} className="ms-2 align-self-center" onClick={() => setTitleEditMode(false)} />
                    </div>
                    :
                    <div>
                        <Card.Title>{entryTitles[ entryIndex ]}<OverlayTrigger placement="top" overlay={<Tooltip>Click to edit title</Tooltip>}>
                            <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faPencil} className="ms-2" onClick={() => setTitleEditMode(true)} /></OverlayTrigger></Card.Title>

                    </div>
                }
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
                                {formOpts.length > 0 ? formOpts[ formOpts.findIndex((opt) => opt.ip_addr === formSelection.hostA) ].ports.map((port, index) => {
                                    return (<option key={index}>{port}</option>);
                                }
                                ) : null}
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
                                {formOpts.length > 0 ? formOpts[ formOpts.findIndex((opt) => opt.ip_addr === formSelection.hostB) ].ports.map((port, index) => {
                                    return (<option key={index}>{port}</option>);
                                }
                                ) : null}
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
            </Card.Body>
        </Card>
    );
}