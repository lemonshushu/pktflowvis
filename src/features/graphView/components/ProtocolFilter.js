import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsShowProtocolsOpen, setShowL4Protocol, setShowL7Protocol, toggleL4Protocol, toggleL7Protocol, setFilteringMode } from './controlPanelSlice';
import "./ControlPanel.css"
import { Form } from 'react-bootstrap';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

import FormCheckLabel from 'react-bootstrap/FormCheckLabel'

export default function ProtocolFilter() {
    const mode = useSelector((state) => state.graphView.mode);
    const isShowProtocolsOpen = useSelector((state) => state.controlPanel.isShowProtocolsOpen);
    const showL4Protocol = useSelector((state) => state.controlPanel.showL4Protocol);
    const showL7Protocol = useSelector((state) => state.controlPanel.showL7Protocol);

    // 모든 프로토콜 목록 가져오기
    const allL4Protocols = useSelector((state) => state.controlPanel.L4Protocols);
    const allL7Protocols = useSelector((state) => state.controlPanel.L7Protocols);

    // 선택된 프로토콜 상태 가져오기 (매핑)
    const selectedL4Protocols = useSelector((state) => state.controlPanel.selectedL4Protocols);
    const selectedL7Protocols = useSelector((state) => state.controlPanel.selectedL7Protocols);
    const filteringMode = useSelector((state) => state.controlPanel.filteringMode);
    const dispatch = useDispatch(); 

    const [value, setValue] = useState(1);

  const handleChange = (val) => {dispatch(setFilteringMode(val))};

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
                    <ToggleButtonGroup
                        style={{marginBottom: "10px"}}
                        type="radio"
                        name="options"
                        value={filteringMode}
                        onChange={handleChange}
                        className="d-flex w-100 toggle-button-group"
                    >
                        <ToggleButton
                            id="tbg-radio-1"
                            value="or"
                            className="flex-fill"
                            variant="outline-primary"
                            style={{
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0",
                            }}
                        >
                            OR
                        </ToggleButton>
                        <ToggleButton
                            id="tbg-radio-2"
                            value="and"
                            className="flex-fill"
                            variant="outline-primary"
                            style={{
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0",
                            }}
                        >
                            AND
                        </ToggleButton>
                    </ToggleButtonGroup>

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
                            {allL4Protocols.map((protocol, index) => (
                                <div key={`l4-${protocol}-${index}`} className='toggle-container'>
                                    <FormCheckLabel htmlFor={`l4-protocol-${protocol}`} className='toggle-label'>
                                        {protocol}
                                    </FormCheckLabel>
                                    <Form.Check
                                        type='switch'
                                        id={`l4-protocol-${protocol}`}
                                        checked={selectedL4Protocols[protocol]}
                                        onChange={() => dispatch(toggleL4Protocol(protocol))}
                                    />
                                </div>
                            ))}
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
                            {allL7Protocols.map((protocol, index) => (
                                <div key={`l7-${protocol}-${index}`} className='toggle-container'> {/*style={{ paddingBottom: "10px" }} */}
                                    <FormCheckLabel htmlFor={`l7-protocol-${protocol}`} className='toggle-label'>
                                        {protocol}
                                    </FormCheckLabel>
                                    <Form.Check
                                        type='switch'
                                        id={`l7-protocol-${protocol}`}
                                        checked={selectedL7Protocols[protocol]}
                                        onChange={() => dispatch(toggleL7Protocol(protocol))}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>)
    )
}