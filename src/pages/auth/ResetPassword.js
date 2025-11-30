import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      // Si pas d'email dans le state, rediriger vers forgot-password
      navigate('/auth/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(email, code, newPassword);
      setSuccess('Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Reset Password Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-16 relative">
        {/* Logos - Fixed at top */}
        <div className="absolute top-8 left-0 right-0 px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between">
            <img src="/mef.png" alt="MEF" className="h-10 object-contain" />
            <img src="/dncf.jpg" alt="DNCF" className="h-10 object-contain" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-4 mt-24">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Réinitialiser le mot de passe</h1>
          <p className="text-gray-600 text-sm">
            Entrez le code reçu par email et votre nouveau mot de passe
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-2 rounded text-xs">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-3 bg-green-50 border-l-4 border-green-500 text-green-700 p-2 rounded text-xs">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email (readonly) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Code de réinitialisation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all text-center text-lg tracking-widest font-mono"
              placeholder="000000"
              maxLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">Entrez le code à 6 chiffres reçu par email</p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-8 pr-9 text-sm py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                placeholder="Min. 6 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.906 5.236m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-8 pr-9 text-sm py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.906 5.236m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>

          {/* Back to Login Link */}
          <div className="text-center mt-3">
            <Link to="/auth/login" className="text-xs text-teal-700 hover:text-teal-800 font-semibold">
              Retour à la connexion
            </Link>
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
          <h2 className="text-3xl xl:text-4xl font-bold text-white mb-6 leading-tight">
            Sécurité renforcée
          </h2>
          <p className="text-white text-base xl:text-lg leading-relaxed mb-4">
            Votre code de réinitialisation est valide pendant 15 minutes. Assurez-vous de choisir un mot de passe fort et unique.
          </p>
        </div>
      </div>
    </div>
  );
}

