import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { premiumTheme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Pages publiques
import Home from './pages/public/Home';
import Demande from './pages/public/Demande';
import Suivi from './pages/public/Suivi';
// Pages communes
import DetailDemande from './pages/common/DetailDemande';

// Pages Responsable
import ResponsableDashboard from './pages/responsable/Dashboard';
import Validations from './pages/responsable/Validations';
import Historique from './pages/responsable/Historique';

// Pages DGR
import DGRDashboard from './pages/dgr/Dashboard';
import DGRDemandes from './pages/dgr/Demandes';
import DGRHistorique from './pages/dgr/Historique';
import DGRAgents from './pages/dgr/Agents';
import DetailAgent from './pages/dgr/DetailAgent';
import DGRPostes from './pages/dgr/Postes';
import DetailPoste from './pages/dgr/DetailPoste';
import DGRRapports from './pages/dgr/Rapports';

// Pages CVR
import CVRDashboard from './pages/cvr/Dashboard';
import CVRVerifications from './pages/cvr/Verifications';
import CVRHistorique from './pages/cvr/Historique';

// Pages DNCF
import DNCFDashboard from './pages/dncf/Dashboard';
import DNCFDecisions from './pages/dncf/Decisions';
import DNCFHistorique from './pages/dncf/Historique';
import DNCFMutationsStrategiques from './pages/dncf/MutationsStrategiques';
import DNCFParametres from './pages/dncf/Parametres';

// Pages Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUtilisateurs from './pages/admin/Utilisateurs';
import AdminReferentiels from './pages/admin/Referentiels';
import AdminWorkflow from './pages/admin/Workflow';
import AdminDemandes from './pages/admin/Demandes';
import AdminAudit from './pages/admin/Audit';
import TestDocuments from './pages/admin/TestDocuments';

// Pages Notifications
import Notifications from './pages/notifications/Notifications';

function App() {
  return (
    <ThemeProvider theme={premiumTheme}>
      <CssBaseline />
      <AuthProvider>
        <ToastProvider>
          <Router>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/demande" element={<Demande />} />
            <Route path="/suivi" element={<Suivi />} />
            
            {/* Routes authentification (pour les autres rôles) */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Route Notifications (accessible à tous les rôles authentifiés) */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['AGENT', 'RESPONSABLE', 'DGR', 'CVR', 'DNCF', 'ADMIN']}>
                  <MainLayout>
                    <Notifications />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Routes Responsable */}
            <Route
              path="/responsable/*"
              element={
                <ProtectedRoute allowedRoles={['RESPONSABLE']}>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<ResponsableDashboard />} />
                      <Route path="validations" element={<Validations />} />
                      <Route path="demandes/:id" element={<DetailDemande />} />
                      <Route path="historique" element={<Historique />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

                  {/* Routes DGR */}
                  <Route
                    path="/dgr/*"
                    element={
                      <ProtectedRoute allowedRoles={['DGR']}>
                        <MainLayout>
                          <Routes>
                            <Route path="dashboard" element={<DGRDashboard />} />
                            <Route path="demandes" element={<DGRDemandes />} />
                            <Route path="historique" element={<DGRHistorique />} />
                            <Route path="demandes/:id" element={<DetailDemande />} />
                            <Route path="agents" element={<DGRAgents />} />
                            <Route path="agents/:id" element={<DetailAgent />} />
                            <Route path="postes" element={<DGRPostes />} />
                            <Route path="postes/:id" element={<DetailPoste />} />
                            <Route path="rapports" element={<DGRRapports />} />
                          </Routes>
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />

            {/* Routes CVR */}
            <Route
              path="/cvr/*"
              element={
                <ProtectedRoute allowedRoles={['CVR']}>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<CVRDashboard />} />
                      <Route path="verifications" element={<CVRVerifications />} />
                      <Route path="historique" element={<CVRHistorique />} />
                      <Route path="demandes/:id" element={<DetailDemande />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Routes DNCF */}
            <Route
              path="/dncf/*"
              element={
                <ProtectedRoute allowedRoles={['DNCF']}>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<DNCFDashboard />} />
                      <Route path="decisions" element={<DNCFDecisions />} />
                      <Route path="historique" element={<DNCFHistorique />} />
                      <Route path="demandes/:id" element={<DetailDemande />} />
                      <Route path="mutations-strategiques" element={<DNCFMutationsStrategiques />} />
                      <Route path="parametres" element={<DNCFParametres />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Routes Admin */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="demandes" element={<AdminDemandes />} />
                      <Route path="demandes/:id" element={<DetailDemande />} />
                      <Route path="agents" element={<DGRAgents />} />
                      <Route path="agents/:id" element={<DetailAgent />} />
                      <Route path="postes" element={<DGRPostes />} />
                      <Route path="postes/:id" element={<DetailPoste />} />
                      <Route path="rapports" element={<DGRRapports />} />
                      <Route path="utilisateurs" element={<AdminUtilisateurs />} />
                      <Route path="referentiels" element={<AdminReferentiels />} />
                      <Route path="workflow" element={<AdminWorkflow />} />
                      <Route path="audit" element={<AdminAudit />} />
                      <Route path="test-documents" element={<TestDocuments />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

