import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMode } from '../graphViewSlice';
import { setNicknameMapping, resetNicknameMapping, setIsNicknameChangeOpen, setIsSimulationStable, setIsShowProtocolsOpen, setShowL4Protocol, setShowL7Protocol } from './controlPanelSlice';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { Button, Form} from 'react-bootstrap';

export default function ControlPanel(props) {
    const packets = useSelector((state) => state.data.packets);
    const hostData = useSelector((state) => state.graphView.hostGraphData);
    const portData = useSelector((state) => state.graphView.portGraphData);
    // const nicknameMapping = useSelector((state) => state.controlPanel.nicknameMapping);
    const mode = useSelector((state) => state.graphView.mode);

    const isSimulationStable = useSelector((state) => state.controlPanel.isSimulationStable);
    const isNicknameChangeOpen = useSelector((state) => state.controlPanel.isNicknameChangeOpen);
    const isShowProtocolsOpen = useSelector((state) => state.controlPanel.isShowProtocolsOpen);
    const showL4Protocol = useSelector((state) => state.controlPanel.showL4Protocol);
    const showL7Protocol = useSelector((state) => state.controlPanel.showL7Protocol);

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
        dispatch(resetNicknameMapping());
    };    

    return (
        packets && (
            <div style={{ position: 'absolute', top: 70, left: 40, width: "300px", padding: "20px", borderRadius: "15px", border: "1px solid #ccc", backgroundColor: "#fff", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
                 {/* Port 분리 토글 버튼 */}
                 <div style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>                        
                    <Toggle
                        id='split-toggle'
                        defaultChecked={mode === 'port'}
                        onChange={(e) => dispatch(setMode(e.target.checked ? 'port' : 'host'))}
                    />
                    <label htmlFor='split-toggle' style={{ marginLeft: '10px',  lineHeight: '0'}}>Split Hosts by Ports</label>
                </div>

                {/* 모든 위치 초기화 버튼 */}
                <div style={{ marginBottom: "20px", width: "100%" }}>
                    <Button onClick={props.resetAllNodes} style={{ width: "100%" }} disabled={!isSimulationStable}>Reset All Positions</Button>
                </div>

                {/* 구분선 */}
                <hr style={{ margin: "20px 0" }} />
                
                {/* Nickname Change 메뉴 */}
                <div>
                    <div 
                        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
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

                {/* 구분선 */}
                <hr style={{ margin: "20px 0" }} />

                {/* Show Protocols 메뉴바 */}
                { mode === 'port' && (
                <div>
                    <div 
                        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
                        onClick={() => dispatch(setIsShowProtocolsOpen(isShowProtocolsOpen))}
                    >
                        <strong>Show Protocols</strong>
                        <span>{isShowProtocolsOpen ? "▼" : "◀"}</span>
                    </div>

                    {/* Show Protocols 메뉴 아이템 */}
                    {isShowProtocolsOpen && (
                        <div>
                            <div 
                                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
                                onClick={() => dispatch(setShowL4Protocol(!showL4Protocol))}
                            >
                                <strong>L4 Protocols</strong>
                                <span>{showL4Protocol ? "▼" : "◀"}</span>
                            </div>
                            {/* L4 Protocol 메뉴 */}
                            {showL4Protocol && (
                                <div style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}>
                                {/* <div style={{ marginBottom: "20px", width: "100%" }}> */}
                                    <Toggle
                                        id='l4-protocol-toggle'
                                        checked={showL4Protocol}
                                        onChange={(e) => dispatch(setShowL4Protocol(e.target.checked))}
                                    />
                                    <label htmlFor='l4-protocol-toggle' style={{ marginLeft: '10px', lineHeight: '0' }}>Show L4 Protocol</label>
                                </div>
                            )}
                            <div 
                                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
                                onClick={() => dispatch(setShowL7Protocol(!showL7Protocol))}
                            >
                                <strong>L7 Protocols</strong>
                                <span>{showL7Protocol ? "▼" : "◀"}</span>
                            </div>
                            {/* L7 Protocol 메뉴 */}
                            {showL7Protocol && (
                                <div style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px",paddingBottom: "10px" }}>
                                    <Toggle
                                        id='l7-protocol-toggle'
                                        checked={showL7Protocol}
                                        onChange={(e) => dispatch(setShowL7Protocol(e.target.checked))}
                                    />
                                    <label htmlFor='l7-protocol-toggle' style={{ marginLeft: '10px', lineHeight: '0' }}>Show L7 Protocol</label>
                                </div>
                            )}
                        </div>
                    )}
                </div>)}

                {/* 구분선 */}
                {mode === 'port' && (
                    <hr style={{ margin: "20px 0" }} />
                )}

            </div>    
        )
    )
}