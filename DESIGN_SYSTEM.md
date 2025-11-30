# 🎨 Design System Premium - GESMUT

## Vue d'ensemble

Design premium inspiré de Dribbble avec des composants compacts, réutilisables et un style professionnel moderne.

## 🎨 Palette de couleurs

### Couleurs principales
- **Primary (Indigo)**: `#6366F1` - Couleur principale, utilisée pour les actions principales
- **Secondary (Rose)**: `#EC4899` - Couleur secondaire, utilisée pour les accents
- **Success**: `#10B981` - Succès, validations
- **Warning**: `#F59E0B` - Avertissements, en attente
- **Error**: `#EF4444` - Erreurs, rejets
- **Info**: `#3B82F6` - Informations

### Arrière-plans
- **Default**: `#F8FAFC` - Arrière-plan principal
- **Paper**: `#FFFFFF` - Cartes et surfaces

## 📐 Typographie

- **Police**: Inter (Google Fonts)
- **Hiérarchie**:
  - H1: 2.5rem, 700, line-height 1.2
  - H2: 2rem, 700, line-height 1.3
  - H3: 1.75rem, 600, line-height 1.4
  - H4: 1.5rem, 600, line-height 1.4
  - Body: 1rem, line-height 1.6

## 🧩 Composants réutilisables

### StatCard
Carte de statistique avec icône et gradient.

```jsx
<StatCard
  title="Total des demandes"
  value={42}
  icon={AssignmentIcon}
  color="primary"
  subtitle="Ce mois"
  trend={12}
/>
```

### DataTable
Tableau de données avec actions et rendu personnalisé.

```jsx
<DataTable
  columns={columns}
  rows={rows}
  actions={actions}
  onRowClick={handleClick}
  emptyMessage="Aucune donnée"
/>
```

### PageHeader
En-tête de page avec titre, sous-titre, breadcrumbs et action.

```jsx
<PageHeader
  title="Mes demandes"
  subtitle="Gérez vos demandes"
  breadcrumbs={breadcrumbs}
  action={<Button>Action</Button>}
/>
```

### StatusChip
Badge de statut avec couleurs automatiques.

```jsx
<StatusChip status="ACCEPTEE" />
<StatusChip status="EN_ATTENTE" label="En cours" />
```

### ActionButton
Bouton avec gradient et animations.

```jsx
<ActionButton variant="contained" color="primary">
  Créer
</ActionButton>
```

## 🎭 Caractéristiques du design

### Ombres
- Ombres douces et subtiles
- Élévation au survol
- Transitions fluides

### Bordures arrondies
- Cards: 16px
- Buttons: 10-12px
- Inputs: 10px
- Chips: 8px

### Animations
- Transitions: `cubic-bezier(0.4, 0, 0.2, 1)`
- Hover: Translation Y (-2px)
- Focus: Border width augmentation

### Gradients
- Buttons: Gradient primary
- Text: Gradient pour titres
- Backgrounds: Gradients subtils

## 📱 Responsive

- Mobile-first approach
- Breakpoints Material-UI standards
- Layout adaptatif avec Grid

## 🚀 Utilisation

Tous les composants sont disponibles dans `src/components/common/` et peuvent être importés directement :

```jsx
import { StatCard, DataTable, PageHeader, StatusChip, ActionButton } from '../../components/common';
```

## 🎯 Pages refaites

- ✅ Login & Register (design premium)
- ✅ Agent Dashboard
- ✅ Agent MesDemandes
- ✅ Responsable Dashboard
- ✅ Responsable Validations
- ✅ Admin Dashboard
- ✅ MainLayout (sidebar premium)

## 📦 Structure

```
frontend/src/
├── theme/
│   └── theme.js          # Thème premium
├── components/
│   ├── common/
│   │   ├── StatCard.js
│   │   ├── DataTable.js
│   │   ├── ActionButton.js
│   │   ├── PageHeader.js
│   │   └── StatusChip.js
│   └── layout/
│       └── MainLayout.js  # Layout premium
└── pages/
    └── ...                # Pages avec nouveau design
```

