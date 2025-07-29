import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../components/Layout/Layout";
import Dashboard from "../components/Dashboard/Dashboard";

const router = createBrowserRouter([
    {
        path: "/",
        element: <AdminLayout />
        ,
        children: [
            {
                path: "",
                element: <Dashboard />,
            },
        ],
    },
]);

export default router;
