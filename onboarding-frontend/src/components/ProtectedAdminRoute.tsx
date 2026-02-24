import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
interface Props {
children: React.ReactNode;
}
const ProtectedAdminRoute = ({ children }: Props) => {
const { isAuthenticated, isAdmin } = useAuth();
if (!isAuthenticated) return <Navigate to="/login" replace />;
if (!isAdmin) return <Navigate to="/dashboard" replace />;
return <>{children}</>;
};
export default ProtectedAdminRoute;