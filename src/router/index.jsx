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
import PerfumeDetails from "../components/ManagePerfum/PerfumeDetails";
import EditPerfume from "../components/ManagePerfum/EditPerfume";
import AddPerfume from "../components/ManagePerfum/AddPerfume";
import ManageBadge from "../pages/ManageBadge";
import ManageRanks from "../pages/ManageRanks";
import ManageNotes from "../pages/ManageNotes";
import ManagePerfumers from "../pages/ManagePerfumers";
import Settings from "../pages/Settings";
import LevelCategories from "../pages/LevelCategories";
import LevelQuizzes from "../pages/LevelQuizzes";
import LevelQuestions from "../pages/LevelQuestions";
import ManageFAQ from "../pages/ManageFAQ";
import ManageFeedback from "../pages/ManageFeedback";
import ManageBrands from "../pages/ManageBrands";
import AddBrand from "../components/ManageBrand/AddBrand";
import BrandDetails from "../components/ManageBrand/BrandDetails";
import ManageReviews from "../pages/ManageReviews";
import EditReview from "../components/ManageReview/EditReview";

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
                path: "brands",
                element: <ManageBrands />,
            },
            {
                path: "brands/add",
                element: <AddBrand />,
            },
            {
                path: "brands/:id",
                element: <BrandDetails />,
            },
            {
                path: "brands/:id/edit",
                element: <AddBrand />,
            },
            {
                path: "perfumes/:id",
                element: <PerfumeDetails />,
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
            // {
            //     path: "rank",
            //     element: <ManageRanks />,
            // },
            {
                path: "setting",
                element: <Settings />,
            },
            {
                path: "level-quiz",
                element: <LevelCategories />,
            },
            {
                path: "level-quiz/:categoryId/quizzes",
                element: <LevelQuizzes />,
            },
            {
                path: "level-quiz/:categoryId/quizzes/:quizId/questions",
                element: <LevelQuestions />,
            },
            {
                path: '/faq',
                element: <ManageFAQ />
            },
            {
                path: '/feedback',
                element: <ManageFeedback />
            },
            {
                path: '/reviews',
                element: <ManageReviews />
            },
            {
                path: '/reviews/:id/edit',
                element: <EditReview />
            }
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default router;
