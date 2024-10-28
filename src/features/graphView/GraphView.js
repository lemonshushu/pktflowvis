import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function GraphView() {
    const packets = useSelector((state) => state.fileUpload.packets);
    const dispatch = useDispatch();
    return (
        packets ?
            <div>
                <h1>Graph View</h1>
            </div> : <Navigate to="/" />
    );
}