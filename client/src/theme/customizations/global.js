export const globalCustomizations = {
  MuiCssBaseline: {
    styleOverrides: {
      '@global': {
        '@font-face': {
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: '100 900',
          fontDisplay: 'swap',
          src: `url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap')`,
        },
      },
      'html, body': {
        fontFamily: 'Inter, sans-serif !important',
      },
      '*': {
        fontFamily: 'inherit',
      },
      '.MuiTypography-root': {
        fontFamily: 'Inter, sans-serif !important',
      },
    },
  },
};