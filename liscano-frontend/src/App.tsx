import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { RouteProtegee } from './components/layout/RouteProtegee';

import PageAccueil from './pages/PageAccueil';
import PageConnexion from './pages/auth/PageConnexion';
import PageInscriptionClient from './pages/auth/PageInscriptionClient';
import PageInscriptionMecanicien from './pages/auth/PageInscriptionMecanicien';

import LayoutClient from './pages/client/LayoutClient';
import PageRechercheClient from './pages/client/PageRechercheClient';
import PageMesDemandesClient from './pages/client/PageMesDemandesClient';
import PageDetailDemandeClient from './pages/client/PageDetailDemandeClient';

import LayoutMecanicien from './pages/mecanicien/LayoutMecanicien';
import PageTableauDeBordMecanicien from './pages/mecanicien/PageTableauDeBordMecanicien';
import PageDemandesMecanicien from './pages/mecanicien/PageDemandesMecanicien';
import PageDetailDemandeMecanicien from './pages/mecanicien/PageDetailDemandeMecanicien';
import PageProfilMecanicien from './pages/mecanicien/PageProfilMecanicien';

import LayoutAdmin from './pages/admin/LayoutAdmin';
import PageTableauDeBordAdmin from './pages/admin/PageTableauDeBordAdmin';
import PageUtilisateursAdmin from './pages/admin/PageUtilisateursAdmin';
import PageDemandesAdmin from './pages/admin/PageDemandesAdmin';
import PageSpecialitesAdmin from './pages/admin/PageSpecialitesAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PageAccueil />} />
          <Route path="/connexion" element={<PageConnexion />} />
          <Route path="/inscription/client" element={<PageInscriptionClient />} />
          <Route path="/inscription/mecanicien" element={<PageInscriptionMecanicien />} />

          <Route
            path="/client"
            element={
              <RouteProtegee rolesAutorises={['CLIENT']}>
                <LayoutClient />
              </RouteProtegee>
            }
          >
            <Route index element={<Navigate to="recherche" replace />} />
            <Route path="recherche" element={<PageRechercheClient />} />
            <Route path="demandes" element={<PageMesDemandesClient />} />
            <Route path="demandes/:id" element={<PageDetailDemandeClient />} />
          </Route>

          <Route
            path="/mecanicien"
            element={
              <RouteProtegee rolesAutorises={['MECANICIEN']}>
                <LayoutMecanicien />
              </RouteProtegee>
            }
          >
            <Route index element={<Navigate to="tableau-de-bord" replace />} />
            <Route path="tableau-de-bord" element={<PageTableauDeBordMecanicien />} />
            <Route path="demandes" element={<PageDemandesMecanicien />} />
            <Route path="demandes/:id" element={<PageDetailDemandeMecanicien />} />
            <Route path="profil" element={<PageProfilMecanicien />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RouteProtegee rolesAutorises={['ADMINISTRATEUR']}>
                <LayoutAdmin />
              </RouteProtegee>
            }
          >
            <Route index element={<PageTableauDeBordAdmin />} />
            <Route path="utilisateurs" element={<PageUtilisateursAdmin />} />
            <Route path="demandes" element={<PageDemandesAdmin />} />
            <Route path="specialites" element={<PageSpecialitesAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
