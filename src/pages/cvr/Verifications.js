import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { demandesService } from '../../services/demandesService';
import { validationsService } from '../../services/validationsService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const getStatusColor = (status) => {
  const colors = {
    AVIS_DGR_FAVORABLE: 'success',
    EN_VERIFICATION_CVR: 'warning',
    VALIDEE_CVR: 'success',
    REJETEE_CVR: 'error',
  };
  return colors[status] || 'default';
};

export default function CVRVerifications() {
  const { success, error, warning } = useToast();
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    decision: 'VALIDE',
    commentaire: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        // Récupérer les demandes et les validations
        const [demandesRes, validationsRes] = await Promise.all([
          demandesService.getAll(),
          validationsService.getAll(),
        ]);
        
        // Filtrer les demandes qui sont en attente de vérification CVR
        const demandesEnAttente = demandesRes.data.filter(
          (d) =>
            d.statut === 'AVIS_DGR_FAVORABLE' ||
            d.statut === 'EN_VERIFICATION_CVR'
        );
        
        // Filtrer pour ne garder que celles qui n'ont pas encore de validation CVR
        const validationsCVR = validationsRes.data.filter(
          (v) => v.validateurRole && String(v.validateurRole).toUpperCase() === 'CVR'
        );
        
        const demandesAVerifier = demandesEnAttente.filter((demande) => {
          // Vérifier si une validation CVR existe déjà pour cette demande
          const aDejaValidationCVR = validationsCVR.some(
            (v) => String(v.demandeId?._id || v.demandeId) === String(demande._id)
          );
          return !aDejaValidationCVR;
        });
        
        setDemandes(demandesAVerifier);
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleValidation = async () => {
    if (!formData.commentaire.trim()) {
      warning('Le commentaire est obligatoire');
      return;
    }
    
    if (!selectedDemande || !selectedDemande._id) {
      error('Erreur : demande non sélectionnée');
      return;
    }
    
    const demandeId = selectedDemande._id; // Sauvegarder l'ID avant de réinitialiser
    
    try {
      // Créer la validation
      await validationsService.create({
        demandeId: demandeId,
        decision: formData.decision,
        commentaire: formData.commentaire,
        validateurRole: 'CVR', // Spécifier explicitement le rôle
      });
      
      // Réinitialiser l'état AVANT de recharger
      setOpen(false);
      setFormData({ decision: 'VALIDE', commentaire: '' });
      setSelectedDemande(null);
      
      // Recharger les demandes
      try {
        const [demandesRes, validationsRes] = await Promise.all([
          demandesService.getAll(),
          validationsService.getAll(),
        ]);
        
        // Filtrer les demandes qui sont en attente de vérification CVR
        const demandesEnAttente = demandesRes.data.filter(
          (d) =>
            d.statut === 'AVIS_DGR_FAVORABLE' ||
            d.statut === 'EN_VERIFICATION_CVR'
        );
        
        // Filtrer pour ne garder que celles qui n'ont pas encore de validation CVR
        const validationsCVR = validationsRes.data.filter(
          (v) => v.validateurRole && String(v.validateurRole).toUpperCase() === 'CVR'
        );
        
        const demandesAVerifier = demandesEnAttente.filter((demande) => {
          // Vérifier si une validation CVR existe déjà pour cette demande
          const aDejaValidationCVR = validationsCVR.some(
            (v) => String(v.demandeId?._id || v.demandeId) === String(demande._id)
          );
          return !aDejaValidationCVR;
        });
        
        setDemandes(demandesAVerifier);
      } catch (reloadError) {
        console.error('Erreur lors du rechargement:', reloadError);
        // La validation est déjà créée, donc on peut juste afficher un message
        success('La validation a été enregistrée avec succès');
      }
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur inconnue';
      error(`Erreur lors de la validation: ${errorMessage}`);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Vérifications administratives
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell>Nouveau poste</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {demandes.map((demande) => {
              // Gérer les cas où les données peuvent être populées ou non
              const agentInfo = demande.agentId || demande.informationsAgent;
              const agentNomComplet = `${agentInfo?.nom || ''} ${agentInfo?.prenom || ''}`.trim();
              const agentMatricule = agentInfo?.matricule || null;
              
              const poste = demande.posteSouhaiteId;
              const posteLibelle = typeof poste === 'object' && poste !== null
                ? poste.intitule
                : '-';
              
              return (
                <TableRow key={demande._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{agentNomComplet || '-'}</Typography>
                    {agentMatricule && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Matricule: {agentMatricule}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{demande.motif || '-'}</TableCell>
                  <TableCell>
                    {posteLibelle}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={demande.statut}
                      color={getStatusColor(demande.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/cvr/demandes/${demande._id}`)}
                      >
                        Voir
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setSelectedDemande(demande);
                          setOpen(true);
                        }}
                      >
                        Vérifier
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          setFormData({ decision: 'VALIDE', commentaire: '' });
          setSelectedDemande(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Vérification administrative</DialogTitle>
        <DialogContent>
          {selectedDemande && (() => {
            const agentInfo = selectedDemande.agentId || selectedDemande.informationsAgent;
            const agentNomComplet = `${agentInfo?.nom || ''} ${agentInfo?.prenom || ''}`.trim();
            const agentMatricule = agentInfo?.matricule || null;
            
            return (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Agent:</strong> {agentNomComplet || '-'}
                </Typography>
                {agentMatricule && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Matricule:</strong> {agentMatricule}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Motif:</strong> {selectedDemande.motif || '-'}
                </Typography>
              </Box>
            );
          })()}
          <TextField
            fullWidth
            select
            label="Décision"
            value={formData.decision}
            onChange={(e) =>
              setFormData({ ...formData, decision: e.target.value })
            }
            sx={{ mb: 2 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="VALIDE">Valider</option>
            <option value="REJETE">Rejeter</option>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Commentaire (obligatoire)"
            value={formData.commentaire}
            onChange={(e) =>
              setFormData({ ...formData, commentaire: e.target.value })
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpen(false);
              setFormData({ decision: 'VALIDE', commentaire: '' });
              setSelectedDemande(null);
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleValidation}
            variant="contained"
            disabled={!formData.commentaire.trim() || !selectedDemande}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
