import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNicknameMapping, resetNicknameMapping, setIsNicknameChangeOpen } from './controlPanelSlice';
import { Button, Form } from 'react-bootstrap';

export default function NicknameChange() {
    const hostData = useSelector((state) => state.graphView.hostGraphData);
    const portData = useSelector((state) => state.graphView.portGraphData);
    const mode = useSelector((state) => state.graphView.mode);

    const isSimulationStable = useSelector((state) => state.controlPanel.isSimulationStable);
    const isNicknameChangeOpen = useSelector((state) => state.controlPanel.isNicknameChangeOpen);

    const [selectedIP, setSelectedIP] = useState('');
    const [selectedPort, setSelectedPort] = useState('');
    const [availablePorts, setAvailablePorts] = useState([]);
    const [nickname, setNickname] = useState('');

    const dispatch = useDispatch();

    useEffect(() => {
        if (mode === 'port' && selectedIP) {
            const ports = portData.nodes
                .filter(node => node.ip_addr === selectedIP)
                .map(node => node.port);
            const uniquePorts = Array.from(new Set(ports));
            setAvailablePorts(uniquePorts);
        } else {
            setAvailablePorts([]);
        }
        setSelectedPort('');
    }, [selectedIP, mode]);
    
    useEffect(() => {
        setSelectedIP('');
        setSelectedPort('');
        setAvailablePorts([]);
    }, [mode]);

    const handleNicknameChange = () => {
        if (!selectedIP) {
            alert("Please select an IP address.");
            return;
        }
    
        if (mode === 'host') {
            dispatch(setNicknameMapping({ [selectedIP]: nickname }));
        } else if (mode === 'port') {
            if (!selectedPort) {
                alert("Please select a port.");
                return;
            }
            const key = `${selectedIP}:${selectedPort}`;
            dispatch(setNicknameMapping({ [key]: nickname }));
        }
    
        setNickname('');
    };

    const handleResetNickname = () => {
        if (!selectedIP) {
            alert("Please select an IP address.");
            return;
        }
    
        if (mode === 'host') {
            dispatch(resetNicknameMapping(selectedIP));
        } else if (mode === 'port') {
            if (!selectedPort) {
                alert("Please select a port.");
                return;
            }
            const key = `${selectedIP}:${selectedPort}`;
            dispatch(resetNicknameMapping(key));
        }
    };

    const handleResetAllNicknames = () => {
        setSelectedIP('');
        setSelectedPort('');
        setAvailablePorts([]);
        dispatch(resetNicknameMapping());
    };   

    return (
        <div className='nickname-change-container'>
            {/* Nickname Change 메뉴 */}
            <div 
                className='menubar'
                onClick={() => dispatch(setIsNicknameChangeOpen(!isNicknameChangeOpen))}
            >
                <strong>Nickname Change</strong>
                <span>{isNicknameChangeOpen ? "▼" : "◀"}</span> {/* "◀ ▲ ▶ ▼" */}
            </div>

            {/* Nickname Change 메뉴 아이템 (계층 구조로 보이도록 하되 너비는 줄어들지 않음) */}
            {isNicknameChangeOpen && (
                <div style={{ marginBottom: "20px", width: "100%" }}>
                    {/* IP Address 선택 */}
                    <div style={{ marginBottom: "20px", width: "100%" }}>
                        <Form.Label><strong>IP Address:</strong></Form.Label>
                        <Form.Select
                            className="ip-selector"
                            style={{ width: '100%' }}
                            // TODO: change setSelectedIP and setSelectedPort as input to props or slice.
                            onChange={(e) => { setSelectedIP(e.target.value); setSelectedPort(""); }}
                            value={selectedIP}
                        >
                            <option></option>
                            {hostData?.nodes.map((opt, index) => (
                                <option key={index} value={opt.ip_addr}>{opt.ip_addr}</option>
                            ))}
                        </Form.Select>
                    </div>

                    {/* Port Selection (Only visible in 'port' mode) */}
                    {mode === 'port' && (
                        <div style={{ marginBottom: "20px", width: "100%" }}>
                            <Form.Label><strong>Port:</strong></Form.Label>
                            <Form.Select
                                style={{ width: '100%' }}
                                onChange={(e) => setSelectedPort(e.target.value)}
                                value={selectedPort}
                            >
                                <option></option>
                                {availablePorts.map((port, index) => (
                                    <option key={index} value={port}>{port}</option>
                                ))}
                            </Form.Select>
                        </div>
                    )}

                    {/* Nickname Input */}
                    <div style={{ marginBottom: "20px", width: "100%" }}>
                        <Form.Label><strong>Nickname:</strong></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Change 및 Reset 버튼을 한 줄에 배치 */}
                    <div style={{ marginBottom: "20px", width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Button onClick={handleNicknameChange} style={{ width: "48%" }} disabled={!isSimulationStable}>Change</Button>
                        <Button onClick={handleResetNickname} style={{ width: "48%" }} disabled={!isSimulationStable}>Reset</Button>
                    </div>

                    {/* Reset All Nicknames 버튼 */}
                    <div style={{ marginBottom: "20px", width: "100%" }}>
                        <Button onClick={handleResetAllNicknames} style={{ width: "100%" }} disabled={!isSimulationStable}>Reset All Nicknames</Button>
                    </div>
                </div>
            )}
        </div>
    )
};