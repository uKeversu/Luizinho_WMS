

export const condicionaisStyles = {
  page: {
    bgcolor: '#2c2c2c',
    minHeight: '100vh',
    py: 2,
  },

  container: {
    px: 1,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    flexWrap: 'wrap',
  },

  title: {
    color: '#fff',
    fontWeight: 'bold',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },

  lastUpdate: {
    color: '#ccc',
  },

  refreshButton: {
    color: '#fff',
    borderColor: '#fff',
  },

  legendaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    p: 1.5,
    mb: 3,
    bgcolor: '#3a3a3a',
  },

  legendaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  legendaBox: (color) => ({
    width: 15,
    height: 15,
    bgcolor: color,
    borderRadius: '3px',
  }),

  legendaText: {
    color: '#e2dcdc',
    fontSize: '0.75rem',
  },

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },

  loadingInline: {
    display: 'flex',
    justifyContent: 'center',
    my: 4,
  },

  card: (color) => ({
    backgroundColor: color,
    width: '100%',
    display: 'flex',
    color: '#131212',
    flexDirection: 'column',
    borderRadius: '6px',
    boxShadow: 2,
    transition: '0.2s',
    '&:hover': { boxShadow: 6 },
  }),

  cardContent: {
    p: 1.5,
    flexGrow: 1,
  },

  cardTitle: {
    fontWeight: 'bold',
  },

  cardButtonContainer: {
    p: 1,
    pt: 0,
  },

  cardButton: {
    backgroundColor: '#1976d2',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#115293',
    },
  },

  gridItem: {
    display: 'flex',
  },

  footer: {
    display: 'flex',
    justifyContent: 'center',
    mt: 4,
  },

  voltarButton: {
    px: 4,
  },

  dialogTitle: {},

  dialogSubtitle: {
    color: 'text.secondary',
  },

  tableRow: (estoque) => ({
    backgroundColor: estoque < 0 ? '#ee4556' : 'inherit',
  }),
};