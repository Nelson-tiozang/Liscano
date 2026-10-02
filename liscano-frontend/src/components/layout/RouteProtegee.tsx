import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { Spinner } from '../ui/Primitives';

export function RouteProtegee({ rolesAutorises, children }: { rolesAutorises: Role[]; children: ReactNode }) {
  const { connecte, role, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  if (!connecte) {
    return <Navigate to="/connexion" replace />;
  }

  if (role && !rolesAutorises.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
