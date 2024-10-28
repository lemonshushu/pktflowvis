import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setPackets } from './fileUploadSlice';


const parseJson = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsedFile = JSON.parse(e.target.result);
                resolve(parsedFile);
            } catch (error) {
                alert('Error parsing JSON file!');
                reject(error);
            }
        };
        reader.readAsText(file);
    });
};


export default function FileUpload() {
    const dispatch = useDispatch();
    const [ selectedFile, setSelectedFile ] = useState(null);

    const onSubmitClick = async (selectedFile) => {
        if (selectedFile != null) {
            try {
                let parsedFile = await parseJson(selectedFile);

                // Filter out only TCP & UDP packets
                parsedFile = parsedFile.filter((packet) => packet._source.layers.ip && (packet._source.layers.tcp || packet._source.layers.udp));
                console.log(parsedFile);
                dispatch(setPackets(parsedFile));
            } catch (error) {
                console.error('Failed to parse the file', error);
            }
        } else {
            alert('No file selected!');
        }
    };


    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div><Form.Group controlId="formFile" className="mb-3" width="50%">
                <Form.Label column={true}>Upload your JSON file: </Form.Label>
                <Form.Control type="file" onChange={(e) => setSelectedFile(e.target.files[ 0 ])} />
            </Form.Group>
                <Button variant="primary" type="submit" onClick={() => onSubmitClick(selectedFile)}>Submit</Button>
            </div></div>
    );
}