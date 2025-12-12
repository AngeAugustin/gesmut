import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getRoleRoute = (role) => {
  const routes = {
    AGENT: '/agent/dashboard',
    RESPONSABLE: '/responsable/dashboard',
    DGR: '/dgr/dashboard',
    CVR: '/cvr/dashboard',
    DNCF: '/dncf/dashboard',
    ADMIN: '/admin/dashboard',
  };
  return routes[role] || '/';
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      navigate(getRoleRoute(data.user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-16 relative">
        {/* Logos - Fixed at top */}
        <div className="absolute top-12 left-0 right-0 px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between">
            <img src="/mef.png" alt="MEF" className="h-12 object-contain" />
            <img src="/dncf.jpg" alt="DNCF" className="h-12 object-contain" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-6">
          <Link to="/" className="text-sm text-teal-700 hover:text-teal-800 font-medium mb-3 inline-block">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue !</h1>
          <p className="text-gray-600 text-base">
            Connectez-vous pour accéder à votre tableau de bord et continuer la gestion de vos mutations.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                placeholder="Entrez votre email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">Mot de passe</label>
              <Link
                to="/auth/forgot-password"
                className="text-xs text-teal-700 hover:text-teal-800 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-16 text-sm py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                placeholder="Entrez votre mot de passe"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.906 5.236m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-5 text-sm rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          {/* Links */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/auth/register" className="text-teal-700 hover:text-teal-800 font-semibold">
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Right Column - Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 flex-col justify-between p-8 xl:p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-12">
          {/* Headline */}
          <h2 className="text-3xl xl:text-4xl font-bold text-white mb-6 leading-tight">
            Révolutionnez la gestion des mutations avec GESMUT
          </h2>

          {/* Testimonial */}
          <div className="mb-6">
            <div className="mb-3">
              <svg className="w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>
            <p className="text-white text-base xl:text-lg leading-relaxed mb-4">
              "GESMUT a complètement transformé notre processus de gestion des mutations. C'est fiable, efficace et garantit que nos affectations sont toujours optimales."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-800 font-bold text-sm">
                MC
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Marie Kouassi</p>
                <p className="text-teal-200 text-xs">Responsable RH à la DNCF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content */}
        <div className="relative z-10">
          <div className="mb-4">
            <div className="h-px bg-white opacity-30 mb-3"></div>
            <p className="text-white text-center text-xs font-semibold tracking-wider mb-4">SYSTÈME DE GESTION DES MUTATIONS</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xs opacity-90">
              Plateforme officielle pour la gestion et le suivi des mutations au sein de la DNCF
            </p>
          </div>
          <div className="text-center mt-6">
            <p className="text-white text-xs opacity-75">
              Copyright © 2025 DNCF. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
