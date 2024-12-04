import GraphView from '../graphView/GraphView';
import TimelineView from '../timelineView/TimelineView';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setShowInfo } from '../timelineView/timelineViewSlice';
import { ArrowExport20Regular } from '@fluentui/react-icons';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Typography } from '@mui/material';
import './MultiView.css';

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

export default function MultiView() {
    const dispatch = useDispatch();
    const currentView = useSelector((state) => state.data.currentView);
    const showInfo = useSelector((state) => state.timelineView.showInfo);
    const selectedPacket = useSelector((state) => state.timelineView.selectedPacket);

    switch (currentView) {
        case 'fileUpload':
            return <Navigate to="/" />;
        case 'multi':
            return (
                <div>
                    <div style={{ position: "fixed", width: "100vw", height: "100vh", left: 0, top: 0, "z-index": -5}}>
                        <GraphView />
                    </div>
                    <div style={{ "margin-top": "60px", position: "absolute", width: "50vw", left: "50vw" }}>
                        <TimelineView />
                    </div>
                    {showInfo && (
                        <div className='info-box'>
                            <div className='info-content'>
                                <button onClick={() => {dispatch(setShowInfo(false));}} className='info-top'>
                                    <ArrowExport20Regular />
                                    <b>Details</b>
                                </button>
                                <div>
                                    <SimpleTreeView>
                                        {renderTree(selectedPacket._source.layers, `root-1`, 0)}
                                    </SimpleTreeView>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        default:
            break;
    }

}