import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsShowProtocolsOpen, setShowL4Protocol, setShowL7Protocol } from './controlPanelSlice';
import "./ControlPanel.css"
import { Form } from 'react-bootstrap';
import FormCheckLabel from 'react-bootstrap/FormCheckLabel'

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
                // onClick={() => dispatch(setIsShowProtocolsOpen(isShowProtocolsOpen))}
            >
                <FormCheckLabel htmlFor='show-protocols-toggle' style={{ fontWeight: 'bold' }}>Filter Protocols</FormCheckLabel>
                <Form.Check
                    type='switch'
                    id='show-protocols-toggle'
                    checked={isShowProtocolsOpen}
                    onChange={(e) => dispatch(setIsShowProtocolsOpen(e.target.checked))}
                />
            </div>

            {/* Show Protocols 메뉴 아이템 */}
            {isShowProtocolsOpen && (
                <div className='submenu-container'>
                    <div 
                        className='menubar'
                        onClick={() => dispatch(setShowL4Protocol(!showL4Protocol))}
                    >
                        <strong>L4 Protocols</strong>
                        <span>{showL4Protocol ? "▼" : "◀"}</span>
                    </div>
                    {/* L4 Protocol 메뉴 */}
                    {showL4Protocol && (
                        <div className='submenu-container'>  
                            {/* style={{ borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}> */}
                            <div className='toggle-container'>
                                <FormCheckLabel htmlFor='l4-protocol-toggle' className='toggle-label'>Show L4 Protocol</FormCheckLabel>
                                <Form.Check
                                    type='switch'
                                    id='l4-protocol-toggle'
                                    checked={showL4Protocol}
                                    onChange={(e) => dispatch(setShowL4Protocol(e.target.checked))}
                                />
                            </div>
                        </div>
                    )}
                    <hr style={{ margin: "10px 0", borderTop: "1px dashed" }} />
                    <div 
                        className='menubar'
                        // style={{ marginBottom: '0px' }}
                        onClick={() => dispatch(setShowL7Protocol(!showL7Protocol))}
                    >
                        <strong>L7 Protocols</strong>
                        <span>{showL7Protocol ? "▼" : "◀"}</span>
                    </div>
                    {/* L7 Protocol 메뉴 */}
                    {showL7Protocol && (
                        <div className='submenu-container'>
                            <div className='toggle-container'> {/*style={{ paddingBottom: "10px" }} */}
                                <FormCheckLabel htmlFor='l7-protocol-toggle' className='toggle-label'>
                                    Show L7 Protocol
                                </FormCheckLabel>
                                <Form.Check
                                    type='switch'
                                    id='l7-protocol-toggle'
                                    checked={showL7Protocol}
                                    onChange={(e) => dispatch(setShowL7Protocol(e.target.checked))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>)
    )
}