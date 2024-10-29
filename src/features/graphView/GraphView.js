import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { setHostGraphData, setPortGraphData } from './graphViewSlice';


export default function GraphView() {
    const packets = useSelector((state) => state.data.packets);
    const graphRef = useRef(null);
    const hostData = useSelector((state) => state.graphView.hostGraphData);
    const portData = useSelector((state) => state.graphView.portGraphData);
    const mode = useSelector((state) => state.graphView.mode);

    const graphWidth = 928;
    const graphHeight = 600;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const dispatch = useDispatch();

    const initHostData = () => {
        // "nodes" consist of {"id", "ip_addr", "traffic_volume"}, where traffic_volume is the sum of all traffic sent/received by the host
        // "links" consist of {"source", "target", "src_ip", "dst_ip"}
        // Note that "id" in nodes and "source" and "target" in links are needed for d3.forceLink
        const data = { "nodes": [], "links": [] };

        packets.forEach((packet) => {
            const src_ip = packet._source.layers.ip[ 'ip.src_host' ];
            const dst_ip = packet._source.layers.ip[ 'ip.dst_host' ];
            const frame_size = Number(packet._source.layers.frame[ 'frame.len' ]);

            // Check if src_ip is already in the "nodes" array
            const src_index = data.nodes.findIndex((node) => node.ip_addr === src_ip);
            if (src_index === -1) {
                data.nodes.push({ "id": src_ip, "ip_addr": src_ip, "traffic_volume": frame_size });
            } else {
                data.nodes[ src_index ].traffic_volume += frame_size;
            }

            // Check if dst_ip is already in the "nodes" array
            const dst_index = data.nodes.findIndex((node) => node.ip_addr === dst_ip);
            if (dst_index === -1) {
                data.nodes.push({ "id": dst_ip, "ip_addr": dst_ip, "traffic_volume": frame_size });
            } else {
                data.nodes[ dst_index ].traffic_volume += frame_size;
            }

            // Check if the link is already in the "links" array
            const link = data.links.find((link) => link.src_ip === src_ip && link.dst_ip === dst_ip);
            if (!link) {
                data.links.push({source: src_ip, target: dst_ip, "src_ip": src_ip, "dst_ip": dst_ip });
            }
        });

        return data;
    };

    const initPortData = () => {
        // "nodes" consist of {"id", "ip_addr", "port", traffic_volume", "l4_proto", "l7_proto"}
        // "links" consist of {"source", "target", "src_ip", "src_port", "dst_ip", "dst_port"}
        const data = { "nodes": [], "links": [] };

        packets.forEach((packet) => {
            const src_ip = packet._source.layers.ip[ 'ip.src_host' ];
            const dst_ip = packet._source.layers.ip[ 'ip.dst_host' ];
            const src_port = packet._source.layers.tcp ? packet._source.layers.tcp[ 'tcp.srcport' ] : packet._source.layers.udp[ 'udp.srcport' ];
            const dst_port = packet._source.layers.tcp ? packet._source.layers.tcp[ 'tcp.dstport' ] : packet._source.layers.udp[ 'udp.dstport' ];
            const frame_size = Number(packet._source.layers.frame[ 'frame.len' ]);
            const l4_proto = packet._source.layers.tcp ? 'TCP' : 'UDP';
            // l7_proto is 5th key of packet._source.layers.tcp or packet._source.layers.udp
            const l7_proto = packet._source.layers.tcp ? Object.keys(packet._source.layers.tcp)[ 4 ] : Object.keys(packet._source.layers.udp)[ 4 ];

            const src_id = src_ip + ':' + src_port;
            const dst_id = dst_ip + ':' + dst_port;

            const src_index = data.nodes.findIndex((node) => node.id === src_id);
            if (src_index === -1) {
                data.nodes.push({"id": src_id, "ip_addr": src_ip, "port": src_port, "traffic_volume": frame_size, "l4_proto": l4_proto, "l7_proto": l7_proto });
            } else {
                data.nodes[ src_index ].traffic_volume += frame_size;
                if (l4_proto !== data.nodes[ src_index ].l4_proto) {
                    data.nodes[ src_index ].l4_proto = 'TCP/UDP';
                }
                if (l7_proto !== data.nodes[ src_index ].l7_proto) {
                    data.nodes[ src_index ].l7_proto = 'Multiple';
                }
            }

            const dst_index = data.nodes.findIndex((node) => node.id === dst_id);
            if (dst_index === -1) {
                data.nodes.push({ "id": dst_id, "ip_addr": dst_ip, "port": dst_port, "traffic_volume": frame_size, "l4_proto": l4_proto, "l7_proto": l7_proto });
            } else {
                data.nodes[ dst_index ].traffic_volume += frame_size;
                if (l4_proto !== data.nodes[ dst_index ].l4_proto) {
                    data.nodes[ dst_index ].l4_proto = 'TCP/UDP';
                }
                if (l7_proto !== data.nodes[ dst_index ].l7_proto) {
                    data.nodes[ dst_index ].l7_proto = 'Multiple';
                }
            }

            // Check if the link is already in the "links" array
            const link = data.links.find((link) => link.source === src_id && link.target === dst_id);
            if (!link) {
                data.links.push({ "source": src_id, "target": dst_id, "src_ip": src_ip, "src_port": src_port, "dst_ip": dst_ip, "dst_port": dst_port });
            }

        });

        return data;
    };
    useEffect(() => {
        // Refer to: https://observablehq.com/@d3/force-directed-graph/2
        if (!hostData) {
            // Initialize the hostData and portData
            const hostData = initHostData();
            const portData = initPortData();
            dispatch(setHostGraphData(hostData));
            dispatch(setPortGraphData(portData));
        }

    }, [ dispatch ]);
    useEffect(() => {
        if (!hostData) return; // Wait for hostData to be initialized
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
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        };

        if (mode === 'host') {
            const links = hostData.links.map(d => ({ ...d }));
            const nodes = hostData.nodes.map(d => ({ ...d }));
        
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(nodes.map(d => d.ip_addr));
        
            const sizeScale = d3.scaleSqrt()
                .domain(d3.extent(nodes, d => d.traffic_volume))
                .range([5, 20]);
        
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links)
                    .id(d => d.ip_addr)
                    .distance(100)
                )
                .force("charge", d3.forceManyBody().strength(-50))
                .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2));
        
            const svg = d3.select(graphRef.current)
                .attr("viewBox", [0, 0, graphWidth, graphHeight]);
        
            svg.append("defs").append("marker")
                .attr("id", "arrowhead")
                .attr("viewBox", [0, 0, 10, 10])
                .attr("refX", 10)
                .attr("refY", 5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto-start-reverse")
                .append("path")
                .attr("d", "M 0 0 L 10 5 L 0 10 Z")
                .attr("fill", "#999");
        
            const link = svg.append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", d => Math.sqrt(d.value))
                .attr("marker-end", "url(#arrowhead)");
        
            const node = svg.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("r", d => sizeScale(d.traffic_volume))
                .attr("fill", d => colorScale(d.ip_addr))
                .call(drag(simulation));
        
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
                        .html(`IP: ${d.ip_addr}<br>Traffic Volume: ${d.traffic_volume}`);
                })
                .on("mousemove", event => {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", () => {
                    tooltip.style("opacity", 0);
                });
        
            const labels = svg.append("g")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .attr("x", d => d.x + 8)
                .attr("y", d => d.y)
                .text(d => d.id)
                .attr("font-size", "10px")
                .attr("fill", "#555");
        
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => {
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const offsetX = (dx * (sizeScale(d.target.traffic_volume) + 5)) / distance;  // Adjust arrow offset
                        return d.target.x - offsetX;
                    })
                    .attr("y2", d => {
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const offsetY = (dy * (sizeScale(d.target.traffic_volume) + 5)) / distance;  // Adjust arrow offset
                        return d.target.y - offsetY;
                    });
        
                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
        
                labels
                    .attr("x", d => d.x + 8)
                    .attr("y", d => d.y);
            });
        
            return () => {
                simulation.stop();
                tooltip.remove();
            };
        }
        
         else {

        }
    }, [ hostData, portData, mode ]);


    return (
        packets ?
            <div><svg ref={graphRef} /></div> : <Navigate to="/" />
    );
}