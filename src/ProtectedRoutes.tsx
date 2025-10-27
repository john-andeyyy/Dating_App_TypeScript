import type { ReactElement } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoutes = (): ReactElement => {
    const { user } = useAuth();
    const auth = user;

    return auth ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoutes;
