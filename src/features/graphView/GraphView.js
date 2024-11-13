import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import "react-toggle/style.css";
import { setCurrentView } from '../data/dataSlice';
import { addEntry, setFormOpts } from '../timelineView/timelineViewSlice';
import ControlPanel from './components/ControlPanel';
import { setIsSimulationStable, addProtocols } from './components/controlPanelSlice';
import './GraphView.css';
import { setHostGraphData, setPortGraphData } from './graphViewSlice';


export default function GraphView() {
    const packets = useSelector((state) => state.data.packets);
    const graphRef = useRef(null);
    const hostData = useSelector((state) => state.graphView.hostGraphData);
    const portData = useSelector((state) => state.graphView.portGraphData);
    const nicknameMapping = useSelector((state) => state.controlPanel.nicknameMapping);
    const mode = useSelector((state) => state.graphView.mode);
    const currentView = useSelector((state) => state.data.currentView);
    const isSimulationStable = useSelector((state) => state.controlPanel.isSimulationStable);

    const simulationRef = useRef(null);
    const nodesRef = useRef([]);
    const svgRef = useRef(null); // SVG 요소에 대한 참조를 저장할 ref
    const zoomRef = useRef(null); // zoom behavior에 대한 참조를 저장할 ref
    const isSimulationStableRef = useRef(isSimulationStable);

    function updateIsSimulationStable(value) {
        dispatch(setIsSimulationStable(value));
        isSimulationStableRef.current = value;
    }

    const dispatch = useDispatch();

    const initHostData = () => {
        // Initialize host data with nodes and links
        const data = { nodes: [], links: [] };

        packets.forEach((packet) => {
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
                data.links.push({ source: src_ip, target: dst_ip, src_ip: src_ip, dst_ip: dst_ip });
            }
        });

        return data;
    };

    // const initPortData = () => {
    //     // Initialize port data with nodes and links
    //     const data = { nodes: [], links: [] };
    //     const timelineViewFormOpts = [ { ip_addr: "", ports: [ "" ] } ];

    //     packets.forEach((packet) => {
    //         const src_ip = packet._source.layers.ip[ 'ip.src_host' ];
    //         const dst_ip = packet._source.layers.ip[ 'ip.dst_host' ];
    //         const src_port = packet._source.layers.tcp ? packet._source.layers.tcp[ 'tcp.srcport' ] : packet._source.layers.udp[ 'udp.srcport' ];
    //         const dst_port = packet._source.layers.tcp ? packet._source.layers.tcp[ 'tcp.dstport' ] : packet._source.layers.udp[ 'udp.dstport' ];
    //         const frame_size = Number(packet._source.layers.frame[ 'frame.len' ]);
    //         const l4_proto = packet._source.layers.tcp ? 'TCP' : 'UDP';
    //         const layers = Object.keys(packet._source.layers);
    //         const l7_proto = layers[4] === 'tcp.segments' ? layers[5]?.toUpperCase() : layers[4]?.toUpperCase();

    //         const src_id = `${src_ip}:${src_port}`;
    //         const dst_id = `${dst_ip}:${dst_port}`;

    //         // Add source node
    //         let src_node = data.nodes.find(node => node.id === src_id);
    //         if (!src_node) {
    //             src_node = {
    //                 id: src_id,
    //                 ip_addr: src_ip,
    //                 port: src_port,
    //                 traffic_volume: frame_size,
    //                 l4_proto: l4_proto,
    //                 l7_proto: l7_proto
    //             };
    //             data.nodes.push(src_node);

    //             if (!timelineViewFormOpts.find(port => port.ip_addr === src_ip)) {
    //                 timelineViewFormOpts.push({ ip_addr: src_ip, ports: [ "", src_port ] });
    //             } else {
    //                 timelineViewFormOpts.find(port => port.ip_addr === src_ip).ports.push(src_port);
    //             }
    //         } else {
    //             src_node.traffic_volume += frame_size;
    //             if (src_node.l4_proto !== l4_proto) src_node.l4_proto = 'TCP/UDP';
    //             if (src_node.l7_proto !== l7_proto) {
    //                 if (src_node.l7_proto === undefined) {
    //                     src_node.l7_proto = l7_proto;
    //                 } else if (l7_proto !== undefined) {
    //                     src_node.l7_proto = "Multiple";
    //                 }
    //             }
    //         }

    //         // Add destination node
    //         let dst_node = data.nodes.find(node => node.id === dst_id);
    //         if (!dst_node) {
    //             dst_node = {
    //                 id: dst_id,
    //                 ip_addr: dst_ip,
    //                 port: dst_port,
    //                 traffic_volume: frame_size,
    //                 l4_proto: l4_proto,
    //                 l7_proto: l7_proto
    //             };
    //             data.nodes.push(dst_node);

    //             if (!timelineViewFormOpts.find(port => port.ip_addr === dst_ip)) {
    //                 timelineViewFormOpts.push({ ip_addr: dst_ip, ports: [ "", dst_port ] });
    //             } else {
    //                 timelineViewFormOpts.find(port => port.ip_addr === dst_ip).ports.push(dst_port);
    //             }
    //         } else {
    //             dst_node.traffic_volume += frame_size;
    //             if (dst_node.l4_proto !== l4_proto) dst_node.l4_proto = 'TCP/UDP';
    //             if (dst_node.l7_proto !== l7_proto) {
    //                 if (dst_node.l7_proto === undefined) {
    //                     dst_node.l7_proto = l7_proto;
    //                 } else if (l7_proto !== undefined) {
    //                     dst_node.l7_proto = "Multiple";
    //                 }
    //             }
    //         }

    //         // Add link
    //         if (!data.links.find(link => link.source === src_id && link.target === dst_id)) {
    //             data.links.push({
    //                 source: src_id,
    //                 target: dst_id,
    //                 src_ip: src_ip,
    //                 src_port: src_port,
    //                 dst_ip: dst_ip,
    //                 dst_port: dst_port
    //             });
    //         }
    //     });
    const initPortData = () => {
        // Initialize port data with nodes and links
        const data = { nodes: [], links: [] };
        const timelineViewFormOpts = [ { ip_addr: "", ports: [ "" ] } ];
        const allL4Protocols = new Set();
        const allL7Protocols = new Set();

        packets.forEach((packet) => {
            const src_ip = packet._source.layers.ip['ip.src_host'];
            const dst_ip = packet._source.layers.ip['ip.dst_host'];
            const src_port = packet._source.layers.tcp
                ? packet._source.layers.tcp['tcp.srcport']
                : packet._source.layers.udp['udp.srcport'];
            const dst_port = packet._source.layers.tcp
                ? packet._source.layers.tcp['tcp.dstport']
                : packet._source.layers.udp['udp.dstport'];
            const frame_size = Number(packet._source.layers.frame['frame.len']);
            const l4_proto = packet._source.layers.tcp ? 'TCP' : 'UDP';
            const layers = Object.keys(packet._source.layers);
            let temp_l7_proto = layers[4] === 'tcp.segments' ? layers[5]?.toUpperCase() : layers[4]?.toUpperCase();
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
                    l4_proto: [l4_proto],
                    l7_proto: l7_proto ? [l7_proto] : [],
                };
                data.nodes.push(src_node);

                if (!timelineViewFormOpts.find((port) => port.ip_addr === src_ip)) {
                    timelineViewFormOpts.push({ ip_addr: src_ip, ports: ['', src_port] });
                } else {
                    timelineViewFormOpts
                        .find((port) => port.ip_addr === src_ip)
                        .ports.push(src_port);
                }
            } else {
                src_node.traffic_volume += frame_size;
                if (!src_node.l4_proto.includes(l4_proto)) {
                    src_node.l4_proto.push(l4_proto);
                }
                if (l7_proto && !src_node.l7_proto.includes(l7_proto)) {
                    src_node.l7_proto.push(l7_proto);
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
                    l4_proto: [l4_proto],
                    l7_proto: l7_proto ? [l7_proto] : [],
                };
                data.nodes.push(dst_node);

                if (!timelineViewFormOpts.find((port) => port.ip_addr === dst_ip)) {
                    timelineViewFormOpts.push({ ip_addr: dst_ip, ports: ['', dst_port] });
                } else {
                    timelineViewFormOpts
                        .find((port) => port.ip_addr === dst_ip)
                        .ports.push(dst_port);
                }
            } else {
                dst_node.traffic_volume += frame_size;
                if (!dst_node.l4_proto.includes(l4_proto)) {
                    dst_node.l4_proto.push(l4_proto);
                }
                if (l7_proto && !dst_node.l7_proto.includes(l7_proto)) {
                    dst_node.l7_proto.push(l7_proto);
                }
            }
    
            // Add link
            if (
                !data.links.find(
                    (link) => link.source === src_id && link.target === dst_id
                )
            ) {
                data.links.push({
                    source: src_id,
                    target: dst_id,
                    src_ip: src_ip,
                    src_port: src_port,
                    dst_ip: dst_ip,
                    dst_port: dst_port,
                });
            }
        });

        // Sort ports in AvailableHostPorts in ascending order
        timelineViewFormOpts.forEach(port => port.ports.sort((a, b) => a - b));

        // Sort hosts in AvailableHostPorts in ascending order
        timelineViewFormOpts.sort((a, b) => a.ip_addr.localeCompare(b.ip_addr));


        dispatch(setFormOpts(timelineViewFormOpts));
        dispatch(addProtocols({
            l4Protocols: Array.from(allL4Protocols),
            l7Protocols: Array.from(allL7Protocols),
        }));

        return data;
    };


    useEffect(() => {
        setCurrentView('graph');
    }, [ dispatch ]);

    useEffect(() => {
        if (packets && !hostData) {
            dispatch(setHostGraphData(initHostData()));
            dispatch(setPortGraphData(initPortData()));
        }
    }, [ dispatch, hostData, portData ]);

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
                .attr("stroke-width", d => Math.sqrt(d.value))
                .attr("marker-end", "url(#arrowhead)")
                // Highlight the link with black stroke on hover && make it thicker
                .on("mouseover", function (event) {
                    d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
                })
                .on("mouseout", function (event) {
                    d3.select(this).attr("stroke", "#999").attr("stroke-width", 1);
                })
                .on("click", (event) => {
                    const hostA = event.srcElement.__data__.src_ip;
                    const portA = event.srcElement.__data__.src_port;
                    const hostB = event.srcElement.__data__.dst_ip;
                    const portB = event.srcElement.__data__.dst_port;
                    dispatch(addEntry({ metadata: { hostA, portA, hostB, portB }, formSelections: { hostA, portA, hostB, portB, radioASelected: true } }));
                    dispatch(setCurrentView('timeline'));
                });

            // Add nodes
            const node = container.append("g")
                // Removed unnecessary white strokes
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("r", d => sizeScale(d.traffic_volume))
                .attr("fill", d => colorScale(d.ip_addr))
                // .on("dblclick", resetNodePosition)
                .on("dblclick.zoom", null) // Prevent zoom on double-click on nodes
                .on("click", (event, d) => {
                    dispatch(addEntry({ metadata: null, formSelections: { hostA: d.ip_addr, portA: d.port, hostB: "", portB: "", radioASelected: true } })); // Add new entry in TimelineView
                    dispatch(setCurrentView('timeline'));
                    d3.selectAll(".tooltip").remove();
                });

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
                    .html(getTooltipContent(d, mode));

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
                });

            // Add labels
            const labels = container.append("g")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .text(d => getNicknameLabel(d, mode))
                .attr("font-size", "10px")
                .attr("fill", "#555")
                .attr("dy", "-1em")
                .attr("text-anchor", "middle")
                .on("click", (event) => {
                    event.stopPropagation();
                });


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

    useEffect(() => {
        if (!hostData || !portData) return;

        d3.select(graphRef.current).selectAll("text")
            .text(d => getNicknameLabel(d, mode));

        const tooltip = d3.select("body").select(".tooltip");
        d3.select(graphRef.current).selectAll("circle")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(getTooltipContent(d, mode));
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    }, [ nicknameMapping, mode ]);

    const getNicknameLabel = (node, mode) => {
        if (mode === 'host') {
            return nicknameMapping[ node.ip_addr ] || node.ip_addr;
        } else {
            const key = `${node.ip_addr}:${node.port}`;
            return nicknameMapping[ key ] || `${node.ip_addr}:${node.port}`;
        }
    };

    const getTooltipContent = (node, mode) => {
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

    const onNavigateToTimeline = () => {
        dispatch(setCurrentView('timeline'));

        // Clear all tooltips
        d3.selectAll(".tooltip").remove();
    };


    switch (currentView) {
        case 'fileUpload':
            return <Navigate to="/" />;
        case 'graph':
            return (
                <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
                    <ControlPanel resetAllNodes={resetAllNodes} />
                    <div style={{ position: "absolute", right: 40, top: "50vh", zIndex: 10 }}>
                        <Button className="rounded-circle" variant="light" onClick={onNavigateToTimeline} ><FontAwesomeIcon icon={faChevronRight} size="2xl" /></Button>
                    </div>
                    <svg ref={graphRef} style={{ width: '100%', height: '100%' }} />
                </div>);
        case 'timeline':
            return <Navigate to="/timeline" />;
        default:
            break;
    }
}
