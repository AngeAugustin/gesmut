import React, { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { notificationsService } from '../../services/notificationsService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ActionButton from '../../components/common/ActionButton';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsService.getMesNotifications();
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.lue).length);
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.marquerCommeLue(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, lue: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsService.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error('Erreur', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.marquerToutesCommeLues();
      setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur', error);
    }
  };

  const columns = [
    {
      id: 'lu',
      label: 'Statut',
      render: (value) => (
        <Chip
          label={value ? 'Lu' : 'Non lu'}
          color={value ? 'default' : 'primary'}
          size="small"
        />
      ),
    },
    {
      id: 'titre',
      label: 'Titre',
      render: (value, row) => (
        <Box sx={{ fontWeight: row.lue ? 400 : 600 }}>{value}</Box>
      ),
    },
    {
      id: 'message',
      label: 'Message',
      render: (value) => (
        <Box
          sx={{
            maxWidth: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={value}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: (value) => <StatusChip status={value} label={value} />,
    },
    {
      id: 'date',
      label: 'Date',
      render: (value) => new Date(value).toLocaleString('fr-FR'),
    },
  ];

  const actions = (row) => {
    const actionsList = [];
    if (!row.lue) {
      actionsList.push({
        icon: <CheckCircleIcon />,
        tooltip: 'Marquer comme lu',
        color: 'success',
        onClick: () => handleMarkAsRead(row._id),
      });
    }
    actionsList.push({
      icon: <DeleteIcon />,
      tooltip: 'Supprimer',
      color: 'error',
      onClick: () => handleDelete(row._id),
    });
    return actionsList;
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} notification(s) non lue(s)`}
        action={
          unreadCount > 0 && (
            <ActionButton
              variant="outlined"
              onClick={handleMarkAllAsRead}
            >
              Tout marquer comme lu
            </ActionButton>
          )
        }
      />
      <DataTable
        columns={columns}
        rows={notifications.map((n) => ({
          id: n._id,
          lu: n.lue,
          titre: n.titre,
          message: n.message,
          type: n.type,
          date: n.createdAt,
          ...n,
        }))}
        actions={actions}
        emptyMessage="Aucune notification"
      />
    </Box>
  );
}

