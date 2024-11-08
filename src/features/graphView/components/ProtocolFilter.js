import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsShowProtocolsOpen, setShowL4Protocol, setShowL7Protocol } from './controlPanelSlice';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import "./ControlPanel.css"
import { Button } from 'react-bootstrap';

export default function ProtocolFilter() {
    const mode = useSelector((state) => state.graphView.mode);
    const isShowProtocolsOpen = useSelector((state) => state.controlPanel.isShowProtocolsOpen);
    const showL4Protocol = useSelector((state) => state.controlPanel.showL4Protocol);
    const showL7Protocol = useSelector((state) => state.controlPanel.showL7Protocol);

    const dispatch = useDispatch(); 

    return (
        mode === 'port' && (
        <div>
            <div 
                className='menubar'
                onClick={() => dispatch(setIsShowProtocolsOpen(isShowProtocolsOpen))}
            >
                <label htmlFor='show-protocols-toggle' style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                    Filter Protocols
                </label>
                <Toggle
                    id='show-protocols-toggle'
                    checked={isShowProtocolsOpen}
                    onChange={(e) => dispatch(setIsShowProtocolsOpen(e.target.checked))}
                />
            </div>

            {/* Show Protocols 메뉴 아이템 */}
            {isShowProtocolsOpen && (
                 <div style={{ 
                    border: '1px solid #ccc', 
                    borderRadius: '8px', 
                    padding: '10px', 
                    backgroundColor: '#f9f9f9' 
                }}>
                    <div 
                        className='menubar'
                        onClick={() => dispatch(setShowL4Protocol(!showL4Protocol))}
                    >
                        <strong>L4 Protocols</strong>
                        <span>{showL4Protocol ? "▼" : "◀"}</span>
                    </div>
                    {/* L4 Protocol 메뉴 */}
                    {showL4Protocol && (
                        <div className='toggle-container' style={{ borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}>
                            <label htmlFor='l4-protocol-toggle' className='toggle-label'>
                                Show L4 Protocol
                            </label>
                            <Toggle
                                id='l4-protocol-toggle'
                                checked={showL4Protocol}
                                onChange={(e) => dispatch(setShowL4Protocol(e.target.checked))}
                            />
                        </div>
                    )}
                    <div 
                        className='menubar'
                        onClick={() => dispatch(setShowL7Protocol(!showL7Protocol))}
                    >
                        <strong>L7 Protocols</strong>
                        <span>{showL7Protocol ? "▼" : "◀"}</span>
                    </div>
                    {/* L7 Protocol 메뉴 */}
                    {showL7Protocol && (
                        <div className='toggle-container'> {/*style={{ paddingBottom: "10px" }} */}
                            <label htmlFor='l7-protocol-toggle' className='toggle-label'>
                                Show L7 Protocol
                            </label>
                            <Toggle
                                id='l7-protocol-toggle'
                                checked={showL7Protocol}
                                onChange={(e) => dispatch(setShowL7Protocol(e.target.checked))}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>)
    )
}