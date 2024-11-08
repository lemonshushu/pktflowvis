import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMode } from '../graphViewSlice';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import "./ControlPanel.css"
import { Button } from 'react-bootstrap';
import NicknameChange from './NicknameChange';
import ProtocolFilter from './ProtocolFilter';

export default function ControlPanel(props) {
    const packets = useSelector((state) => state.data.packets);
    const mode = useSelector((state) => state.graphView.mode);
    const isSimulationStable = useSelector((state) => state.controlPanel.isSimulationStable);

    const dispatch = useDispatch(); 

    return (
        packets && (
            <div style={{ position: 'absolute', top: 70, left: 40, width: "300px", padding: "20px", borderRadius: "15px", border: "1px solid #ccc", backgroundColor: "#fff", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
                 {/* Port 분리 토글 버튼 */}
                 <div className = "toggle-container">                        
                    <Toggle
                        id='split-toggle'
                        defaultChecked={mode === 'port'}
                        onChange={(e) => dispatch(setMode(e.target.checked ? 'port' : 'host'))}
                    />
                    <label htmlFor='split-toggle' className='toggle-label'>Split Hosts by Ports</label>
                </div>

                {/* 모든 위치 초기화 버튼 */}
                <div style={{ marginBottom: "20px", width: "100%" }}>
                    <Button onClick={props.resetAllNodes} style={{ width: "100%" }} disabled={!isSimulationStable}>Reset All Positions</Button>
                </div>

                {/* 구분선 */}
                <hr style={{ margin: "20px 0" }} />
                
                <NicknameChange/>

                {/* 구분선 */}
                <hr style={{ margin: "20px 0" }} />

                <ProtocolFilter/>

                {/* 구분선 */}
                {mode === 'port' && (
                    <hr style={{ margin: "20px 0" }} />
                )}

            </div>    
        )
    )
}