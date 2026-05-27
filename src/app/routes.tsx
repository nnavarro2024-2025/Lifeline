import { createBrowserRouter } from "react-router";
import { StudentChat } from "./components/StudentChat";
import { CounselorDashboard } from "./components/CounselorDashboard";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/student",
    element: (
      <ProtectedRoute allowedRole="student">
        <StudentChat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/counselor",
    element: (
      <ProtectedRoute allowedRole="counselor">
        <CounselorDashboard />
      </ProtectedRoute>
    ),
  },
]);
