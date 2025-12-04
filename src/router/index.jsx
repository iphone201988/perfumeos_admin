import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../components/Layout/Layout";
import Dashboard from "../pages/Dashboard";
import ManageUsers from "../pages/ManageUsers";
import ManagePerfum from "../pages/ManagePerfum";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import ManageQuiz from "../pages/ManageQuiz";
import ManageArticle from "../pages/ManageArticle";
import UserDetails from "../components/ManageUsers/UserDetails";
import PerfumDetails from "../components/ManagePerfum/PerfumDetails";
import EditPerfume from "../components/ManagePerfum/EditPerfume";
import AddPerfume from "../components/ManagePerfum/AddPerfume";
import ManageBadge from "../pages/ManageBadge";
import ManageRanks from "../pages/ManageRanks";
import ManageNotes from "../pages/ManageNotes";
import ManagePerfumers from "../pages/ManagePerfumers";
import Settings from "../pages/Settings";
import ManageLevelQuiz from "../pages/ManageLevelQuiz";
import ManageFAQ from "../pages/ManageFAQ";
const hasToken = () => !!localStorage.getItem("token");
const router = createBrowserRouter([
    {
        path: "/login",
        element:
            <PublicRoute>
                <Login />
            </PublicRoute>,
    },
    {
        path: "/",
        element:
            <PrivateRoute>
                <AdminLayout />
            </PrivateRoute>,
        children: [
            {
                path: "",
                element: <Dashboard />,
            },
            {
                path: "dashboard",
                element: <Navigate to="/" />,
            },
            {
                path: "users",
                element: <ManageUsers />,
            },
            {
                path: "users/:id",
                element: <UserDetails />,
            },
            {
                path: "perfumes",
                element: <ManagePerfum />,
            },
            {
                path: "perfumes/:id",
                element: <PerfumDetails />,
            },
            {
                path: "perfumes/add",
                element: <AddPerfume />,
            },
            {
                path: "perfumes/:id/edit",
                element: <EditPerfume />,
            },
            {
                path: "notes",
                element: <ManageNotes />,
            },
            {
                path: "perfumers",
                element: <ManagePerfumers />,
            },
            {
                path: "quiz",
                element: <ManageQuiz />,
            },
            {
                path: "articles",
                element: <ManageArticle />,
            },
            {
                path: "badge",
                element: <ManageBadge />,
            },
            {
                path: "rank",
                element: <ManageRanks />,
            },
            {
                path: "setting",
                element: <Settings />,
            },
            {
                path: "level-quiz",
                element: <ManageLevelQuiz />,
            },
            {
                path: '/faq',
                element: <ManageFAQ />
            }
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default router;
