import React, { useState } from 'react';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setPcapFile } from './fileUploadSlice';
import { createOfflineSession } from '@audc/pcap';


const parsePcapFile = (file) => {
    const pcapSession = createOfflineSession(file);
    const packets = [];
    pcapSession.on('packet', (rawPacket) => {
        packets.push(rawPacket);
    });
    pcapSession.open();
    return packets;
};

export default function FileUpload() {
    const dispatch = useDispatch();
    const [ selectedFile, setSelectedFile ] = useState(null);

    const onSubmitClick = (selectedFile) => {
        if (selectedFile != null) {
            const parsedFile = parsePcapFile(selectedFile);
            dispatch(setPcapFile(parsedFile));
        }
        else alert('No file selected!');
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div><Form.Group controlId="formFile" className="mb-3" width="50%">
                <Form.Label column={true}>Upload your pcap file: </Form.Label>
                <Form.Control type="file" onChange={(e) => setSelectedFile(e.target.files[ 0 ])} />
            </Form.Group>
                <Button variant="primary" type="submit" onClick={() => onSubmitClick(selectedFile)}>Submit</Button>
            </div></div>
    );
}