import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import FileUpload from '../features/fileUpload/FileUpload';
import MultiView from '../features/multiView/MultiView';
import './App.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <FileUpload />,
    },
    {
        path: "/vis",
        element: <MultiView />,
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
