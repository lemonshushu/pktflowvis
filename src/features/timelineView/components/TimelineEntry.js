import { faArrowsUpDown, faFloppyDisk, faPencil, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as d3 from "d3";
import { useEffect, useRef, useState } from 'react';
import { Button, Card, CloseButton, Col, Form, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import {
    broadcastZoomUpdate,
    removeEntry,
    setEntryTitle,
    setFormSelections,
    setMetadata,
    setShouldUpdateZoom,
    setTimelineData,
    swapFormSelections,
    setShowInfo,
    setSelectedPacket,
    toggleEntryVisibleState,
} from '../timelineViewSlice';
import "./TimelineEntry.css";

/**
 * Map string to a number between 0 and 1
 * @param {string} str - The string to map
 * @returns {number} - The mapped number
 */
const stringToNumber = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (hash & 0xFFFFFFFF) / 0xFFFFFFFF;
};

export default function TimelineEntry({ entryIndex, hidden }) {
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
    const portGraphData = useSelector((state) => state.graphView.portGraphData);
    const availableLinks = portGraphData.links;
    const startEpoch = useSelector((state) => state.data.startEpoch) / (10 ** 6);
    const endEpoch = useSelector((state) => state.data.endEpoch) / (10 ** 6);
    const alignTime = useSelector((state) => state.timelineView.alignTime);
    const alignedZoomState = useSelector((state) => state.timelineView.alignedZoomState);
    const shouldUpdateZoom = useSelector((state) => state.timelineView.shouldUpdateZoom[ entryIndex ]);
    const zoomRef = useRef(null);
    const alignTimeRef = useRef(alignTime);
    const shouldUpdateZoomRef = useRef(shouldUpdateZoom);
    const entryVisibleState = useSelector((state) => state.timelineView.entryVisibleStates[ entryIndex ]);

    const [ titleText, setTitleText ] = useState(entryTitles[ entryIndex ]);
    const [ titleEditMode, setTitleEditMode ] = useState(false);
    const [ previousMetadata, setPreviousMetadata ] = useState(null);
    const [ formShouldReset, setFormShouldReset ] = useState(false);
    const [ timelineDataShouldUpdate, setTimelineDataShouldUpdate ] = useState(false);
    const [ d3ShouldRender, setD3ShouldRender ] = useState(true);
    const [ enableHostBForm, setEnableHostBForm ] = useState(false);
    const [ hostBOptions, setHostBOptions ] = useState({});
    const [ shouldResetCheck, setShouldResetCheck ] = useState(false);

    useEffect(() => {
        alignTimeRef.current = alignTime;
    }, [ alignTime ]);

    useEffect(() => {
        shouldUpdateZoomRef.current = shouldUpdateZoom;
    }, [ shouldUpdateZoom ]);

    useEffect(() => {
        if (!zoomRef.current) return;
        if (alignTime && shouldUpdateZoom) {
            const savedTransform = d3.zoomIdentity
                .translate(alignedZoomState.translateX, 0)
                .scale(alignedZoomState.scale);

            const svg = d3.select(svgRef.current);

            svg.call(zoomRef.current.transform, savedTransform);
            console.log("Zoom updated for entry", entryIndex);
            dispatch(setShouldUpdateZoom({ index: entryIndex, shouldUpdate: false }));
        }
    }, [ alignTime, alignedZoomState, dispatch, entryIndex, shouldUpdateZoom ]);

    useEffect(() => {
        if (formSelection.hostA && formSelection.portA) {
            setEnableHostBForm(true);

            // availableLinks를 통해, 반대편(Host B)의 가능한 IP주소 및 포트를 가져와서 설정
            const hostBOptions = {};
            availableLinks.forEach(link => {
                if (link.src_ip === formSelection.hostA && link.src_port === formSelection.portA) {
                    if (!hostBOptions[ link.dst_ip ]) {
                        hostBOptions[ link.dst_ip ] = [];
                    }
                    if (!hostBOptions[ link.dst_ip ].includes(link.dst_port)) {
                        hostBOptions[ link.dst_ip ].push(link.dst_port);
                    }
                } else if (link.dst_ip === formSelection.hostA && link.dst_port === formSelection.portA) {
                    if (!hostBOptions[ link.src_ip ]) {
                        hostBOptions[ link.src_ip ] = [];
                    }
                    if (!hostBOptions[ link.src_ip ].includes(link.src_port)) {
                        hostBOptions[ link.src_ip ].push(link.src_port);
                    }
                }
            });
            setHostBOptions(hostBOptions);
        }
        else {
            setEnableHostBForm(false);
        }
        setShouldResetCheck(true);
    }, [ availableLinks, formSelection.hostA, formSelection.portA ]);

    useEffect(() => {
        setShouldResetCheck(true);
    }, [ formSelection.hostB, formSelection.portB ]);

    useEffect(() => {
        if (!shouldResetCheck) return;
        let isChanged = false;
        const newFormSelection = { ...formSelection };

        // if formSelection.hostA is not included in formOpts, reset formSelection.hostA
        if (formSelection.hostA && !formOpts.find(opt => opt.ip_addr === formSelection.hostA)) {
            newFormSelection.hostA = "";
            newFormSelection.portA = "";
            isChanged = true;
        }

        // if formSelection.portA is not included in formOpts, reset formSelection.portA
        if (formSelection.portA && formOpts.length > 0) {
            const hostA = formOpts.find(opt => opt.ip_addr === formSelection.hostA);
            if (hostA && !hostA.ports.includes(formSelection.portA)) {
                newFormSelection.portA = "";
                isChanged = true;
            }
        }
        // if formSelection.portB is not included in hostBOptions, reset formSelection.portB and hostB
        if (formSelection.hostB && !hostBOptions[ formSelection.hostB ]) {
            newFormSelection.hostB = "";
            newFormSelection.portB = "";
            isChanged = true;
        }
        // If portB is not included in hostBoptions[hostB], reset portB
        else if (formSelection.portB && !hostBOptions[ formSelection.hostB ].includes(formSelection.portB)) {
            newFormSelection.portB = "";
            isChanged = true;
        }
        if (isChanged) dispatch(setFormSelections({ data: newFormSelection, index: entryIndex }));
        setShouldResetCheck(false);
    }, [ dispatch, entryIndex, formOpts, formSelection, hostBOptions, shouldResetCheck ]);

    useEffect(() => {
        // For each entry, if hostA, portA, hostB, or portB is not in `formOpts`, hide the entry
        if (formOpts.length > 0) {
            const { hostA, portA, hostB, portB } = metadata[ entryIndex ];
            if (entryVisibleState && (
                !formOpts.find(opt => opt.ip_addr === hostA) ||
                !formOpts.find(opt => opt.ip_addr === hostB) ||
                !formOpts.find(opt => opt.ip_addr === hostA).ports.includes(portA) ||
                !formOpts.find(opt => opt.ip_addr === hostB).ports.includes(portB))) {
                dispatch(toggleEntryVisibleState(entryIndex)); // Hide the entry
            }
            if (!entryVisibleState &&
                formOpts.find(opt => opt.ip_addr === hostA) &&
                formOpts.find(opt => opt.ip_addr === hostB) &&
                formOpts.find(opt => opt.ip_addr === hostA).ports.includes(portA) &&
                formOpts.find(opt => opt.ip_addr === hostB).ports.includes(portB)) {
                dispatch(toggleEntryVisibleState(entryIndex)); // Show the entry
                dispatch(setFormSelections({ data: { hostA, portA, hostB, portB, radioASelected: metadata[ entryIndex ].localhost === "A" }, index: entryIndex }));
            }
        }
    }, [ dispatch, entryIndex, entryVisibleState, formOpts, metadata ]);

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
            setD3ShouldRender(true);
        }

    }, [ metadata, packets, dispatch, entryIndex, timelineDataShouldUpdate, previousMetadata, formShouldReset ]);

    /**
         * D3 visualization of the timeline
         */
    useEffect(() => {
        if (!d3ShouldRender) return;
        setD3ShouldRender(false);

        // We no longer have a single propDelay. We'll compute RTT per packet if possible.
        const data = timelineData[ entryIndex ];
        if (data.length === 0) {
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 20, right: 40, bottom: 50, left: 140 };
        const timelineWidth = svgRef.current.clientWidth - margin.left - margin.right;
        const timelineHeight = svgRef.current.clientHeight - margin.top - margin.bottom;

        const svgGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Define host positions
        const hostAY = 0;
        const hostBY = timelineHeight;

        // Get metadata and constants
        const ipA = metadata[ entryIndex ].hostA;
        const ipB = metadata[ entryIndex ].hostB;
        const portA = metadata[ entryIndex ].portA;
        const portB = metadata[ entryIndex ].portB;
        const localhost = metadata[ entryIndex ].localhost; // "A" or "B"

        const timeMin = 0;
        const timeMax = endEpoch - startEpoch;
        const timePadding = 0;
        const timeDomainStart = timeMin - timePadding;
        const timeDomainEnd = timeMax + timePadding;

        const xScale = d3.scaleLinear()
            .domain([ timeDomainStart, timeDomainEnd ])
            .range([ 0, timelineWidth ]);

        const xAxis = d3.axisBottom(xScale);

        const yPositions = {
            "A": hostAY,
            "B": hostBY
        };

        // Draw host lines
        svgGroup.append("line")
            .attr("class", "host-line")
            .attr("x1", 0)
            .attr("y1", hostAY)
            .attr("x2", timelineWidth)
            .attr("y2", hostAY)
            .attr("stroke", "black");

        svgGroup.append("line")
            .attr("class", "host-line")
            .attr("x1", 0)
            .attr("y1", hostBY)
            .attr("x2", timelineWidth)
            .attr("y2", hostBY)
            .attr("stroke", "black");

        // Convert data into a simpler format
        const packetsArray = data.map((packet, idx) => {
            const time = parseFloat(packet._source.layers.frame[ "frame.time_epoch" ]) - startEpoch;
            const srcIP = packet._source.layers.ip[ "ip.src" ];
            const dstIP = packet._source.layers.ip[ "ip.dst" ];
            const srcPort = packet._source.layers.tcp ? packet._source.layers.tcp[ "tcp.srcport" ] : packet._source.layers.udp[ "udp.srcport" ];
            const dstPort = packet._source.layers.tcp ? packet._source.layers.tcp[ "tcp.dstport" ] : packet._source.layers.udp[ "udp.dstport" ];
            let sourceHost, destHost;
            if (srcIP === ipA && dstIP === ipB && srcPort === portA && dstPort === portB) {
                sourceHost = "A";
                destHost = "B";
            } else if (srcIP === ipB && dstIP === ipA && srcPort === portB && dstPort === portA) {
                sourceHost = "B";
                destHost = "A";
            } else {
                // Packet doesn't match the hosts/ports expected, ignore or warn
                console.warn("Unexpected packet", packet);
            }

            // Extract layer 7 protocols
            const layers = Object.keys(packet._source.layers);
            const l7Protocols = layers.filter(layer => ![ "frame", "ip", "eth", "data" ].includes(layer));
            const l7Protocol = l7Protocols.length > 0 ? l7Protocols.join(", ") : "Unknown";

            return {
                index: idx,
                time,
                sourceHost,
                destHost,
                l7Protocol,
                packet
            };
        }).filter(d => d !== undefined);

        const RTT_THRESHOLD = 0.02;


        // To compute RTT for each packet, we attempt to pair requests and responses.
        // For TCP: match a packet going one way with the next ACK (opposite direction) that acknowledges its sequence.
        // For UDP or unmatched packets: fallback to no slope (sendTime = receiveTime).

        function getPacketInfo(pkt) {
            const p = pkt._source.layers;
            const srcIP = p.ip["ip.src"];
            const dstIP = p.ip["ip.dst"];
            let srcPort, dstPort, isTCP = false, isUDP = false;
            if (p.tcp) {
                srcPort = p.tcp["tcp.srcport"];
                dstPort = p.tcp["tcp.dstport"];
                isTCP = true;
            } else if (p.udp) {
                srcPort = p.udp["udp.srcport"];
                dstPort = p.udp["udp.dstport"];
                isUDP = true;
            }
            return { srcIP, dstIP, srcPort, dstPort, isTCP, isUDP };
        }
        
        function findMatchingAck(currentIdx) {
            const currentPacket = data[currentIdx];
            const cInfo = getPacketInfo(currentPacket);
            if (!cInfo.isTCP) return null; // Only for TCP
        
            const seq = parseInt(currentPacket._source.layers.tcp["tcp.seq"], 10);
            const nxtseq = parseInt(currentPacket._source.layers.tcp["tcp.nxtseq"], 10) || (seq + 1);
            const sendTime = parseFloat(currentPacket._source.layers.frame["frame.time_epoch"]) - startEpoch;
        
            for (let j = currentIdx + 1; j < data.length; j++) {
                const ackPacket = data[j];
                const info = getPacketInfo(ackPacket);
        
                if (info.isTCP &&
                    info.srcIP === cInfo.dstIP && info.dstIP === cInfo.srcIP &&
                    info.srcPort === cInfo.dstPort && info.dstPort === cInfo.srcPort) {
                    const ackNum = parseInt(ackPacket._source.layers.tcp["tcp.ack"], 10);
                    if (ackNum >= nxtseq) {
                        const ackTime = parseFloat(ackPacket._source.layers.frame["frame.time_epoch"]) - startEpoch;
                        const rtt = ackTime - sendTime;
                        // Check RTT threshold
                        if (rtt <= RTT_THRESHOLD) {
                            return { matchIndex: j, rtt };
                        } else {
                            // RTT too large, consider no match
                            return null;
                        }
                    }
                }
            }
            return null;
        }
        
        function findMatchingUdpResponse(currentIdx, localIsSource) {
            const currentPacket = data[currentIdx];
            const cInfo = getPacketInfo(currentPacket);
            if (!cInfo.isUDP) return null;
        
            const currentTime = parseFloat(currentPacket._source.layers.frame["frame.time_epoch"]) - startEpoch;
        
            if (localIsSource) {
                // local->remote UDP packet, look forward
                for (let j = currentIdx + 1; j < data.length; j++) {
                    const candidate = data[j];
                    const info = getPacketInfo(candidate);
                    if (info.isUDP &&
                        info.srcIP === cInfo.dstIP && info.dstIP === cInfo.srcIP &&
                        info.srcPort === cInfo.dstPort && info.dstPort === cInfo.srcPort) {
                        const respTime = parseFloat(candidate._source.layers.frame["frame.time_epoch"]) - startEpoch;
                        const rtt = respTime - currentTime;
                        if (rtt <= RTT_THRESHOLD) {
                            return { matchIndex: j, rtt };
                        } else {
                            // RTT too large, consider no match
                            return null;
                        }
                    }
                }
            } else {
                // remote->local UDP packet, look backward
                for (let k = currentIdx - 1; k >= 0; k--) {
                    const candidate = data[k];
                    const info = getPacketInfo(candidate);
                    if (info.isUDP &&
                        info.srcIP === cInfo.dstIP && info.dstIP === cInfo.srcIP &&
                        info.srcPort === cInfo.dstPort && info.dstPort === cInfo.srcPort) {
                        const reqTime = parseFloat(candidate._source.layers.frame["frame.time_epoch"]) - startEpoch;
                        const rtt = currentTime - reqTime;
                        if (rtt <= RTT_THRESHOLD) {
                            return { matchIndex: k, rtt };
                        } else {
                            // RTT too large, consider no match
                            return null;
                        }
                    }
                }
            }
            return null;
        }
        
        // In your packet processing logic:
        const processedPackets = packetsArray.map((p) => {
            const pkt = p.packet;
            const info = getPacketInfo(pkt);
            let sendTime, receiveTime;
            const localIsSource = (localhost === p.sourceHost);
            const currentTime = p.time;
        
            if (info.isTCP) {
                // TCP RTT calculation
                if (localIsSource) {
                    // local->remote
                    const match = findMatchingAck(p.index);
                    if (match && match.rtt > 0) {
                        sendTime = currentTime;
                        receiveTime = currentTime + (match.rtt / 2);
                    } else {
                        // no match or RTT > threshold
                        sendTime = currentTime;
                        receiveTime = currentTime; 
                    }
                } else {
                    // remote->local
                    // Find preceding local->remote packet and calculate RTT if possible
                    let rttFound = false;
                    for (let k = p.index - 1; k >= 0; k--) {
                        const candidate = data[k];
                        const cInfo = getPacketInfo(candidate);
                        if (cInfo.isTCP &&
                            cInfo.srcIP === (localhost === "A" ? ipA : ipB) &&
                            cInfo.dstIP === (localhost === "A" ? ipB : ipA) &&
                            cInfo.srcPort === (localhost === "A" ? portA : portB) &&
                            cInfo.dstPort === (localhost === "A" ? portB : portA)) {
                            const reqTime = parseFloat(candidate._source.layers.frame["frame.time_epoch"]) - startEpoch;
                            const rtt = currentTime - reqTime;
                            if (rtt > 0 && rtt <= RTT_THRESHOLD) {
                                receiveTime = currentTime;
                                sendTime = receiveTime - rtt / 2;
                                rttFound = true;
                                break;
                            }
                        }
                    }
                    if (!rttFound) {
                        sendTime = currentTime;
                        receiveTime = currentTime;
                    }
                }
        
            } else if (info.isUDP) {
                // UDP heuristic
                if (localIsSource) {
                    // local->remote UDP packet
                    const match = findMatchingUdpResponse(p.index, true);
                    if (match && match.rtt > 0) {
                        sendTime = currentTime;
                        receiveTime = currentTime + match.rtt / 2;
                    } else {
                        sendTime = currentTime;
                        receiveTime = currentTime;
                    }
                } else {
                    // remote->local UDP packet
                    const match = findMatchingUdpResponse(p.index, false);
                    if (match && match.rtt > 0) {
                        receiveTime = currentTime;
                        sendTime = currentTime - match.rtt / 2;
                    } else {
                        sendTime = currentTime;
                        receiveTime = currentTime;
                    }
                }
        
            } else {
                // Neither TCP nor UDP
                sendTime = currentTime;
                receiveTime = currentTime;
            }
        
            return {
                sendTime,
                receiveTime,
                sourceHost: p.sourceHost,
                destHost: p.destHost,
                l7Protocol: p.l7Protocol,
                packetnum: p.index
            };
        });

        // Print processedPacket data
        console.log("Processed Packets", processedPackets);

        // Define color and arrowheads
        const protocolColor = d3.scaleLinear()
            .domain([ 0, 1 ])
            .range([ 0, 1 ]);

        const l7ProtocolSet = new Set(processedPackets.map(d => d.l7Protocol));
        l7ProtocolSet.forEach(protocol => {
            svg.append("defs").append("marker")
                .attr("id", `arrowhead-${entryIndex}-${protocol.replace(/[ ,.]/g, "")}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 10)
                .attr("refY", 0)
                .attr("orient", "auto")
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("fill", d3.interpolateRainbow(protocolColor(stringToNumber(protocol))));
        });

        // Create tooltip
        const tooltip = d3.select(svgRef.current.parentNode)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "fixed")
            .style("background", "#f9f9f9")
            .style("padding", "5px")
            .style("border", "1px solid #d3d3d3")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Draw packets
        const packetLinesGroup = svgGroup.append("g").attr("class", "packet-lines");

        const packetLines = packetLinesGroup.selectAll(".packet")
            .data(processedPackets)
            .enter()
            .append("line")
            .attr("class", "packet")
            .attr("x1", d => xScale(d.sendTime))
            .attr("y1", d => yPositions[ d.sourceHost ])
            .attr("x2", d => xScale(d.receiveTime))
            .attr("y2", d => yPositions[ d.destHost ])
            .attr("stroke", d => d3.interpolateRainbow(protocolColor(stringToNumber(d.l7Protocol))))
            .attr("stroke-width", 3)
            .attr("marker-end", d => `url(#arrowhead-${entryIndex}-${d.l7Protocol.replace(/[ ,.]/g, "")})`)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", 5);
                tooltip.transition().duration(200).style("opacity", 1);
                const pkt = data[ d.packetnum ];
                if (pkt._source.layers.tcp) {
                    tooltip.html(`<span>Protocol: ${d.l7Protocol}</span>
                    <br /><span>Packet size: ${pkt._source.layers.frame[ "frame.len" ]} bytes</span>
                    <br /><span>TCP seq: ${pkt._source.layers.tcp[ "tcp.seq" ]}</span>
                    <br /><span>TCP ack: ${pkt._source.layers.tcp[ "tcp.ack" ]}</span>`)
                        .style("left", (event.clientX + 5) + "px")
                        .style("top", (event.clientY - 28) + "px");
                } else {
                    tooltip.html(`<span>Protocol: ${d.l7Protocol}</span>
                    <br /><span>Packet size: ${pkt._source.layers.frame[ "frame.len" ]} bytes</span>`)
                        .style("left", (event.clientX + 5) + "px")
                        .style("top", (event.clientY - 28) + "px");
                }
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 3);
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .on("click", (event, d) => {
                dispatch(setShowInfo(true));
                dispatch(setSelectedPacket(data[ d.packetnum ]));
            });

        // Mask out areas beyond the lines
        svgGroup.append("rect")
            .attr("x", -margin.left)
            .attr("y", 0)
            .attr("width", margin.left)
            .attr("height", timelineHeight)
            .attr("fill", "white")
            .attr("stroke", "white")
            .attr("stroke-width", 4);

        svgGroup.append("rect")
            .attr("x", timelineWidth)
            .attr("y", 0)
            .attr("width", margin.right)
            .attr("height", timelineHeight)
            .attr("fill", "white")
            .attr("stroke", "white")
            .attr("stroke-width", 4);

        // Add host labels
        svgGroup.append("text")
            .attr("x", -margin.left + 10)
            .attr("y", hostAY)
            .attr("dy", "0.35em")
            .text(`${ipA}:${metadata[ entryIndex ].portA}`)
            .style("font-size", "14px");

        svgGroup.append("text")
            .attr("x", -margin.left + 10)
            .attr("y", hostBY)
            .attr("dy", "0.35em")
            .text(`${ipB}:${metadata[ entryIndex ].portB}`)
            .style("font-size", "14px");

        // Add x-axis
        const xAxisGroup = svgGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${hostBY})`)
            .call(xAxis);

        // Add grid lines
        svgGroup.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0, ${hostBY})`)
            .call(
                d3.axisBottom(xScale)
                    .ticks(5)
                    .tickSize(-timelineHeight - 10)
                    .tickFormat("")
            )
            .selectAll(".tick line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-dasharray", "2,2");

        svgGroup.selectAll(".x-axis").raise();

        const minDomain = xScale.domain()[ 0 ];
        const maxDomain = xScale.domain()[ 1 ];

        function constrain(transform) {
            const scaleX = transform.rescaleX(xScale);
            let domain = scaleX.domain();

            let k = transform.k;
            let tx = transform.x;
            const domainWidth = maxDomain - minDomain;
            const visibleDomainWidth = domain[ 1 ] - domain[ 0 ];

            // Prevent zooming out beyond original domain
            if (visibleDomainWidth > domainWidth) {
                k = 1; // Reset
                tx = 0;
                transform = d3.zoomIdentity.scale(k).translate(tx, transform.y);
                domain = transform.rescaleX(xScale).domain();
            }

            // Adjust translation
            if (domain[ 0 ] < minDomain) {
                const minX = xScale(minDomain);
                tx = -minX * k;
            }
            if (domain[ 1 ] > maxDomain) {
                const maxX = xScale(maxDomain);
                tx = -maxX * k + timelineWidth;
            }

            return d3.zoomIdentity.translate(tx, transform.y).scale(k);
        }

        function zoomed(event) {
            const newXScale = event.transform.rescaleX(xScale);

            if (alignTimeRef.current && !(shouldUpdateZoomRef.current)) {
                dispatch(broadcastZoomUpdate({ zoomState: { scale: event.transform.k, translateX: event.transform.x }, index: entryIndex }));
            }

            // Update x-axis
            xAxisGroup.call(xAxis.scale(newXScale));

            // Update grid lines
            svgGroup.select(".grid")
                .call(
                    d3.axisBottom(newXScale)
                        .ticks(5)
                        .tickSize(-timelineHeight - 10)
                        .tickFormat("")
                )
                .selectAll(".tick line")
                .attr("stroke", "#e0e0e0")
                .attr("stroke-dasharray", "2,2");

            // Update packet lines
            packetLines
                .attr("x1", d => newXScale(d.sendTime))
                .attr("x2", d => newXScale(d.receiveTime));

            // Update host lines
            svgGroup.selectAll(".host-line")
                .attr("x1", newXScale.range()[ 0 ])
                .attr("x2", newXScale.range()[ 1 ]);
        }

        zoomRef.current = d3.zoom()
            .scaleExtent([ 1, 20 ])
            .on("zoom", zoomed)
            .constrain(constrain);

        svg.call(zoomRef.current);

    }, [ metadata, entryIndex, timelineData, dispatch, d3ShouldRender, startEpoch, endEpoch, alignTime, shouldUpdateZoom, alignedZoomState.translateX, alignedZoomState.scale ]);

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
        <Card className="text-center mb-3" id={`entry-${entryIndex}`} hidden={hidden}>
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
                <svg width="100%" height="200px" className="timeline-svg" ref={svgRef} />
                <Form className="entry-form p-4">
                    <Row>
                        <Col xs={1} className="d-flex align-items-center justify-content-end">
                            <Button className="rounded-circle" variant="light" onClick={
                                () => {
                                    dispatch(swapFormSelections(entryIndex));
                                }
                            } ><FontAwesomeIcon icon={faArrowsUpDown} size="l" /></Button>
                        </Col>
                        <Col xs={11}>
                            <Row>
                                <Col xs={4}></Col>
                                <Col xs={3}></Col>
                                <Col xs={2}>localhost</Col>
                                <Col xs={1}></Col>
                            </Row>
                            <Row className="mb-3">
                                <Col xs={4} className="d-flex align-items-center justify-content-center">
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
                                        {formOpts.length > 0 && formOpts[ formOpts.findIndex((opt) => opt.ip_addr === formSelection.hostA) ] ? formOpts[ formOpts.findIndex((opt) => opt.ip_addr === formSelection.hostA) ].ports.map((port, index) => {
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
                                <Col xs={4} className="d-flex align-items-center justify-content-center">
                                    <Form.Label column={false}><strong>Host B: </strong></Form.Label>
                                    <Form.Select className="ms-3" style={{ width: 250 }} onChange={onHostBChange} value={formSelection.hostB} disabled={!enableHostBForm}>
                                        <option />
                                        {
                                            Object.keys(hostBOptions).map((ip, index) => {
                                                return (<option key={index}>{ip}</option>);
                                            })
                                        }
                                    </Form.Select>
                                </Col>
                                <Col xs={3} className="d-flex align-items-center justify-content-center">
                                    <Form.Label column={false}>Port: </Form.Label>
                                    <Form.Select className="ms-3" style={{ width: 150 }} onChange={onPortBChange} value={formSelection.portB} disabled={!enableHostBForm}>
                                        <option />
                                        {
                                            hostBOptions[ formSelection.hostB ] ? hostBOptions[ formSelection.hostB ].map((port, index) => {
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
                            </Row></Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}