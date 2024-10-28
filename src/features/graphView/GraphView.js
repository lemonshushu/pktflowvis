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
        // "nodes" consist of {"ip_addr", "traffic_volume"}, where traffic_volume is the sum of all traffic sent/received by the host
        // "links" consist of {"src_ip", "dst_ip"}
        const data = { "nodes": [], "links": [] };

        packets.forEach((packet) => {
            const src_ip = packet._source.layers.ip[ 'ip.src_host' ];
            const dst_ip = packet._source.layers.ip[ 'ip.dst_host' ];
            const frame_size = packet._source.layers.frame[ 'frame.len' ];

            // Check if src_ip is already in the "nodes" array
            const src_index = data.nodes.findIndex((node) => node.ip_addr === src_ip);
            if (src_index === -1) {
                data.nodes.push({ "ip_addr": src_ip, "traffic_volume": frame_size });
            } else {
                data.nodes[ src_index ].traffic_volume += frame_size;
            }

            // Check if dst_ip is already in the "nodes" array
            const dst_index = data.nodes.findIndex((node) => node.ip_addr === dst_ip);
            if (dst_index === -1) {
                data.nodes.push({ "ip_addr": dst_ip, "traffic_volume": frame_size });
            } else {
                data.nodes[ dst_index ].traffic_volume += frame_size;
            }

            // Check if the link is already in the "links" array
            const link = data.links.find((link) => link.src_ip === src_ip && link.dst_ip === dst_ip);
            if (!link) {
                data.links.push({ "src_ip": src_ip, "dst_ip": dst_ip });
            }
        });

        return data;
    };

    const initPortData = () => {
        // "nodes" consist of {"ip_addr", "port", traffic_volume", "l4_proto", "l7_proto"}
        // "links" consist of {"src_ip", "src_port", "dst_ip", "dst_port"}
        const data = { "nodes": [], "links": [] };

        packets.forEach((packet) => {
            const src_ip = packet._source.layers.ip[ 'ip.src_host' ];
            const dst_ip = packet._source.layers.ip[ 'ip.dst_host' ];
            const src_port = packet._source.layers.tcp ? packet._source.layers.tcp[ 'tcp.srcport' ] : packet._source.layers.udp[ 'udp.srcport' ];
            const dst_port = packet._source.layers.tcp ? packet._source.layers.tcp[ 'tcp.dstport' ] : packet._source.layers.udp[ 'udp.dstport' ];
            const frame_size = packet._source.layers.frame[ 'frame.len' ];
            const l4_proto = packet._source.layers.tcp ? 'TCP' : 'UDP';
            // l7_proto is 5th key of packet._source.layers.tcp or packet._source.layers.udp
            const l7_proto = packet._source.layers.tcp ? Object.keys(packet._source.layers.tcp)[ 4 ] : Object.keys(packet._source.layers.udp)[ 4 ];

            const src_index = data.nodes.findIndex((node) => node.ip_addr === src_ip && node.port === src_port);
            if (src_index === -1) {
                data.nodes.push({ "ip_addr": src_ip, "port": src_port, "traffic_volume": frame_size, "l4_proto": l4_proto, "l7_proto": l7_proto });
            } else {
                data.nodes[ src_index ].traffic_volume += frame_size;
                if (l4_proto != data.nodes[ src_index ].l4_proto) {
                    data.nodes[ src_index ].l4_proto = 'TCP/UDP';
                }
                if (l7_proto != data.nodes[ src_index ].l7_proto) {
                    data.nodes[ src_index ].l7_proto = 'Multiple';
                }
            }

            const dst_index = data.nodes.findIndex((node) => node.ip_addr === dst_ip && node.port === dst_port);
            if (dst_index === -1) {
                data.nodes.push({ "ip_addr": dst_ip, "port": dst_port, "traffic_volume": frame_size, "l4_proto": l4_proto, "l7_proto": l7_proto });
            } else {
                data.nodes[ dst_index ].traffic_volume += frame_size;
                if (l4_proto != data.nodes[ dst_index ].l4_proto) {
                    data.nodes[ dst_index ].l4_proto = 'TCP/UDP';
                }
                if (l7_proto != data.nodes[ dst_index ].l7_proto) {
                    data.nodes[ dst_index ].l7_proto = 'Multiple';
                }
            }

            // Check if the link is already in the "links" array
            const link = data.links.find((link) => link.src_ip === src_ip && link.src_port === src_port && link.dst_ip === dst_ip && link.dst_port === dst_port);
            if (!link) {
                data.links.push({ "src_ip": src_ip, "src_port": src_port, "dst_ip": dst_ip, "dst_port": dst_port });
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

        if (mode == 'host') {
            const links = hostData.links.map(d => Object.create(d));
            const nodes = hostData.nodes.map(d => Object.create(d));

            // const simulation = d3.forceSimulation(nodes)
            //     .force("link", d3.forceLink(links).id(d => d.ip_addr))
            //     .force("charge", d3.forceManyBody())
            //     .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2));

            // const svg = d3.select(graphRef.current)
            //     .attr("viewBox", [ 0, 0, graphWidth, graphHeight ]);

            // const link = svg.append("g")
            //     .attr("stroke", "#999")
            //     .attr("stroke-opacity", 0.6)
            //     .selectAll("line")
            //     .data(links)
            //     .join("line")
            //     .attr("stroke-width", d => Math.sqrt(d.value));

            // const node = svg.append("g")
            //     .attr("stroke", "#fff")
            //     .attr("stroke-width", 1.5)
            //     .selectAll("circle")
            //     .data(nodes)
            //     .join("circle")
            //     .attr("r", 5)
            //     .attr("fill", color(1))
            //     .call(drag(simulation));

            // node.append("title")
            //     .text(d => d.ip_addr);

            // simulation.on("tick", () => {
            //     link
            //         .attr("x1", d => d.source.x)
            //         .attr("y1", d => d.source.y)
            //         .attr("x2", d => d.target.x)
            //         .attr("y2", d => d.target.y);

            //     node
            //         .attr("cx", d => d.x)
            //         .attr("cy", d => d.y);
            // }
            // );

            // return () => simulation.stop();

        } else {

        }
    }, [ hostData, portData, mode ]);


    return (
        packets ?
            <div><svg ref={graphRef} /></div> : <Navigate to="/" />
    );
}