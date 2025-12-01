import React from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' Ko';
  return (bytes / 1048576).toFixed(2) + ' Mo';
};

export default function Step4PiecesJustificatives({ files, onFileChange, onRemoveFile }) {
  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Maximum 4 fichiers de 3 Mo chacun (PDF, Images, Excel, Word)
      </Typography>
      <Box sx={{ mb: 2 }}>
        <label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
            onChange={onFileChange}
            disabled={files.length >= 4}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            component="span"
            startIcon={<AttachFileIcon />}
            disabled={files.length >= 4}
            fullWidth
            sx={{ py: 2 }}
          >
            {files.length >= 4 ? 'Limite atteinte (4 fichiers max)' : 'Sélectionner des fichiers'}
          </Button>
        </label>
      </Box>

      {files.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 2 }}>
          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => onRemoveFile(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <AttachFileIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={file.name}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={formatFileSize(file.size)} size="small" variant="outlined" />
                      {file.size > 3145728 && (
                        <Chip label="Trop volumineux" size="small" color="error" />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
