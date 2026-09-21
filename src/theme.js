import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    type: "light",
    primary: {
      main: "#1877F2",
      dark: "#0D65D9",
      light: "#4B92F7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#F02849",
      dark: "#D01E3C",
      light: "#F55A74",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F0F2F5",
      paper: "#ffffff",
    },
    text: {
      primary: "#050505",
      secondary: "#65676B",
    },
    divider: "#CED0D4",
    error: { main: "#F02849" },
    success: { main: "#31A24C" },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.03em" },
    h5: { fontWeight: 650 },
    h6: { fontWeight: 650 },
    button: { fontWeight: 650, textTransform: "none" },
    body1: { fontSize: "0.95rem" },
    body2: { fontSize: "0.9375rem", lineHeight: 1.45 },
  },
  shape: {
    borderRadius: 12,
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
        padding: "8px 16px",
        boxShadow: "none",
      },
      contained: {
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
      },
      containedPrimary: {
        "&:hover": {
          backgroundColor: "#166FE5",
        },
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
      },
    },
    MuiAppBar: {
      colorPrimary: {
        background: "#1877F2",
        color: "#ffffff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
      },
    },
    MuiCard: {
      root: {
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
      },
    },
    MuiTextField: {
      root: {
        marginBottom: 8,
      },
    },
  },
});

export default theme;
