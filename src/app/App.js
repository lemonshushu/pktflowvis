import './App.css';
import FileUpload from '../features/fileUpload/FileUpload';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

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
