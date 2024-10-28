import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setData } from './fileUploadSlice';


const parseJson = (file) => {
    let parsedFile = null;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            parsedFile = JSON.parse(e.target.result);
        } catch (e) {
            alert('Error parsing JSON file!');
        }
    };
    reader.readAsText(file);
    return parsedFile;
};

export default function FileUpload() {
    const dispatch = useDispatch();
    const [ selectedFile, setSelectedFile ] = useState(null);

    const onSubmitClick = (selectedFile) => {
        if (selectedFile != null) {
            const parsedFile = parseJson(selectedFile);
            dispatch(setData(parsedFile));
        }
        else alert('No file selected!');
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