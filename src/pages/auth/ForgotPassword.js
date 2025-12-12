import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess('Si cet email existe dans notre système, un code de réinitialisation vous a été envoyé.');
      // Rediriger vers la page de réinitialisation après 2 secondes
      setTimeout(() => {
        navigate('/auth/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Forgot Password Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-16 relative">
        {/* Logos - Fixed at top */}
        <div className="absolute top-12 left-0 right-0 px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between">
            <img src="/mef.png" alt="MEF" className="h-12 object-contain" />
            <img src="/dncf.jpg" alt="DNCF" className="h-12 object-contain" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-4 mt-24">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</h1>
          <p className="text-gray-600 text-sm">
            Entrez votre adresse email pour recevoir un code de réinitialisation
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

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                placeholder="Entrez votre email"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le code'}
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
            Réinitialisation sécurisée
          </h2>
          <p className="text-white text-base xl:text-lg leading-relaxed mb-4">
            Un code de réinitialisation vous sera envoyé par email. Ce code est valide pendant 15 minutes uniquement.
          </p>
        </div>
      </div>
    </div>
  );
}

