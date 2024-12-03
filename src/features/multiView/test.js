import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Typography } from '@mui/material';

const renderTree = (nodes, path = '', level = 0) => {
    return (
        <>
        {Object.entries(nodes).map(([key, value], index) => {
            const itemId = `${path}-${key}-${index}`;

            // Determine if the current key is a layer
            const isLayer = level === 0;

            // Define label content
            let labelContent = key;

            // Customize the label for specific layers
            if (key === 'frame') {
                // Extract cap_len and frame number from value
                const capLenStr = value['frame.cap_len'];
                const capLen = parseInt(capLenStr, 10);
                const frameNumber = value['frame.number'] || '';
                if (!isNaN(capLen)) {
                    labelContent = `Frame ${frameNumber}: ${capLen} bytes on wire (${capLen * 8} bits), ${capLen} bytes captured (${capLen * 8} bits)`;
                } else {
                    labelContent = `Frame ${frameNumber}`;
                }
            } else if (key === 'eth') {
                // Extract eth.src and eth.dst
                const srcMac = value['eth.src'] || 'unknown';
                const dstMac = value['eth.dst'] || 'unknown';
                labelContent = `Ethernet, Src: ${srcMac}, Dst: ${dstMac}`;
            } else if (key === 'ip') {
                // Extract ip.src and ip.dst
                const srcIp = value['ip.src'] || 'unknown';
                const dstIp = value['ip.dst'] || 'unknown';
                labelContent = `Internet Protocol, Src: ${srcIp}, Dst: ${dstIp}`;
            } else if (key === 'tcp') {
                // Extract tcp.srcport, tcp.dstport, tcp.seq, tcp.ack, tcp.len
                const srcPort = value['tcp.srcport'] || 'unknown';
                const dstPort = value['tcp.dstport'] || 'unknown';
                const seqNum = value['tcp.seq'] || 'unknown';
                const ackNum = value['tcp.ack'] || 'unknown';
                const length = value['tcp.len'] || 'unknown';
                labelContent = `Transmission Control Protocol, Src Port: ${srcPort}, Dst Port: ${dstPort}, Seq: ${seqNum}, Ack: ${ackNum}, Len: ${length}`;
            } else if (key === 'udp') {
                const srcPort = value['udp.srcport'] || 'unknown';
                const dstPort = value['udp.dstport'] || 'unknown';
                const length = value['udp.length'] || 'unknown';
                labelContent = `User Datagram Protocol, Src Port: ${srcPort}, Dst Port: ${dstPort}, Len: ${length}`;
            } else if (level === 0){
                labelContent = key.toUpperCase();
            }

            // Define the label style
            const labelStyle = {
                backgroundColor: isLayer ? '#e0e0e0' : 'transparent', // Gray background for layers
                padding: '4px',
            };

            // Create the label component
            const label = (
                <Typography align="left" sx={labelStyle}>
                    {labelContent}
                </Typography>
            );

            if (typeof value === 'object' && value !== null) {
                return (
                    <TreeItem key={itemId} itemId={itemId} label={label}>
                    {renderTree(value, itemId, level + 1)}
                    </TreeItem>
                );
            } else {
                const leafItemId = `${itemId}-leaf`;
                return (
                    <TreeItem
                    key={leafItemId}
                    itemId={leafItemId}
                    label={
                        <Typography align="left" sx={{ padding: '4px' }}>
                        {`${key}: ${value}`}
                        </Typography>
                    }
                    />
                );
            }
        })}
        </>
    );
};

const data = [{
    "_index": "packets-2024-10-09",
    "_type": "doc",
    "_score": null,
    "_source": {
      "layers": {
        "frame": {
          "frame.encap_type": "1",
          "frame.time": "Oct  9, 2024 17:30:04.861459000 대한민국 표준시",
          "frame.time_utc": "Oct  9, 2024 08:30:04.861459000 UTC",
          "frame.time_epoch": "1728462604.861459000",
          "frame.offset_shift": "0.000000000",
          "frame.time_delta": "0.000000000",
          "frame.time_delta_displayed": "0.000000000",
          "frame.time_relative": "0.000000000",
          "frame.number": "1",
          "frame.len": "102",
          "frame.cap_len": "102",
          "frame.marked": "0",
          "frame.ignored": "0",
          "frame.protocols": "eth:ethertype:ip:tcp:ssh",
          "frame.coloring_rule.name": "TCP",
          "frame.coloring_rule.string": "tcp"
        },
        "eth": {
          "eth.dst": "06:eb:19:fb:09:29",
          "eth.dst_tree": {
            "eth.dst_resolved": "06:eb:19:fb:09:29",
            "eth.dst.oui": "453401",
            "eth.dst.lg": "1",
            "eth.dst.ig": "0",
            "eth.addr": "06:eb:19:fb:09:29",
            "eth.addr_resolved": "06:eb:19:fb:09:29",
            "eth.addr.oui": "453401",
            "eth.lg": "1",
            "eth.ig": "0"
          },
          "eth.src": "06:ee:5b:03:30:8b",
          "eth.src_tree": {
            "eth.src_resolved": "06:ee:5b:03:30:8b",
            "eth.src.oui": "454235",
            "eth.src.lg": "1",
            "eth.src.ig": "0",
            "eth.addr": "06:ee:5b:03:30:8b",
            "eth.addr_resolved": "06:ee:5b:03:30:8b",
            "eth.addr.oui": "454235",
            "eth.lg": "1",
            "eth.ig": "0"
          },
          "eth.type": "0x0800",
          "eth.stream": "0"
        },
        "ip": {
          "ip.version": "4",
          "ip.hdr_len": "20",
          "ip.dsfield": "0x10",
          "ip.dsfield_tree": {
            "ip.dsfield.dscp": "4",
            "ip.dsfield.ecn": "0"
          },
          "ip.len": "88",
          "ip.id": "0x5d0c",
          "ip.flags": "0x02",
          "ip.flags_tree": {
            "ip.flags.rb": "0",
            "ip.flags.df": "1",
            "ip.flags.mf": "0"
          },
          "ip.frag_offset": "0",
          "ip.ttl": "64",
          "ip.proto": "6",
          "ip.checksum": "0x9488",
          "ip.checksum.status": "2",
          "ip.src": "172.31.22.230",
          "ip.addr": "172.31.22.230",
          "ip.src_host": "172.31.22.230",
          "ip.host": "172.31.22.230",
          "ip.dst": "211.104.178.141",
          "ip.addr": "211.104.178.141",
          "ip.dst_host": "211.104.178.141",
          "ip.host": "211.104.178.141",
          "ip.stream": "0"
        },
        "tcp": {
          "tcp.srcport": "22",
          "tcp.dstport": "1915",
          "tcp.port": "22",
          "tcp.port": "1915",
          "tcp.stream": "0",
          "tcp.stream.pnum": "1",
          "tcp.completeness": "12",
          "tcp.completeness_tree": {
            "tcp.completeness.rst": "0",
            "tcp.completeness.fin": "0",
            "tcp.completeness.data": "1",
            "tcp.completeness.ack": "1",
            "tcp.completeness.syn-ack": "0",
            "tcp.completeness.syn": "0",
            "tcp.completeness.str": "··DA··"
          },
          "tcp.len": "48",
          "tcp.seq": "1",
          "tcp.seq_raw": "1964397009",
          "tcp.nxtseq": "49",
          "tcp.ack": "1",
          "tcp.ack_raw": "2249489372",
          "tcp.hdr_len": "20",
          "tcp.flags": "0x0018",
          "tcp.flags_tree": {
            "tcp.flags.res": "0",
            "tcp.flags.ae": "0",
            "tcp.flags.cwr": "0",
            "tcp.flags.ece": "0",
            "tcp.flags.urg": "0",
            "tcp.flags.ack": "1",
            "tcp.flags.push": "1",
            "tcp.flags.reset": "0",
            "tcp.flags.syn": "0",
            "tcp.flags.fin": "0",
            "tcp.flags.str": "·······AP···"
          },
          "tcp.window_size_value": "460",
          "tcp.window_size": "460",
          "tcp.window_size_scalefactor": "-1",
          "tcp.checksum": "0x4946",
          "tcp.checksum.status": "2",
          "tcp.urgent_pointer": "0",
          "Timestamps": {
            "tcp.time_relative": "0.000000000",
            "tcp.time_delta": "0.000000000"
          },
          "tcp.analysis": {
            "tcp.analysis.bytes_in_flight": "48",
            "tcp.analysis.push_bytes_sent": "48"
          },
          "tcp.payload": "76:67:d8:3d:7d:63:3a:d0:09:1e:a7:5f:b6:bb:39:8f:9c:9b:3d:cb:93:31:3a:ff:b4:ce:76:eb:b6:bb:14:b5:5e:71:be:c1:0d:ba:9f:97:6c:32:d2:66:d7:67:8d:bc"
        },
        "ssh": {
          "ssh.packet_length_encrypted": "76:67:d8:3d",
          "ssh.encrypted_packet": "7d:63:3a:d0:09:1e:a7:5f:b6:bb:39:8f:9c:9b:3d:cb:93:31:3a:ff:b4:ce:76:eb:b6:bb:14:b5:5e:71:be:c1:0d:ba:9f:97:6c:32:d2:66:d7:67:8d:bc",
          "ssh.direction": "1"
        }
      }
    }
}];

const PacketDetail = () => {
    return (
        <SimpleTreeView>
            {data.map((packet, index) => (
                renderTree(packet._source.layers, `root-${index}`, 0)
            ))}
        </SimpleTreeView>
    );
};

export default PacketDetail;