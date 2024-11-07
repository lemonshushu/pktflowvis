import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Toggle from 'react-toggle';
import "react-toggle/style.css";

export default function ControlPanel(props) {
    const packets = useSelector((state) => state.data.packets);
    const hostData = useSelector((state) => state.graphView.hostGraphData);
    const portData = useSelector((state) => state.graphView.portGraphData);
    const nicknameMapping = useSelector((state) => state.controlPanel.nicknameMapping);
    const mode = useSelector((state) => state.graphView.mode);

    const dispatch = useDispatch();


    return (
        packets && (
            <div style={{ position: 'absolute', top: 70, right: 40, width: "300px", padding: "20px", borderRadius: "15px", border: "1px solid #ccc", backgroundColor: "#fff", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
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
                    <Button onClick={resetAllNodes} style={{ width: "100%" }} disabled={!isSimulationStable}>Reset All Positions</Button>
                </div>

                
            </div>    
        )
    )
}