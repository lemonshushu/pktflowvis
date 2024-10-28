import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import FileUpload from '../features/fileUpload/FileUpload';
import './App.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <FileUpload />,
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
