import GraphView from '../graphView/GraphView';
import TimelineView from '../timelineView/TimelineView';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setShowInfo } from '../timelineView/timelineViewSlice';
import { ArrowExport20Regular } from '@fluentui/react-icons';
import './MultiView.css';

export default function MultiView() {
    const dispatch = useDispatch();
    const currentView = useSelector((state) => state.data.currentView);
    const showInfo = useSelector((state) => state.timelineView.showInfo);
    const selectedPacket = useSelector((state) => state.timelineView.selectedPacket);

    switch (currentView) {
        case 'fileUpload':
            return <Navigate to="/" />;
        case 'multi':
            return (
                <div>
                    <div style={{ position: "fixed", width: "100vw", height: "100vh", left: 0, top: 0, "z-index": -5}}>
                        <GraphView />
                    </div>
                    <div style={{ "margin-top": "60px", position: "absolute", width: "50vw", left: "50vw" }}>
                        <TimelineView />
                    </div>
                    {showInfo && (
                        <div className='info-box'>
                            <div className='info-content'>
                                <button onClick={() => {dispatch(setShowInfo(false));}} className='info-top'>
                                    <ArrowExport20Regular />
                                    <b>Details</b>
                                </button>
                                <div>
                                    <p>Line Info 1</p>
                                    <p>_index: {selectedPacket._index}</p>
                                    <p>eth.dst: {selectedPacket._source.layers.eth["eth.dst"]}</p>
                                    <p>eth.src: {selectedPacket._source.layers.eth["eth.src"]}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        default:
            break;
    }

}