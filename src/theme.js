import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    type: "light",
    primary: {
      main: "#6366f1",
      dark: "#4f46e5",
      light: "#818cf8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ec4899",
      dark: "#db2777",
      light: "#f472b6",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f1f5f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    error: { main: "#ef4444" },
    success: { main: "#22c55e" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 12,
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 10,
        padding: "10px 20px",
        boxShadow: "none",
      },
      contained: {
        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
        "&:hover": {
          boxShadow: "0 6px 20px rgba(99, 102, 241, 0.45)",
        },
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 16,
      },
      elevation1: {
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.06)",
      },
    },
    MuiAppBar: {
      colorPrimary: {
        background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
        boxShadow: "0 4px 20px rgba(79, 70, 229, 0.25)",
      },
    },
    MuiCard: {
      root: {
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.06)",
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
