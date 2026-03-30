export const contasReceberStyles = {
  page: {
    backgroundColor: '#2c2c2c',
    minHeight: '100vh',
    padding: '5px',
  },

  container: {
    mt: 4,
    mb: 4,
    paddingLeft: '10px',
    paddingRight: '10px',
  },

  title: {
    color: '#fff',
    textAlign: 'center',
    mb: 3,
    fontWeight: 'bold',
  },

  legendaContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    mb: 3,
  },

  legendaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },

  legendaBox: (color) => ({
    width: '15px',
    height: '15px',
    backgroundColor: color,
    borderRadius: '3px',
  }),

  legendaText: {
    color: '#fff',
    fontSize: '0.8rem',
  },

  cardContent: {
    flexGrow: 1,
    padding: '16px',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 1,
  },

  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },

  chip: (color) => ({
    backgroundColor: color,
    color: '#000',
    fontSize: '0.6rem',
    fontWeight: 'bold',
    ml: 1,
  }),

  codigo: {
    fontSize: '0.75rem',
    color: '#aaa',
    mb: 1,
  },

  totalValor: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#4fc3f7',
  },

  subtitulo: {
    fontSize: '0.75rem',
    color: '#ccc',
  },

  boxVencimento: {
    mb: 2,
    p: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '4px',
  },

  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  buttonVerTitulos: {
    fontSize: '0.7rem',
    borderColor: '#007bff',
    color: '#007bff',
    '&:hover': {
      borderColor: '#0056b3',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
    },
  },

  buttonWhats: {
    minWidth: 'auto',
    backgroundColor: '#25D366',
    '&:hover': {
      backgroundColor: '#1da851',
    },
  },

  dialogTitle: {
    backgroundColor: '#3a3a3a',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dialogContent: {
    backgroundColor: '#2c2c2c',
    padding: 0,
  },

  voltarButton: {
    padding: '8px 24px',
    fontWeight: 'bold',
  },
}