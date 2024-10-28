import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function GraphView() {
    const packets = useSelector((state) => state.data.packets);
    const graphRef = useRef(null);

    const graphWidth = 928;
    const graphHeight = 600;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const dispatch = useDispatch();

    useEffect(() => {
        // Refer to: https://observablehq.com/@d3/force-directed-graph/2

    }, [packets]);


    
    return (
        packets ?
            <svg ref={graphRef} /> : <Navigate to="/" />
    );
}