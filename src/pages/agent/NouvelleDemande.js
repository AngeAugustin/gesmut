import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { demandesService } from '../../services/demandesService';
import { postesService } from '../../services/postesService';
import { referentielsService } from '../../services/referentielsService';
import { uploadService } from '../../services/uploadService';
import { agentsService } from '../../services/agentsService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function NouvelleDemande() {
  const { user } = useAuth();
  const { warning } = useToast();
  const [agentInfo, setAgentInfo] = useState(null);
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    nomMariage: '',
    adresseVille: '',
    sexe: '',
    email: '',
    photo: null,
    photoPreview: null,
    conjoints: [],
    enfants: [],
    motif: '',
    posteSouhaiteId: '',
    localisationSouhaiteId: '',
    directionId: '',
    serviceId: '',
  });
  const [conjointForm, setConjointForm] = useState({ code: '', nom: '', prenom: '' });
  const [enfantForm, setEnfantForm] = useState({ code: '', nom: '', prenom: '' });
  const [postes, setPostes] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.agentId) {
          const agentRes = await agentsService.getById(user.agentId);
          if (agentRes.data) {
            setAgentInfo(agentRes.data);
            const serviceId = agentRes.data.serviceId?._id || agentRes.data.serviceId;
            const directionId = agentRes.data.serviceId?.directionId?._id || agentRes.data.serviceId?.directionId;
            setFormData((prev) => ({
              ...prev,
              matricule: agentRes.data.matricule || '',
              nom: agentRes.data.nom || '',
              prenom: agentRes.data.prenom || '',
              nomMariage: agentRes.data.nomMariage || '',
              adresseVille: agentRes.data.adresseVille || '',
              sexe: agentRes.data.sexe || '',
              conjoints: agentRes.data.conjoints || [],
              enfants: agentRes.data.enfants || [],
              photoPreview: agentRes.data.photo ? uploadService.getFile(agentRes.data.photo) : null,
              directionId: directionId || '',
              serviceId: serviceId || '',
            }));
          }
        }

        const [postesRes, localitesRes, directionsRes, servicesRes] = await Promise.all([
          postesService.getLibres(),
          referentielsService.getLocalites(),
          referentielsService.getDirections(),
          referentielsService.getServices(),
        ]);
        setPostes(postesRes.data);
        setLocalites(localitesRes.data);
        setDirections(directionsRes.data || []);
        setServices(servicesRes.data || []);
        console.log('Directions chargées:', directionsRes.data);
        console.log('Services chargés:', servicesRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
        console.error('Détails de l\'erreur:', error.response?.data || error.message);
        // Initialiser avec des tableaux vides en cas d'erreur
        setDirections([]);
        setServices([]);
      }
    };
    fetchData();
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 4);
    setFiles(selectedFiles);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3145728) {
        warning('La photo ne doit pas dépasser 3 Mo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: file,
          photoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddConjoint = () => {
    if (conjointForm.nom && conjointForm.prenom) {
      setFormData((prev) => ({
        ...prev,
        conjoints: [...prev.conjoints, { ...conjointForm }],
      }));
      setConjointForm({ code: '', nom: '', prenom: '' });
    }
  };

  const handleRemoveConjoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      conjoints: prev.conjoints.filter((_, i) => i !== index),
    }));
  };

  const handleAddEnfant = () => {
    if (enfantForm.nom && enfantForm.prenom) {
      setFormData((prev) => ({
        ...prev,
        enfants: [...prev.enfants, { ...enfantForm }],
      }));
      setEnfantForm({ code: '', nom: '', prenom: '' });
    }
  };

  const handleRemoveEnfant = (index) => {
    setFormData((prev) => ({
      ...prev,
      enfants: prev.enfants.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' Ko';
    return (bytes / 1048576).toFixed(2) + ' Mo';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.motif.trim()) {
        throw new Error('Le motif est obligatoire');
      }
      if (!formData.matricule || !formData.nom || !formData.prenom) {
        throw new Error('Les informations de base (matricule, nom, prénom) sont obligatoires');
      }
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Un email valide est obligatoire pour recevoir la décision finale');
      }
      if (!formData.directionId || !formData.serviceId) {
        throw new Error('La direction et le service sont obligatoires pour déterminer les responsables hiérarchiques');
      }

      let photoId = null;
      if (formData.photo) {
        const photoRes = await uploadService.uploadFile(formData.photo);
        photoId = photoRes.fileId;
      }

      const piecesJustificatives = [];
      for (const file of files) {
        if (file.size > 3145728) {
          throw new Error(`Le fichier ${file.name} dépasse 3 Mo`);
        }
        const uploadRes = await uploadService.uploadFile(file);
        piecesJustificatives.push({
          nom: file.name,
          type: file.type,
          taille: file.size,
          fichierId: uploadRes.fileId,
        });
      }

      if (user?.agentId && agentInfo) {
        await agentsService.update(user.agentId, {
          nomMariage: formData.nomMariage,
          adresseVille: formData.adresseVille,
          sexe: formData.sexe,
          photo: photoId || agentInfo.photo,
          conjoints: formData.conjoints,
          enfants: formData.enfants,
        });
      }

      await demandesService.create({
        motif: formData.motif,
        posteSouhaiteId: formData.posteSouhaiteId || undefined,
        localisationSouhaiteId: formData.localisationSouhaiteId || undefined,
        piecesJustificatives,
        informationsAgent: {
          matricule: formData.matricule,
          nom: formData.nom,
          prenom: formData.prenom,
          nomMariage: formData.nomMariage,
          adresseVille: formData.adresseVille,
          sexe: formData.sexe,
          email: formData.email,
          directionId: formData.directionId,
          serviceId: formData.serviceId,
          conjoints: formData.conjoints,
          enfants: formData.enfants,
        },
      });

      navigate('/agent/demandes');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '-16px -32px', padding: '32px' }} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nouvelle demande de mutation</h1>
          <p className="text-gray-600">Remplissez tous les champs requis pour votre demande</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Informations Agent */}
          <div className="card">
            <h2 className="section-title text-primary-700">Informations sur l'agent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Matricule <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.matricule}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    className="input-field"
                    placeholder="Entrez le matricule"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="input-field"
                    placeholder="Entrez le nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="input-field"
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de mariage
                  </label>
                  <input
                    type="text"
                    value={formData.nomMariage}
                    onChange={(e) => setFormData({ ...formData, nomMariage: e.target.value })}
                    className="input-field"
                    placeholder="Nom de mariage (optionnel)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse ville
                  </label>
                  <input
                    type="text"
                    value={formData.adresseVille}
                    onChange={(e) => setFormData({ ...formData, adresseVille: e.target.value })}
                    className="input-field"
                    placeholder="Adresse de la ville"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="votre.email@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Vous recevrez la décision finale à cette adresse</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sexe</label>
                  <select
                    value={formData.sexe}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Direction <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.directionId}
                    onChange={(e) => setFormData({ ...formData, directionId: e.target.value, serviceId: '' })}
                    className="input-field"
                  >
                    <option value="">Sélectionner une direction</option>
                    {(directions || []).map((direction) => (
                      <option key={direction._id} value={direction._id}>
                        {direction.libelle}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="input-field"
                    disabled={!formData.directionId}
                  >
                    <option value="">Sélectionner un service</option>
                    {(services || [])
                      .filter((service) => {
                        if (!formData.directionId) return false;
                        const serviceDirectionId = service.directionId?._id || service.directionId;
                        return serviceDirectionId === formData.directionId;
                      })
                      .map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.libelle}
                        </option>
                      ))}
                  </select>
                  {!formData.directionId && (
                    <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une direction</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-primary-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {formData.photoPreview ? (
                        <img src={formData.photoPreview} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <label className="btn-secondary cursor-pointer">
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                      Choisir une photo
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Conjoints */}
          <div className="card">
            <h2 className="section-title text-primary-700">Saisie des conjoints (es)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Code"
                value={conjointForm.code}
                onChange={(e) => setConjointForm({ ...conjointForm, code: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Nom *"
                value={conjointForm.nom}
                onChange={(e) => setConjointForm({ ...conjointForm, nom: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Prénom *"
                value={conjointForm.prenom}
                onChange={(e) => setConjointForm({ ...conjointForm, prenom: e.target.value })}
                className="input-field"
              />
              <button
                type="button"
                onClick={handleAddConjoint}
                disabled={!conjointForm.nom || !conjointForm.prenom}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Prénom</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-primary-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.conjoints.map((conjoint, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{conjoint.code || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{conjoint.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{conjoint.prenom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveConjoint(index)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.conjoints.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Aucun conjoint ajouté
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Enfants */}
          <div className="card">
            <h2 className="section-title text-primary-700">Saisie des enfants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Code"
                value={enfantForm.code}
                onChange={(e) => setEnfantForm({ ...enfantForm, code: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Nom *"
                value={enfantForm.nom}
                onChange={(e) => setEnfantForm({ ...enfantForm, nom: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Prénom *"
                value={enfantForm.prenom}
                onChange={(e) => setEnfantForm({ ...enfantForm, prenom: e.target.value })}
                className="input-field"
              />
              <button
                type="button"
                onClick={handleAddEnfant}
                disabled={!enfantForm.nom || !enfantForm.prenom}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Prénom</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-primary-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.enfants.map((enfant, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{enfant.code || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{enfant.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{enfant.prenom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveEnfant(index)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.enfants.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Aucun enfant ajouté
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Informations demande */}
          <div className="card">
            <h2 className="section-title text-primary-700">Informations de la demande</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motif de la demande <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="input-field"
                  placeholder="Décrivez les raisons de votre demande de mutation"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poste souhaité
                  </label>
                  <select
                    value={formData.posteSouhaiteId}
                    onChange={(e) => setFormData({ ...formData, posteSouhaiteId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Aucun</option>
                    {postes.map((poste) => (
                      <option key={poste._id} value={poste._id}>
                        {poste.intitule} - {poste.localisationId?.libelle}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Localisation souhaitée
                  </label>
                  <select
                    value={formData.localisationSouhaiteId}
                    onChange={(e) => setFormData({ ...formData, localisationSouhaiteId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Aucune</option>
                    {localites.map((localite) => (
                      <option key={localite._id} value={localite._id}>
                        {localite.libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Pièces justificatives */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Pièces justificatives (optionnel)</h2>
            <p className="text-sm text-gray-600 mb-4">Maximum 4 fichiers de 3 Mo chacun (PDF, Images, Excel, Word)</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
              onChange={handleFileChange}
              disabled={files.length >= 4}
              className="input-field"
            />
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/agent/demandes')}
              disabled={loading}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.motif.trim() || !formData.matricule || !formData.nom || !formData.prenom}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

