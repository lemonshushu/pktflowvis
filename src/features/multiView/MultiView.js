import GraphView from '../graphView/GraphView';
import TimelineView from '../timelineView/TimelineView';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function MultiView() {
    const currentView = useSelector((state) => state.data.currentView);

    switch (currentView) {
        case 'fileUpload':
            return <Navigate to="/" />;
        case 'multi':
            return (
                <div>
                    <div style={{ position: "fixed", width: "50vw", height: "100vh", left: 0, top: 0 }}>
                        <GraphView />
                    </div>
                    <div style={{ "margin-top": "60px", position: "absolute", width: "50vw", left: "50vw" }}>
                        <TimelineView />
                    </div>
                </div>
            );
        default:
            break;
    }

}