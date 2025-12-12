import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import GavelIcon from '@mui/icons-material/Gavel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BookIcon from '@mui/icons-material/Book';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../../context/AuthContext';
import { notificationsService } from '../../services/notificationsService';

const drawerWidth = 280;
const drawerWidthCollapsed = 80;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: theme.palette.text.primary,
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})(({ theme, collapsed }) => ({
  width: collapsed ? drawerWidthCollapsed : drawerWidth,
  flexShrink: 0,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  '& .MuiDrawer-paper': {
    width: collapsed ? drawerWidthCollapsed : drawerWidth,
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`,
    borderTop: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    backgroundColor: '#FAFAFA',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    '&::before': {
      display: 'none',
    },
  },
}));

const LogoBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})(({ theme, collapsed }) => ({
  padding: theme.spacing(3),
  paddingTop: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'flex-start',
  gap: theme.spacing(1.5),
  borderTop: 'none',
  transition: theme.transitions.create(['padding', 'justify-content'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  '& .logo-text': {
    fontWeight: 700,
    fontSize: '1.5rem',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    opacity: collapsed ? 0 : 1,
    width: collapsed ? 0 : 'auto',
    overflow: 'hidden',
    transition: theme.transitions.create(['opacity', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  letterSpacing: '0.5px',
  padding: theme.spacing(1.5, 2, 0.5, 2),
  marginTop: theme.spacing(2),
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'collapsed' && prop !== 'selected',
})(({ theme, selected, collapsed }) => ({
  margin: collapsed ? theme.spacing(0.25, 0.5) : theme.spacing(0.25, 1.5),
  borderRadius: 8,
  minHeight: 40,
  justifyContent: collapsed ? 'center' : 'flex-start',
  transition: theme.transitions.create(['margin', 'justify-content', 'background-color'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  backgroundColor: selected ? `${theme.palette.primary.main}15` : 'transparent',
  '&.Mui-selected': {
    backgroundColor: `${theme.palette.primary.main}15`,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiListItemText-root': {
    opacity: collapsed ? 0 : 1,
    width: collapsed ? 0 : 'auto',
    overflow: 'hidden',
    transition: theme.transitions.create(['opacity', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
  },
  '& .MuiListItemIcon-root': {
    minWidth: collapsed ? 0 : 40,
    justifyContent: 'center',
    color: theme.palette.text.secondary,
    transition: theme.transitions.create('min-width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const getMenuSections = (role) => {
  const baseItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: `/${role.toLowerCase()}/dashboard` },
  ];

  switch (role) {
    case 'AGENT':
      return [
        {
          title: 'GESTION',
          items: [
            ...baseItems,
            { text: 'Mes demandes', icon: <DescriptionIcon />, path: '/agent/demandes' },
            { text: 'Nouvelle demande', icon: <NoteAddIcon />, path: '/agent/demandes/nouvelle' },
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
          ],
        },
      ];
    case 'RESPONSABLE':
      return [
        {
          title: 'VALIDATION',
          items: [
            ...baseItems,
            { text: 'Demandes à valider', icon: <CheckCircleIcon />, path: '/responsable/validations' },
            { text: 'Historique', icon: <HistoryIcon />, path: '/responsable/historique' },
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
          ],
        },
      ];
    case 'DGR':
      return [
        {
          title: 'GESTION',
          items: [
            ...baseItems,
            { text: 'Demandes à traiter', icon: <AssignmentIcon />, path: '/dgr/demandes' },
            { text: 'Historique', icon: <HistoryIcon />, path: '/dgr/historique' },
            { text: 'Agents', icon: <PeopleIcon />, path: '/dgr/agents' },
            { text: 'Postes', icon: <WorkIcon />, path: '/dgr/postes' },
            { text: 'Rapports', icon: <AssessmentIcon />, path: '/dgr/rapports' },
          ],
        },
      ];
    case 'CVR':
      return [
        {
          title: 'VÉRIFICATION',
          items: [
            ...baseItems,
            { text: 'Vérifications', icon: <FactCheckIcon />, path: '/cvr/verifications' },
            { text: 'Historique', icon: <HistoryIcon />, path: '/cvr/historique' },
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
          ],
        },
      ];
    case 'DNCF':
      return [
        {
          title: 'DÉCISION',
          items: [
            ...baseItems,
            { text: 'Décisions', icon: <GavelIcon />, path: '/dncf/decisions' },
            { text: 'Historique', icon: <HistoryIcon />, path: '/dncf/historique' },
            { text: 'Mutations stratégiques', icon: <SwapHorizIcon />, path: '/dncf/mutations-strategiques' },
            { text: 'Paramètres', icon: <SettingsIcon />, path: '/dncf/parametres' },
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
          ],
        },
      ];
    case 'ADMIN':
      return [
        {
          title: 'GESTION',
          items: [
            ...baseItems,
            { text: 'Demandes', icon: <AssignmentIcon />, path: '/admin/demandes' },
            { text: 'Agents', icon: <PeopleIcon />, path: '/admin/agents' },
            { text: 'Postes', icon: <WorkIcon />, path: '/admin/postes' },
            { text: 'Affectations', icon: <SwapHorizIcon />, path: '/admin/affectations' },
            { text: 'Rapports', icon: <AssessmentIcon />, path: '/admin/rapports' },
          ],
        },
        {
          title: 'SYSTÈME',
          items: [
            { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/utilisateurs' },
            { text: 'Référentiels', icon: <BookIcon />, path: '/admin/referentiels' },
            { text: 'Workflow', icon: <AccountTreeIcon />, path: '/admin/workflow' },
            { text: 'Audit', icon: <SecurityIcon />, path: '/admin/audit' },
            { text: 'Test documents', icon: <DescriptionIcon />, path: '/admin/test-documents' },
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
          ],
        },
      ];
    default:
      return [{ title: '', items: baseItems }];
  }
};

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsService.getMesNotifications();
        setNotifications(response.data.filter((n) => !n.lue));
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    setAnchorEl(null);
  };

  const menuSections = getMenuSections(user?.role);

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      borderTop: 'none', 
      pt: 0 
    }}>
      {/* Logo et bouton collapse */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        pb: 1.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            G
          </Box>
          {!sidebarCollapsed && (
            <Typography 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'primary.main',
              }}
            >
              GESMUT
            </Typography>
          )}
        </Box>
        {!sidebarCollapsed && (
          <IconButton
            onClick={handleSidebarToggle}
            size="small"
            sx={{
              color: 'text.secondary',
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Menu items avec sections */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {!sidebarCollapsed && section.title && (
              <SectionTitle>{section.title}</SectionTitle>
            )}
            <List sx={{ pt: 0, pb: 0 }}>
              {section.items.map((item) => {
                const isSelected = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <ListItem key={item.text} disablePadding>
                    <StyledListItemButton 
                      collapsed={sidebarCollapsed}
                      selected={isSelected}
                      className={isSelected ? 'Mui-selected' : ''}
                      onClick={() => navigate(item.path)}
                      title={sidebarCollapsed ? item.text : ''}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </StyledListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Profil utilisateur et logout en bas */}
      <Box sx={{ 
        borderTop: '1px solid',
        borderColor: 'divider',
        p: 1.5,
        mt: 'auto',
      }}>
        {!sidebarCollapsed ? (
          <>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'grey.300',
                  color: 'grey.600',
                }}
              >
                <AccountCircleIcon />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                  }}
                >
                  {user?.prenom} {user?.nom}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.125,
                    borderRadius: '10px',
                    bgcolor: 'grey.200',
                    mt: 0.25,
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{
                      color: 'grey.700',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.role === 'ADMIN' ? 'Administrateur' : 
                     user?.role === 'DGR' ? 'Direction Générale' :
                     user?.role === 'CVR' ? 'Commission Vérification' :
                     user?.role === 'DNCF' ? 'DNCF' :
                     user?.role === 'RESPONSABLE' ? 'Responsable' : 'Agent'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleSidebarToggle}
              size="small"
              sx={{
                color: 'text.secondary',
                backgroundColor: 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </Avatar>
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <StyledAppBar position="fixed" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 0.5, display: { xs: 'none', md: 'flex' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component="img"
              src="/dncf.jpg"
              alt="DNCF"
              sx={{
                height: 40,
                width: 'auto',
                mr: 0,
                display: { xs: 'none', md: 'block' },
              }}
            />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
              GESMUT
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              color="inherit"
              onClick={() => navigate('/notifications')}
              title="Notifications"
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.prenom} {user?.nom}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Déconnexion</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Box
        component="nav"
        sx={{ 
          width: { 
            md: sidebarCollapsed ? drawerWidthCollapsed : drawerWidth 
          }, 
          flexShrink: { md: 0 },
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
          }}
        >
          {drawer}
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          collapsed={sidebarCollapsed}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              borderTop: 'none !important',
              '&::before': {
                display: 'none !important',
              },
            },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { 
            md: `calc(100% - ${sidebarCollapsed ? drawerWidthCollapsed : drawerWidth}px)` 
          },
          mt: '64px',
          backgroundColor: 'background.default',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
