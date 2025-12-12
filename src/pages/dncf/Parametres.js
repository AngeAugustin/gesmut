import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageHeader from '../../components/common/PageHeader';
import { uploadService } from '../../services/uploadService';
import { usersService } from '../../services/usersService';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function DNCFParametres() {
  const { user } = useAuth();
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [cachetFile, setCachetFile] = useState(null);
  const [cachetPreview, setCachetPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await usersService.getById(user.id);
        setUserData(response.data);
        // Charger les prévisualisations si les fichiers existent
        if (response.data.signatureImageId) {
          const fileUrl = uploadService.getFileUrl(response.data.signatureImageId);
          setSignaturePreview(fileUrl);
        }
        if (response.data.cachetImageId) {
          const fileUrl = uploadService.getFileUrl(response.data.cachetImageId);
          setCachetPreview(fileUrl);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données utilisateur:', err);
      }
    };
    if (user?.id) {
      fetchUserData();
    }
  }, [user]);

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type MIME
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      
      if (!allowedMimeTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
        setError('Le fichier de signature doit être au format JPG, JPEG ou PNG');
        return;
      }
      if (file.size > 3145728) {
        setError('Le fichier de signature ne doit pas dépasser 3 Mo');
        return;
      }
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleCachetChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type MIME
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      
      if (!allowedMimeTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
        setError('Le fichier de cachet doit être au format JPG, JPEG ou PNG');
        return;
      }
      if (file.size > 3145728) {
        setError('Le fichier de cachet ne doit pas dépasser 3 Mo');
        return;
      }
      setCachetFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCachetPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSaveSignature = async () => {
    if (!signatureFile) {
      setError('Veuillez sélectionner un fichier de signature');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const uploadRes = await uploadService.uploadImage(signatureFile);
      await usersService.update(user.id, {
        signatureImageId: uploadRes.fileId,
      });
      setSuccess('Signature enregistrée avec succès');
      setSignatureFile(null);
      const response = await usersService.getById(user.id);
      setUserData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la signature');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCachet = async () => {
    if (!cachetFile) {
      setError('Veuillez sélectionner un fichier de cachet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const uploadRes = await uploadService.uploadImage(cachetFile);
      await usersService.update(user.id, {
        cachetImageId: uploadRes.fileId,
      });
      setSuccess('Cachet enregistré avec succès');
      setCachetFile(null);
      const response = await usersService.getById(user.id);
      setUserData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du cachet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Paramètres DNCF"
        subtitle="Gérez votre signature et votre cachet pour la génération automatique des documents"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Signature */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Signature
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Uploadez votre signature. Elle sera utilisée automatiquement lors de la génération des documents.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Formats acceptés : JPG, JPEG, PNG uniquement (Taille maximale : 3 Mo)
              </Typography>

              <Box sx={{ mb: 2 }}>
                {signaturePreview ? (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      minHeight: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={signaturePreview}
                      alt="Signature"
                      style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                    />
                  </Paper>
                ) : (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      minHeight: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Aucune signature enregistrée
                    </Typography>
                  </Paper>
                )}
              </Box>

              <input
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                style={{ display: 'none' }}
                id="signature-upload"
                type="file"
                onChange={handleSignatureChange}
              />
              <label htmlFor="signature-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {signatureFile ? 'Changer la signature' : 'Sélectionner une signature'}
                </Button>
              </label>

              {signatureFile && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSaveSignature}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer la signature'}
                </Button>
              )}

              {userData?.signatureImageId && !signatureFile && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Signature enregistrée et active
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Cachet */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cachet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Uploadez votre cachet. Il sera utilisé automatiquement lors de la génération des documents.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Formats acceptés : JPG, JPEG, PNG uniquement (Taille maximale : 3 Mo)
              </Typography>

              <Box sx={{ mb: 2 }}>
                {cachetPreview ? (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      minHeight: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={cachetPreview}
                      alt="Cachet"
                      style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                    />
                  </Paper>
                ) : (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      minHeight: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Aucun cachet enregistré
                    </Typography>
                  </Paper>
                )}
              </Box>

              <input
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                style={{ display: 'none' }}
                id="cachet-upload"
                type="file"
                onChange={handleCachetChange}
              />
              <label htmlFor="cachet-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {cachetFile ? 'Changer le cachet' : 'Sélectionner un cachet'}
                </Button>
              </label>

              {cachetFile && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSaveCachet}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer le cachet'}
                </Button>
              )}

              {userData?.cachetImageId && !cachetFile && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Cachet enregistré et actif
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

