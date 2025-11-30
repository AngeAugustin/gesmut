import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { referentielsService } from '../../services/referentielsService';
import { postesService } from '../../services/postesService';
import { useToast } from '../../context/ToastContext';

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

const roles = [
  { value: 'RESPONSABLE', label: 'Responsable Hiérarchique' },
  { value: 'DGR', label: 'DGR' },
  { value: 'CVR', label: 'CVR' },
  { value: 'DNCF', label: 'DNCF' },
  { value: 'ADMIN', label: 'Administrateur' },
];

export default function Register() {
  const { success, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'RESPONSABLE',
    agentId: '',
    directionId: '',
    serviceId: '',
    gradeId: '',
    posteId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [grades, setGrades] = useState([]);
  const [postes, setPostes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [directionsRes, servicesRes, gradesRes, postesRes] = await Promise.all([
          referentielsService.getDirections(),
          referentielsService.getServices(),
          referentielsService.getGrades(),
          postesService.getAll(),
        ]);
        setDirections(directionsRes.data || []);
        setServices(servicesRes.data || []);
        setGrades(gradesRes.data || []);
        setPostes(postesRes.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
      }
    };
    fetchData();
  }, []);

  // Filtrer les services par direction sélectionnée
  const filteredServices = formData.directionId
    ? services.filter((s) => {
        const serviceDirectionId = typeof s.directionId === 'object' ? s.directionId._id : s.directionId;
        return serviceDirectionId === formData.directionId;
      })
    : services;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validation de l'étape 1
  const validateStep1 = () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.password || !formData.role) {
      return false;
    }
    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }
    // Validation mot de passe (minimum 6 caractères)
    if (formData.password.length < 6) {
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (currentStep === 1 && validateStep1()) {
      setError('');
      setCurrentStep(2);
    } else if (currentStep === 1) {
      setError('Veuillez remplir tous les champs obligatoires de l\'étape 1 correctement.');
    }
  };

  const handlePrevious = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNext(e);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const dataToSend = { ...formData };
      // Nettoyer les champs vides
      if (dataToSend.role !== 'AGENT' || !dataToSend.agentId) {
        delete dataToSend.agentId;
      }
      if (!dataToSend.directionId) delete dataToSend.directionId;
      if (!dataToSend.serviceId) delete dataToSend.serviceId;
      if (!dataToSend.gradeId) delete dataToSend.gradeId;
      if (!dataToSend.posteId) delete dataToSend.posteId;
      const data = await authService.register(dataToSend);
      if (data.access_token) {
        // Compte activé immédiatement (créé par admin)
        navigate(getRoleRoute(data.user.role));
      } else if (data.message) {
        // Compte créé mais en attente de validation
        success(data.message);
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Register Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-16 overflow-y-auto relative">
        {/* Logos - Fixed at top */}
        <div className="absolute top-8 left-0 right-0 px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between">
            <img src="/mef.png" alt="MEF" className="h-10 object-contain" />
            <img src="/dncf.jpg" alt="DNCF" className="h-10 object-contain" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-4 mt-24">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h1>
          <p className="text-gray-600 text-sm">
            Inscrivez-vous pour accéder à la plateforme de gestion des mutations.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-2 rounded text-xs">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className={`flex items-center flex-shrink-0 ${currentStep >= 1 ? 'text-teal-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                currentStep >= 1 ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="ml-1.5 text-xs font-medium whitespace-nowrap hidden sm:inline">Informations personnelles</span>
              <span className="ml-1.5 text-xs font-medium whitespace-nowrap sm:hidden">Personnelles</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-3 flex-shrink ${currentStep >= 2 ? 'bg-teal-700' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center flex-shrink-0 ${currentStep >= 2 ? 'text-teal-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                currentStep >= 2 ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-1.5 text-xs font-medium whitespace-nowrap hidden sm:inline">Informations professionnelles</span>
              <span className="ml-1.5 text-xs font-medium whitespace-nowrap sm:hidden">Professionnelles</span>
            </div>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Informations personnelles */}
          {currentStep === 1 && (
            <div className="space-y-3">
              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez votre nom"
                />
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez votre prénom"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                    placeholder="Entrez votre email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rôle <span className="text-red-500">*</span></label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all bg-white"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Informations professionnelles */}
          {currentStep === 2 && (
            <div className="space-y-3">
              {/* Direction */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Direction (optionnel)</label>
                <select
                  name="directionId"
                  value={formData.directionId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Sélectionnez une direction</option>
                  {directions.map((direction) => (
                    <option key={direction._id} value={direction._id}>
                      {direction.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Service (optionnel)</label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  disabled={!formData.directionId}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionnez un service</option>
                  {filteredServices.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.libelle}
                    </option>
                  ))}
                </select>
                {!formData.directionId && (
                  <p className="mt-0.5 text-xs text-gray-500">Veuillez d'abord sélectionner une direction</p>
                )}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Grade (optionnel)</label>
                <select
                  name="gradeId"
                  value={formData.gradeId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Sélectionnez un grade</option>
                  {grades.map((grade) => (
                    <option key={grade._id} value={grade._id}>
                      {grade.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Poste */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Poste (optionnel)</label>
                <select
                  name="posteId"
                  value={formData.posteId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Sélectionnez un poste</option>
                  {postes.map((poste) => (
                    <option key={poste._id} value={poste._id}>
                      {poste.intitule}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agent ID (conditional) */}
              {formData.role === 'AGENT' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ID Agent (optionnel)
                  </label>
                  <input
                    type="text"
                    name="agentId"
                    value={formData.agentId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                    placeholder="Entrez votre ID agent"
                  />
                  <p className="mt-0.5 text-xs text-gray-500">Si vous êtes un agent, entrez votre ID agent</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2 mt-4">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 text-sm rounded-lg transition-all duration-200"
              >
                Précédent
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`${currentStep === 2 ? 'flex-1' : 'w-full'} bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Inscription...' : currentStep === 1 ? 'Suivant' : "S'inscrire"}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/auth/login" className="text-teal-700 hover:text-teal-800 font-semibold">
                Se connecter
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
            Simplifiez la gestion des mutations avec GESMUT
          </h2>

          {/* Testimonial */}
          <div className="mb-6">
            <div className="mb-3">
              <svg className="w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>
            <p className="text-white text-base xl:text-lg leading-relaxed mb-4">
              "Avec GESMUT, nous avons réduit le temps de traitement des mutations de 70%. La plateforme est intuitive et répond parfaitement à nos besoins administratifs."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-800 font-bold text-sm">
                AK
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Amadou Koffi</p>
                <p className="text-teal-200 text-xs">Directeur des Ressources Humaines</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1.5">⚡</div>
              <p className="text-white font-semibold text-xs">Traitement rapide</p>
              <p className="text-teal-200 text-xs mt-0.5">Automatisation complète</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1.5">🔒</div>
              <p className="text-white font-semibold text-xs">Sécurisé</p>
              <p className="text-teal-200 text-xs mt-0.5">Données protégées</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1.5">📊</div>
              <p className="text-white font-semibold text-xs">Rapports détaillés</p>
              <p className="text-teal-200 text-xs mt-0.5">Analyses complètes</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1.5">✅</div>
              <p className="text-white font-semibold text-xs">Workflow optimisé</p>
              <p className="text-teal-200 text-xs mt-0.5">Processus fluide</p>
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
