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
  MenuItem,
  Alert,
} from '@mui/material';
import { demandesService } from '../../services/demandesService';
import { validationsService } from '../../services/validationsService';
import { documentsService } from '../../services/documentsService';
import { emailService } from '../../services/emailService';
import { uploadService } from '../../services/uploadService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';

const getStatusColor = (status) => {
  const colors = {
    VALIDEE_CVR: 'success',
    EN_ETUDE_DNCF: 'warning',
    ACCEPTEE: 'success',
    REJETEE: 'error',
  };
  return colors[status] || 'default';
};

export default function DNCFDecisions() {
  const { success, error, warning } = useToast();
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    decision: 'ACCEPTEE',
    commentaire: '',
    dateMutation: '',
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
        
        // Filtrer les demandes qui sont en attente de décision DNCF ou déjà décidées
        const demandesFiltrees = demandesRes.data.filter(
          (d) =>
            d.statut === 'VALIDEE_CVR' ||
            d.statut === 'EN_ETUDE_DNCF' ||
            d.statut === 'ACCEPTEE' ||
            d.statut === 'REJETEE'
        );
        
        // Filtrer les validations DNCF
        const validationsDNCF = validationsRes.data.filter(
          (v) => v.validateurRole && String(v.validateurRole).toUpperCase() === 'DNCF'
        );
        
        // Ajouter un flag pour indiquer si une validation DNCF existe déjà
        // Filtrer pour ne garder que les demandes qui n'ont pas encore été décidées
        const demandesAvecValidation = demandesFiltrees
          .map((demande) => {
            const aDejaValidationDNCF = validationsDNCF.some(
              (v) => String(v.demandeId?._id || v.demandeId) === String(demande._id)
            );
            return {
              ...demande,
              aDejaValidationDNCF,
            };
          })
          .filter((demande) => !demande.aDejaValidationDNCF); // Ne garder que celles sans validation DNCF
        
        setDemandes(demandesAvecValidation);
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDecision = async () => {
    if (!formData.commentaire.trim()) {
      warning('Le commentaire est obligatoire');
      return;
    }
    
    if (!selectedDemande || !selectedDemande._id) {
      error('Erreur : demande non sélectionnée');
      return;
    }
    
    const demandeId = selectedDemande._id; // Sauvegarder l'ID avant de réinitialiser
    const demandeData = { ...selectedDemande }; // Sauvegarder les données de la demande
    
    try {
      // Créer la validation d'abord
      const validationData = {
        demandeId: demandeId,
        decision: formData.decision === 'ACCEPTEE' ? 'VALIDE' : 'REJETE',
        commentaire: formData.commentaire,
        validateurRole: 'DNCF', // Spécifier explicitement le rôle
      };

      // Si la décision est acceptée et qu'une date de mutation est fournie, l'ajouter
      if (formData.decision === 'ACCEPTEE' && formData.dateMutation) {
        validationData.dateMutation = new Date(formData.dateMutation);
      }

      await validationsService.create(validationData);

      if (formData.decision === 'ACCEPTEE') {
        // Générer les 3 documents, les sauvegarder et les envoyer par email
        try {
          const documentTypes = ['ORDRE_MUTATION', 'LETTRE_NOTIFICATION', 'ATTESTATION_ADMINISTRATIVE'];
          const documents = [];
          
          // Générer et sauvegarder chaque document
          for (const docType of documentTypes) {
            try {
              // Générer le PDF (retourne un blob)
              const response = await documentsService.generateDocument(docType, demandeId);
              const blob = response.data;
              
              // Créer un fichier pour l'upload directement depuis le blob
              const file = new File([blob], `${docType}.pdf`, { type: 'application/pdf' });
              
              // Uploader le fichier
              const uploadRes = await uploadService.uploadFile(file);
              console.log(`Document ${docType} uploadé avec fileId:`, uploadRes.fileId);
              
              // Créer le document dans la base de données avec le fichierId
              try {
                const createdDoc = await documentsService.create({
                  type: docType,
                  demandeId: demandeId,
                  format: 'PDF',
                  data: {
                    demande: demandeData,
                    date: new Date(),
                  },
                  fichierId: uploadRes.fileId,
                });
                console.log(`Document ${docType} créé dans la base de données:`, createdDoc);
              } catch (createError) {
                console.error(`Erreur lors de la création du document ${docType}:`, createError);
                console.error('Détails de l\'erreur:', createError.response?.data);
                // Continuer quand même pour ne pas bloquer les autres documents
              }
              
              // Garder le blob pour l'envoi par email
              documents.push({
                name: `${docType}.pdf`,
                data: blob,
              });
            } catch (docError) {
              console.error(`Erreur lors de la génération du document ${docType}:`, docError);
            }
          }

          // Envoyer les documents par email si l'email est disponible
          const agentEmail = demandeData.informationsAgent?.email || (demandeData.agentId?.email);
          const agentName = demandeData.informationsAgent 
            ? `${demandeData.informationsAgent.nom} ${demandeData.informationsAgent.prenom}`
            : (demandeData.agentId ? `${demandeData.agentId.nom} ${demandeData.agentId.prenom}` : 'Agent');
          
          console.log('Email de l\'agent:', agentEmail);
          console.log('Nombre de documents à envoyer:', documents.length);
          console.log('Données de la demande:', {
            informationsAgent: demandeData.informationsAgent,
            agentId: demandeData.agentId
          });
          
          if (agentEmail && documents.length > 0) {
            try {
              console.log('Tentative d\'envoi de l\'email...');
              const emailResult = await emailService.sendDecisionDocuments({
                agentEmail,
                agentName,
                decision: 'ACCEPTEE',
                documents,
              });
              console.log('Email envoyé avec succès:', emailResult);
              success(`Les documents ont été générés, sauvegardés et envoyés par email à ${agentEmail}`);
            } catch (emailError) {
              console.error('Erreur détaillée lors de l\'envoi de l\'email:', emailError);
              console.error('Réponse d\'erreur:', emailError.response?.data);
              warning(`Les documents ont été générés et sauvegardés, mais l'envoi par email a échoué: ${emailError.response?.data?.message || emailError.message}`);
            }
          } else if (documents.length > 0) {
            console.warn('Aucun email disponible. Email:', agentEmail, 'Documents:', documents.length);
            success(`Les documents ont été générés et sauvegardés. ${!agentEmail ? 'Aucun email disponible pour l\'envoi automatique.' : 'Erreur lors de la préparation de l\'envoi.'}`);
          }
        } catch (docError) {
          console.error('Erreur lors de la génération des documents:', docError);
          warning('La décision a été enregistrée, mais une erreur est survenue lors de la génération des documents. Vous pourrez les générer plus tard.');
        }
        
        // Fermer le dialog et recharger
        setOpen(false);
        setFormData({ decision: 'ACCEPTEE', commentaire: '', dateMutation: '' });
        setSelectedDemande(null);
        
        // Recharger les demandes
        try {
          const [demandesRes, validationsRes] = await Promise.all([
            demandesService.getAll(),
            validationsService.getAll(),
          ]);
          
          const demandesFiltrees = demandesRes.data.filter(
            (d) =>
              d.statut === 'VALIDEE_CVR' ||
              d.statut === 'EN_ETUDE_DNCF' ||
              d.statut === 'ACCEPTEE' ||
              d.statut === 'REJETEE'
          );
          
          const validationsDNCF = validationsRes.data.filter(
            (v) => v.validateurRole && String(v.validateurRole).toUpperCase() === 'DNCF'
          );
          
          const demandesAvecValidation = demandesFiltrees
            .map((demande) => {
              const aDejaValidationDNCF = validationsDNCF.some(
                (v) => String(v.demandeId?._id || v.demandeId) === String(demande._id)
              );
              return {
                ...demande,
                aDejaValidationDNCF,
              };
            })
            .filter((demande) => !demande.aDejaValidationDNCF);
          
          setDemandes(demandesAvecValidation);
        } catch (reloadError) {
          console.error('Erreur lors du rechargement:', reloadError);
        }
      } else {
        // Si rejet, réinitialiser complètement et recharger
        setOpen(false);
        setFormData({ decision: 'ACCEPTEE', commentaire: '', dateMutation: '' });
        setSelectedDemande(null);
        
        // Recharger avec la même logique
        try {
          const [demandesRes, validationsRes] = await Promise.all([
            demandesService.getAll(),
            validationsService.getAll(),
          ]);
          
          const demandesFiltrees = demandesRes.data.filter(
            (d) =>
              d.statut === 'VALIDEE_CVR' ||
              d.statut === 'EN_ETUDE_DNCF' ||
              d.statut === 'ACCEPTEE' ||
              d.statut === 'REJETEE'
          );
          
          const validationsDNCF = validationsRes.data.filter(
            (v) => v.validateurRole && String(v.validateurRole).toUpperCase() === 'DNCF'
          );
          
          const demandesAvecValidation = demandesFiltrees
            .map((demande) => {
              const aDejaValidationDNCF = validationsDNCF.some(
                (v) => String(v.demandeId?._id || v.demandeId) === String(demande._id)
              );
              return {
                ...demande,
                aDejaValidationDNCF,
              };
            })
            .filter((demande) => !demande.aDejaValidationDNCF); // Ne garder que celles sans validation DNCF
          
          setDemandes(demandesAvecValidation);
        } catch (reloadError) {
          console.error('Erreur lors du rechargement:', reloadError);
          // La validation est déjà créée, donc on peut juste afficher un message
          success('La décision a été enregistrée avec succès');
        }
      }
      success(formData.decision === 'ACCEPTEE' ? 'Demande acceptée avec succès' : 'Demande rejetée');
    } catch (err) {
      console.error('Erreur lors de la prise de décision:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur inconnue';
      error(`Erreur lors de la prise de décision: ${errorMessage}`);
    }
  };


  return (
    <Box>
      <PageHeader
        title="Décisions à prendre"
        subtitle="Examinez et prenez une décision sur les demandes de mutation validées par la CVR"
      />
      {demandes.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune demande en attente de décision
        </Alert>
      ) : (
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
                        onClick={() => navigate(`/dncf/demandes/${demande._id}`)}
                      >
                        Voir
                      </Button>
                      {!demande.aDejaValidationDNCF && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedDemande(demande);
                            setOpen(true);
                          }}
                        >
                          Décider
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          setFormData({ decision: 'ACCEPTEE', commentaire: '', dateMutation: '' });
          setSelectedDemande(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Décision finale</DialogTitle>
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
          >
            <MenuItem value="ACCEPTEE">Accepter</MenuItem>
            <MenuItem value="REJETEE">Rejeter</MenuItem>
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
            sx={{ mb: 2 }}
          />
          {formData.decision === 'ACCEPTEE' && (
            <TextField
              fullWidth
              type="date"
              label="Date de mutation (optionnel)"
              value={formData.dateMutation}
              onChange={(e) =>
                setFormData({ ...formData, dateMutation: e.target.value })
              }
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Si une date est spécifiée, la mutation sera appliquée automatiquement à cette date. Si aucune date n'est spécifiée, la mutation sera appliquée immédiatement."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpen(false);
              setFormData({ decision: 'ACCEPTEE', commentaire: '' });
              setSelectedDemande(null);
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDecision}
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
