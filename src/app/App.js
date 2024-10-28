import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import FileUpload from '../features/fileUpload/FileUpload';
import GraphView from '../features/graphView/GraphView';
import './App.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <FileUpload />,
    },
    {
        path: "/graph",
        element: <GraphView />,
    },
]);


function App() {
    return (
        <div className="App">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
