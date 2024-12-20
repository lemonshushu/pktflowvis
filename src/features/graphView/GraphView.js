import * as d3 from 'd3';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ControlPanel from './components/ControlPanel';

import { addEntry, setFormOpts, setShouldFocusLastEntry } from '../timelineView/timelineViewSlice';
import {
    addProtocols,
    setIsNicknameChangeOpen,
    setIsShowProtocolsOpen,
    setIsSimulationStable,
    setSelectedIP,
    setSelectedPort,
    setShowL4Protocol,
    setShowL7Protocol,
    toggleL4Protocol,
    toggleL7Protocol
} from './components/controlPanelSlice';
import { setHostGraphData, setAvailableIPs, setPortGraphData } from './graphViewSlice';
import './GraphView.css';


export default function GraphView() {
    const graphRef = useRef(null);
    const hostData = useSelector((state) => state.graphView.hostGraphData);
    const availableIPs = useSelector((state) => state.graphView.availableIPs);
    const portData = useSelector((state) => state.graphView.portGraphData);
    const nicknameMapping = useSelector((state) => state.controlPanel.nicknameMapping);

    const mode = useSelector((state) => state.graphView.mode);
    const isSimulationStable = useSelector((state) => state.controlPanel.isSimulationStable);
    const isShowProtocolsOpen = useSelector((state) => state.controlPanel.isShowProtocolsOpen);
    const showL4Protocol = useSelector((state) => state.controlPanel.showL4Protocol);
    const showL7Protocol = useSelector((state) => state.controlPanel.showL7Protocol);
    const selectedL4Protocols = useSelector((state) => state.controlPanel.selectedL4Protocols);
    const selectedL7Protocols = useSelector((state) => state.controlPanel.selectedL7Protocols);
    const filteringMode = useSelector((state) => state.controlPanel.filteringMode);
    const filteredPackets = useSelector((state) => state.timeSlider.filteredPackets);

    const simulationRef = useRef(null);
    const linkRef = useRef(null);
    const nodeRef = useRef(null);
    const nodesRef = useRef([]);
    const labelsRef = useRef(null);
    const svgRef = useRef(null); // SVG 요소에 대한 참조를 저장할 ref
    const zoomRef = useRef(null); // zoom behavior에 대한 참조를 저장할 ref
    const isSimulationStableRef = useRef(isSimulationStable);

    function updateIsSimulationStable(value) {
        dispatch(setIsSimulationStable(value));
        isSimulationStableRef.current = value;
    }

    const dispatch = useDispatch();

    const initHostData = useCallback(() => {
        // Initialize host data with nodes and links
        const data = { nodes: [], links: [] };

        filteredPackets.forEach((packet) => {
            const src_ip = packet._source.layers.ip[ 'ip.src_host' ];
            const dst_ip = packet._source.layers.ip[ 'ip.dst_host' ];
            const frame_size = Number(packet._source.layers.frame[ 'frame.len' ]);

            // Add source node
            if (!data.nodes.find(node => node.ip_addr === src_ip)) {
                data.nodes.push({ id: src_ip, ip_addr: src_ip, traffic_volume: frame_size });
            } else {
                data.nodes.find(node => node.ip_addr === src_ip).traffic_volume += frame_size;
            }

            // Add destination node
            if (!data.nodes.find(node => node.ip_addr === dst_ip)) {
                data.nodes.push({ id: dst_ip, ip_addr: dst_ip, traffic_volume: frame_size });
            } else {
                data.nodes.find(node => node.ip_addr === dst_ip).traffic_volume += frame_size;
            }

            // Add link
            if (!data.links.find(link => link.src_ip === src_ip && link.dst_ip === dst_ip)) {
                data.links.push({ source: src_ip, target: dst_ip, src_ip: src_ip, dst_ip: dst_ip, traffic_volume: frame_size });
            } else {
                data.links.find(link => link.src_ip === src_ip && link.dst_ip === dst_ip).traffic_volume += frame_size;
            }
        });

        if (!availableIPs) {
            dispatch(setAvailableIPs(data.nodes.map((opt, index) => opt.ip_addr)));
        }

        return data;
    }, [ filteredPackets ]);

    const TrafficVolumeToStrokeWidth = ((traffic_volume) => {
        return 0.5*Math.log10(traffic_volume);
    });

    const initPortData = useCallback(() => {
        // Initialize port data with nodes and links
        const data = { nodes: [], links: [] };
        const timelineViewFormOpts = [ { ip_addr: "", ports: [ "" ] } ];
        const allL4Protocols = new Set();
        const allL7Protocols = new Set();

        filteredPackets.forEach((packet) => {
            const src_ip = packet._source.layers.ip[ 'ip.src_host' ];
            const dst_ip = packet._source.layers.ip[ 'ip.dst_host' ];
            const src_port = packet._source.layers.tcp
                ? packet._source.layers.tcp[ 'tcp.srcport' ]
                : packet._source.layers.udp[ 'udp.srcport' ];
            const dst_port = packet._source.layers.tcp
                ? packet._source.layers.tcp[ 'tcp.dstport' ]
                : packet._source.layers.udp[ 'udp.dstport' ];
            const frame_size = Number(packet._source.layers.frame[ 'frame.len' ]);
            const l4_proto = packet._source.layers.tcp ? 'TCP' : 'UDP';
            const layers = Object.keys(packet._source.layers);
            let temp_l7_proto = layers[ 4 ] === 'tcp.segments' ? layers[ 5 ]?.toUpperCase() : layers[ 4 ]?.toUpperCase();
            const l7_proto = temp_l7_proto === undefined ? "None" : temp_l7_proto;

            allL4Protocols.add(l4_proto);
            allL7Protocols.add(l7_proto);

            const src_id = `${src_ip}:${src_port}`;
            const dst_id = `${dst_ip}:${dst_port}`;

            // Add source node
            let src_node = data.nodes.find((node) => node.id === src_id);
            if (!src_node) {
                src_node = {
                    id: src_id,
                    ip_addr: src_ip,
                    port: src_port,
                    traffic_volume: frame_size,
                    l4_proto: new Set([ l4_proto ]),
                    l7_proto: new Set([ l7_proto ]),
                };
                data.nodes.push(src_node);

                if (!timelineViewFormOpts.find((port) => port.ip_addr === src_ip)) {
                    timelineViewFormOpts.push({ ip_addr: src_ip, ports: [ '', src_port ] });
                } else {
                    timelineViewFormOpts
                        .find((port) => port.ip_addr === src_ip)
                        .ports.push(src_port);
                }
            } else {
                src_node.traffic_volume += frame_size;
                src_node.l4_proto.add(l4_proto);

                // l7_proto 처리
                if (l7_proto === 'None') {
                    // 이미 다른 프로토콜이 없으면 'None'을 추가
                    if (src_node.l7_proto.size === 0) {
                        src_node.l7_proto.add('None');
                    }
                } else {
                    if (src_node.l7_proto.has('None')) {
                        src_node.l7_proto.delete('None');
                    }
                    src_node.l7_proto.add(l7_proto);
                }
            }

            // Add destination node
            let dst_node = data.nodes.find((node) => node.id === dst_id);
            if (!dst_node) {
                dst_node = {
                    id: dst_id,
                    ip_addr: dst_ip,
                    port: dst_port,
                    traffic_volume: frame_size,
                    l4_proto: new Set([ l4_proto ]),
                    l7_proto: new Set([ l7_proto ]),
                };
                data.nodes.push(dst_node);

                if (!timelineViewFormOpts.find((port) => port.ip_addr === dst_ip)) {
                    timelineViewFormOpts.push({ ip_addr: dst_ip, ports: [ '', dst_port ] });
                } else {
                    timelineViewFormOpts
                        .find((port) => port.ip_addr === dst_ip)
                        .ports.push(dst_port);
                }
            } else {
                dst_node.traffic_volume += frame_size;
                dst_node.l4_proto.add(l4_proto);

                // l7_proto 처리
                if (l7_proto === 'None') {
                    if (dst_node.l7_proto.size === 0) {
                        dst_node.l7_proto.add('None');
                    }
                } else {
                    if (dst_node.l7_proto.has('None')) {
                        dst_node.l7_proto.delete('None');
                    }
                    dst_node.l7_proto.add(l7_proto);
                }
            }

            // Add link
            let link = data.links.find(
                (link) => link.source === src_id && link.target === dst_id
            );

            if (!link) {
                link = {
                    source: src_id,
                    target: dst_id,
                    src_ip: src_ip,
                    src_port: src_port,
                    dst_ip: dst_ip,
                    dst_port: dst_port,
                    l4_proto: new Set([ l4_proto ]),
                    l7_proto: new Set([ l7_proto ]),
                    traffic_volume: frame_size,
                };
                data.links.push(link);
            } else {
                link.l4_proto.add(l4_proto);
                link.traffic_volume += frame_size;
                // Handle L7 protocol 'None' case
                if (l7_proto === 'None') {
                    if (link.l7_proto.size === 0) {
                        link.l7_proto.add('None');
                    }
                } else {
                    if (link.l7_proto.has('None')) {
                        link.l7_proto.delete('None');
                    }
                    link.l7_proto.add(l7_proto);
                }
            }
    });

        // Comparator function to sort protocols with 'None' at the end
        const protocolComparator = (a, b) => {
            if (a === 'None') return 1;
            if (b === 'None') return -1;
            return a.localeCompare(b);
        };

        // Convert Sets to Arrays before storing in state
        data.nodes.forEach((node) => {
            node.l4_proto = Array.from(node.l4_proto);
            node.l7_proto = Array.from(node.l7_proto);
        });

        // Convert Sets to Arrays before storing
        data.links.forEach((link) => {
            link.l4_proto = Array.from(link.l4_proto);
            link.l7_proto = Array.from(link.l7_proto);
        });
        // console.log(data.links);

        // Sort ports in AvailableHostPorts in ascending order
        timelineViewFormOpts.forEach(port => port.ports.sort((a, b) => a - b));

        // Sort hosts in AvailableHostPorts in ascending order
        timelineViewFormOpts.sort((a, b) => a.ip_addr.localeCompare(b.ip_addr));


        dispatch(setFormOpts(timelineViewFormOpts));
        if (!portData) {
            dispatch(addProtocols({
                l4Protocols: Array.from(allL4Protocols).sort(protocolComparator),
                l7Protocols: Array.from(allL7Protocols).sort(protocolComparator),
        }));
        }
        //console.log(data);
        return data;
    }, [dispatch, filteredPackets]);

    useEffect(() => {
        if (filteredPackets) {
            dispatch(setHostGraphData(initHostData()));
            dispatch(setPortGraphData(initPortData()));
        }
    }, [ filteredPackets, initHostData, initPortData]);

    useEffect(() => {
        if (!hostData || !portData) return;

        const ipAddrs = Array.from(new Set([
            ...hostData.nodes.map(d => d.ip_addr),
            ...portData.nodes.map(d => d.ip_addr)
        ]));

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(ipAddrs);

        const createSimulation = (nodes, links, mode) => {
            const sizeScale = d3.scaleSqrt()
                .domain(d3.extent(nodes, d => d.traffic_volume))
                .range([ 5, 20 ]);

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links)
                    .id(d => mode === 'host' ? d.ip_addr : d.id)
                    .distance(100)
                )
                .force("charge", d3.forceManyBody().strength(-50))
                .force("center", d3.forceCenter(0, 0))
                .force("collision", d3.forceCollide().radius(d => sizeScale(d.traffic_volume) + 5));

            if (mode === 'port') {
                const ipAddrs = Array.from(new Set(nodes.map(d => d.ip_addr)));
                const clusterCenters = {};
                const numClusters = ipAddrs.length;
                const angleStep = (2 * Math.PI) / numClusters;

                ipAddrs.forEach((ip, i) => {
                    const angle = i * angleStep;
                    clusterCenters[ ip ] = {
                        x: 300 * Math.cos(angle),
                        y: 300 * Math.sin(angle)
                    };
                });

                simulation
                    .force("x", d3.forceX(d => clusterCenters[ d.ip_addr ].x).strength(0.5))
                    .force("y", d3.forceY(d => clusterCenters[ d.ip_addr ].y).strength(0.5));
            }

            return { simulation, sizeScale };
        };

        const drag = (simulation) => {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                // Nodes remain at their dragged positions
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        };

        const createGraph = (nodes, links, mode) => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }

            d3.select(graphRef.current).selectAll("*").remove();

            updateIsSimulationStable(false);

            const { simulation, sizeScale } = createSimulation(nodes, links, mode);

            simulationRef.current = simulation;

            const svg = d3.select(graphRef.current)
                .attr("width", '100%')
                .attr("height", '100%')
                .attr("viewBox", [ -500, -500, 1000, 1000 ]);

            svgRef.current = svg;

            // Zoom behavior
            const zoom = d3.zoom()
                .scaleExtent([ 0.1, 10 ])
                .on("zoom", zoomed)
                .filter(function (event) {
                    // Prevent zooming on double-click
                    return !event.button && !event.dblclick;
                });

            svg.call(zoom);
            zoomRef.current = zoom;

            const container = svg.append("g");

            // Define arrow markers
            container.append("defs").append("marker")
                .attr("id", "arrowhead")
                .attr("viewBox", [ 0, 0, 10, 10 ])
                .attr("refX", 8)  // Adjusted to position arrowhead over circle
                .attr("refY", 5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto-start-reverse")
                .append("path")
                .attr("d", "M 0 0 L 10 5 L 0 10 Z")
                .attr("fill", "#999");

            // Add links
            const link = container.append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr('opacity', d => getOpacity(d.l4_proto, d.l7_proto))
                .attr("stroke-width", d => TrafficVolumeToStrokeWidth(d.traffic_volume))
                .attr("marker-end", "url(#arrowhead)")
                // Highlight the link with black stroke on hover && make it thicker
                // .on("mouseover", function (event) {
                //     d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
                // })
                // .on("mouseout", function (event) {
                //     d3.select(this).attr("stroke", "#999").attr("stroke-width", 1);
                // })
                .on("click", (event) => {
                    const hostA = event.srcElement.__data__.src_ip;
                    const portA = event.srcElement.__data__.src_port;
                    const hostB = event.srcElement.__data__.dst_ip;
                    const portB = event.srcElement.__data__.dst_port;
                    dispatch(addEntry({ metadata: { hostA, portA, hostB, portB }, formSelections: { hostA, portA, hostB, portB, radioASelected: true } }));
                    dispatch(setShouldFocusLastEntry(true));
                })

            linkRef.current = link;
            svg.on('mousemove', throttledHandleMouseMove);
            
            // Add nodes
            const node = container.append("g")
                // Removed unnecessary white strokes
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr('opacity', d => getOpacity(d.l4_proto, d.l7_proto))
                .attr("r", d => sizeScale(d.traffic_volume))
                .attr("fill", d => colorScale(d.ip_addr))
                // .on("dblclick", resetNodePosition)
                .on("click", (event, d) => {
                    dispatch(addEntry({ metadata: null, formSelections: { hostA: d.ip_addr, portA: d.port, hostB: "", portB: "", radioASelected: true } })); // Add new entry in TimelineView
                    // d3.selectAll(".tooltip").remove();
                    dispatch(setShouldFocusLastEntry(true));
                })
            
            nodeRef.current = node;

            // Add tooltips
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("padding", "8px")
                .style("background", "rgba(0, 0, 0, 0.7)")
                .style("border-radius", "4px")
                .style("color", "#fff")
                .style("pointer-events", "none")
                .style("opacity", 0);

            node.on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(getTooltipContentNode(d, mode));

                // Highlight the node with outline on hover
                d3.select(event.target).attr("stroke", "#000");

            })
                .on("mousemove", event => {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", (event) => {
                    tooltip.style("opacity", 0);
                    // Remove the outline on mouseout
                    d3.select(event.target).attr("stroke", null);
                })
                .on('contextmenu', (event, d) => {
                    event.preventDefault();
                    event.stopPropagation();

                    showCustomContextMenu(event.pageX, event.pageY, d);
                });

            link.on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(getTooltipContentLink(d));
            }).on("mousemove", event => {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            }).on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

            // Add labels
            const labels = container.append("g").attr("id", "labels")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .text(d => getNicknameLabel(d, mode))
                .attr('fill-opacity', d => getOpacity(d.l4_proto, d.l7_proto))
                .attr("font-size", "10px")
                .attr("fill", "#555")
                .attr("dy", "-1em")
                .attr("text-anchor", "middle")
                .on("click", (event) => {
                    event.stopPropagation();
                });

            labelsRef.current = labels;

            // If there are more than 5 nodes that have the same IP address, add an IP address label in the center of the nodes
            if (mode === 'port') {
                const ipAddrs = Array.from(new Set(nodes.map(d => d.ip_addr)));
                const ipAddrsWithMultipleNodes = []; // {ip_addr: string, x: number, y: number}[]
                ipAddrs.forEach(ipAddr => {
                    const nodesWithSameIp = nodes.filter(d => d.ip_addr === ipAddr);
                    if (nodesWithSameIp.length > 5) {
                        const x = d3.mean(nodesWithSameIp, d => d.x);
                        const y = d3.mean(nodesWithSameIp, d => d.y);
                        ipAddrsWithMultipleNodes.push({ ip_addr: ipAddr, x, y });
                    }
                });

                // Print ipAddrsWithMultipleNodes
                // console.log(ipAddrsWithMultipleNodes);
                container.append("g").attr("id", "ipAddrLabels")
                    .selectAll("text")
                    .data(ipAddrsWithMultipleNodes)
                    .join("text")
                    .text(d => d.ip_addr)
                    .attr("font-size", "12px")
                    .attr("fill", "#555")
                    .attr("dx", "5em")
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "bold")
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            }

            simulation.stop();

            for (let i = 0; i < 300; ++i) {
                simulation.tick();
            }

            nodes.forEach(d => {
                d.originalX = d.x;
                d.originalY = d.y;
            });
            nodesRef.current = nodes;
            node.call(drag(simulation));

            simulation.on("tick", () => {
                link
                    .attr("x1", d => {
                        const sourceRadius = sizeScale(d.source.traffic_volume);
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const angle = Math.atan2(dy, dx);
                        return d.source.x + Math.cos(angle) * sourceRadius;
                    })
                    .attr("y1", d => {
                        const sourceRadius = sizeScale(d.source.traffic_volume);
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const angle = Math.atan2(dy, dx);
                        return d.source.y + Math.sin(angle) * sourceRadius;
                    })
                    .attr("x2", d => {
                        const targetRadius = sizeScale(d.target.traffic_volume);
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const angle = Math.atan2(dy, dx);
                        return d.target.x - Math.cos(angle) * targetRadius;
                    })
                    .attr("y2", d => {
                        const targetRadius = sizeScale(d.target.traffic_volume);
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const angle = Math.atan2(dy, dx);
                        return d.target.y - Math.sin(angle) * targetRadius;
                    });

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y - sizeScale(d.traffic_volume) - 5);

                if (simulation.alpha() < 0.05) {
                    if (!isSimulationStableRef.current) {
                        updateIsSimulationStable(true);
                    }
                } else {
                    if (isSimulationStableRef.current) {
                        updateIsSimulationStable(true);
                    }
                }
            });

            simulation.alpha(1).restart();

            function zoomed(event) {
                container.attr("transform", event.transform);
            }

            return () => {
                simulation.stop();
                tooltip.remove();
            };
        };

        if (mode === 'host') {
            const links = hostData.links.map(d => ({ ...d }));
            const nodes = hostData.nodes.map(d => ({ ...d }));
            createGraph(nodes, links, 'host');
        } else {
            const links = portData.links.map(d => ({ ...d }));
            const nodes = portData.nodes.map(d => ({ ...d }));
            createGraph(nodes, links, 'port');
        }

    }, [ hostData, portData, mode ]);

    const getNicknameLabel = useCallback((node, mode) => {
        if (!node) return;
        if (mode === 'host') {
            return nicknameMapping[ node.ip_addr ] || node.ip_addr;
        } else {
            if (!portData) return;
            // If there are more than 5 nodes that have the same IP adress, only return the port number as the label
            if (portData.nodes.filter(n => n.ip_addr === node.ip_addr).length > 5) {
                return `:${node.port}`;
            }
            const key = `${node.ip_addr}:${node.port}`;
            return nicknameMapping[ key ] || `${node.ip_addr}:${node.port}`;
        }
    }, [nicknameMapping, portData]);

    const getTooltipContentNode = useCallback((node, mode) => {
        if (mode === 'host') {
            return `${nicknameMapping[ node.ip_addr ] ? `${nicknameMapping[ node.ip_addr ]}<br>` : ''}IP: ${node.ip_addr}<br>Traffic Volume: ${node.traffic_volume}`;
        } else {
            const key = `${node.ip_addr}:${node.port}`;

            // L7 프로토콜 처리
            let l7_proto_display;
            if (Array.isArray(node.l7_proto)) {
                if (node.l7_proto.length > 1) {
                    // 'None'을 제외한 프로토콜 리스트 생성
                    l7_proto_display = node.l7_proto.filter((proto) => proto !== 'None');
                } else {
                    l7_proto_display = node.l7_proto;
                }
                // 배열을 문자열로 변환
                l7_proto_display = l7_proto_display.join(', ');
            } else {
                l7_proto_display = node.l7_proto;
            }

            return `${nicknameMapping[ key ] ? `${nicknameMapping[ key ]}<br>` : ''}IP: ${node.ip_addr}<br>Port: ${node.port}<br>Traffic Volume: ${node.traffic_volume}<br>L4 Protocol: ${node.l4_proto.join(", ")}<br>L7 Protocol: ${l7_proto_display}`;
        }
    }, [ nicknameMapping ]);

    useEffect(() => {
        if (!hostData || !portData) return;

        d3.select(graphRef.current).selectAll("#labels").selectAll("text")
            .text(d => getNicknameLabel(d, mode));

        const tooltip = d3.select("body").select(".tooltip");
        d3.select(graphRef.current).selectAll("circle")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(getTooltipContentNode(d, mode));
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    }, [nicknameMapping, mode, hostData, portData, getNicknameLabel, getTooltipContentNode]);

    useEffect(() => {
        if (nodeRef.current && linkRef.current) {
            if (!isShowProtocolsOpen) {
                nodeRef.current.attr('opacity', 1);
                linkRef.current.attr('opacity', 1);
                labelsRef.current.attr('fill-opacity', 1);
            } else {
                nodeRef.current.attr('opacity', d => getOpacity(d.l4_proto, d.l7_proto));
                linkRef.current.attr('opacity', d => getOpacity(d.l4_proto, d.l7_proto));
                labelsRef.current.attr('fill-opacity', d => getOpacity(d.l4_proto, d.l7_proto));
            }
        }
    }, [ isShowProtocolsOpen, selectedL4Protocols, selectedL7Protocols, filteringMode ]);

    const hoveredLines = new Set();

    const handleMouseMove = (event) => {
        // const [ mouseX, mouseY ] = d3.pointer(event);

        const elements = document.elementsFromPoint(event.clientX, event.clientY);

        const linesUnderMouse = elements.filter(el => el.tagName === 'line' && el.__data__);

        // mouseover 이벤트 처리
        linesUnderMouse.forEach(lineElement => {
            if (!hoveredLines.has(lineElement)) {
                hoveredLines.add(lineElement);
                d3.select(lineElement).attr('stroke', '#999').attr('stroke-width', 2 * TrafficVolumeToStrokeWidth(lineElement.__data__.traffic_volume));
            }
        });

        // mouseout 이벤트 처리
        hoveredLines.forEach(lineElement => {
            if (!linesUnderMouse.includes(lineElement)) {
                hoveredLines.delete(lineElement);
                d3.select(lineElement).attr('stroke', '#999').attr('stroke-width', TrafficVolumeToStrokeWidth(lineElement.__data__.traffic_volume));
            }
        });
    };

    const throttle = (func, delay) => {
        let lastCall = 0;
        return function (...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func(...args);
        };
    };

    // handleMouseMove 함수를 쓰로틀링합니다.
    const throttledHandleMouseMove = throttle(handleMouseMove, 50);

    const showCustomContextMenu = (x, y, nodeData) => {
        d3.select(".custom-context-menu").remove();

        // 컨텍스트 메뉴를 위한 div 요소를 생성합니다.
        const menu = d3.select("body")
            .append("div")
            .attr("class", "custom-context-menu")
            .style("position", "absolute")
            .style("left", `${x}px`)
            .style("top", `${y}px`)
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("border-radius", "4px")
            .style("box-shadow", "0px 2px 10px rgba(0,0,0,0.2)")
            .style("z-index", 1000) // 메뉴가 다른 요소 위에 표시되도록 합니다.
            .on("mouseleave", () => {
                menu.remove();
            });

        const ipAddr = nodeData.ip_addr;
        const port = mode === 'port' ? `:${nodeData.port}` : '';
        const ipPortPair = `${ipAddr}${port}`;

        menu.append("div")
            .text(`Change Nickname of ${ipPortPair}`)
            .style("margin-bottom", "5px")
            .on('click', () => {
                dispatch(setSelectedIP(ipAddr));
                if (mode === 'port') {
                    dispatch(setSelectedPort(nodeData.port));
                }
                dispatch(setIsNicknameChangeOpen(true));
            });


        if (port) {
            menu.append("div")
                .text("Choosing L4 Protocol of this Host as Filter") //getL4MenuText(nodeData.l4_proto))
                .style("margin-bottom", "5px")
                .on('click', () => {
                    nodeData.l4_proto.forEach((protocol) => dispatch(toggleL4Protocol(protocol)));
                    if (!isShowProtocolsOpen) { dispatch(setIsShowProtocolsOpen(true)); }
                    if (!showL4Protocol) { dispatch(setShowL4Protocol(true)); }
                });

            menu.append("div")
                .text("Choosing L7 Protocol of this Host as Filter") //getL7MenuText(nodeData.l7_proto))
                .style("margin-bottom", "5px")
                .on('click', () => {
                    nodeData.l7_proto.forEach((protocol) => dispatch(toggleL7Protocol(protocol)));
                    if (!isShowProtocolsOpen) { dispatch(setIsShowProtocolsOpen(true)); }
                    if (!showL7Protocol) { dispatch(setShowL7Protocol(true)); }
                });
        }
    };

    const getOpacity = (l4_proto, l7_proto) => {
        if (isShowProtocolsOpen && mode === 'port') {
            let isL4Selected = false;
            let isL7Selected = false;
            // console.log(l7_proto);
            l4_proto.forEach((protocol) => { isL4Selected = isL4Selected || selectedL4Protocols[ protocol ]; });
            l7_proto.forEach((protocol) => { isL7Selected = isL7Selected || selectedL7Protocols[ protocol ]; });

            return (filteringMode === "or" ? isL4Selected || isL7Selected : isL4Selected && isL7Selected) ? 1 : 0.1;
        } else {
            return 1;
        }
    };

    const getTooltipContentLink = (link) => {
        if (mode === 'host') {
            return `Traffic Volume: ${link.traffic_volume}`;
        } else {
            let l7_proto_display;
            if (Array.isArray(link.l7_proto)) {
                if (link.l7_proto.length > 1) {
                    // 'None'을 제외한 프로토콜 리스트 생성
                    l7_proto_display = link.l7_proto.filter((proto) => proto !== 'None');
                } else {
                    l7_proto_display = link.l7_proto;
                }
                // 배열을 문자열로 변환
                l7_proto_display = l7_proto_display.join(', ');
            } else {
                l7_proto_display = link.l7_proto;
            }

            return `Traffic Volume: ${link.traffic_volume}<br>L4 Protocol: ${link.l4_proto.join(", ")}<br>L7 Protocol: ${l7_proto_display}`;
        }
    };

    function resetAllNodes() {
        if (nodesRef.current && simulationRef.current && simulationRef.current.alpha() < 0.05) {
            nodesRef.current.forEach(d => {
                d.x = d.originalX;
                d.y = d.originalY;
                d.vx = 0;
                d.vy = 0;
                d.fx = null;
                d.fy = null;
            });
            simulationRef.current.alpha(1).restart();
            updateIsSimulationStable(false);
        }

        if (svgRef.current && zoomRef.current) {
            svgRef.current.transition().duration(1000).call(
                zoomRef.current.transform,
                d3.zoomIdentity
            );
        }
    }

    return (
        <div>
            <div>
                <ControlPanel resetAllNodes={resetAllNodes} />
                <svg ref={graphRef} style={{ width: '100vw', height: '100vh' }} />
            </div>
        </div>
        );
}

// <div id="cy" style={{ width: '100%', height: '93%', marginTop: '40px' }} />
// <div onClick={handleClickOutside}>
//   <Top onNavigateToTimeline={onNavigateToTimeline} onNavigateToGraph={onNavigateToGraph} />
/*
.on("contextmenu", function (event) {
                    event.preventDefault(); // 브라우저 기본 우클릭 메뉴 비활성화
                    setNodeMenuPosition({ x: event.clientX, y: event.clientY });
                    setNodeMenuVisible(true);
                });

{nodeMenuVisible && (
                <div
                style={{
                    position: "absolute",
                    top: nodeMenuPosition.y,
                    left: nodeMenuPosition.x,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "4px",
                    zIndex: 1000,
                    padding: "10px",
                }}
                >
                <div
                    style={{
                    padding: "8px",
                    cursor: "pointer",
                    }}
                    onClick={() => handleNodeMenuClickDetails()}
                >
                    Show Details
                </div>
                <div
                    style={{
                    padding: "8px",
                    cursor: "pointer",
                    }}
                    onClick={() => handleNodeMenuClick("기타")}
                >
                    기타
                </div>
                </div>
            )}

// menu event handler
    const handleNodeMenuClick = (option) => {
        alert(`${option} 클릭됨!`);

        setNodeMenuVisible(false);
    };
    const handleNodeMenuClickDetails = (option) => {
        setShowInfo(true);
        setShowNodeInfo(true);
        setShowLinkInfo(false);

        setNodeMenuVisible(false); // 메뉴 숨기기
    };
*/