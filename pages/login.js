import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  makeStyles,
  Button,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
} from "@material-ui/core";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import PersonIcon from "@material-ui/icons/Person";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import LockIcon from "@material-ui/icons/Lock";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import Alert from "@material-ui/lab/Alert";
import baseUrl from "../utils/baseUrl";
import CssTextField from "../components/Layout/CssTextField";
import { loginUser, registerAccount } from "../utils/authUser";
import theme from "../src/theme";
import {
  USERNAME_REGEX,
  isValidEmail,
  isValidPassword,
} from "../utils/validation";

export const DEMO_LOGIN_EMAIL = "johndoe@gmail.com";
export const DEMO_LOGIN_PASSWORD = "test123";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    background:
      "linear-gradient(135deg, #0f172a 0%, #312e81 40%, #4f46e5 70%, #6366f1 100%)",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      width: 480,
      height: 480,
      borderRadius: "50%",
      background: "rgba(236, 72, 153, 0.15)",
      top: -120,
      right: -80,
      filter: "blur(2px)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      width: 360,
      height: 360,
      borderRadius: "50%",
      background: "rgba(129, 140, 248, 0.2)",
      bottom: -100,
      left: -60,
    },
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 440,
    padding: theme.spacing(4, 3, 3),
    borderRadius: 20,
    background: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 24px 48px rgba(15, 23, 42, 0.35)",
  },
  brand: {
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  brandTitle: {
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
  brandSubtitle: {
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 4,
  },
  demoHint: {
    marginBottom: theme.spacing(2),
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    color: "#e0e7ff",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    "& .MuiAlert-icon": {
      color: "#c7d2fe",
    },
  },
  tabs: {
    marginBottom: theme.spacing(2),
    "& .MuiTab-root": {
      color: "rgba(255, 255, 255, 0.65)",
      fontWeight: 600,
      minWidth: 120,
    },
    "& .Mui-selected": {
      color: "#fff",
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#fff",
      height: 3,
      borderRadius: 3,
    },
  },
  fieldRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 4,
  },
  submitBtn: {
    marginTop: theme.spacing(2),
    padding: "12px 0",
    fontWeight: 700,
    fontSize: "0.95rem",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.45)",
    "&:hover": {
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    },
  },
  switchLink: {
    display: "block",
    textAlign: "center",
    marginTop: theme.spacing(2),
    color: "#c7d2fe",
    cursor: "pointer",
    fontWeight: 500,
    "&:hover": {
      color: "#fff",
      textDecoration: "underline",
    },
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#fff",
    marginTop: theme.spacing(1),
  },
}));

function LoginPage() {
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState({
    email: DEMO_LOGIN_EMAIL,
    password: DEMO_LOGIN_PASSWORD,
  });
  const [registerUser, setRegisterUser] = useState({
    mail: "",
    name: "",
    pass: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const cancelRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleChangeRegister = (e) => {
    const { name, value } = e.target;
    setRegisterUser((prev) => ({ ...prev, [name]: value }));
    if (name === "username") setUsername(value);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(user.email)) {
      setErrorMsg("Enter a valid email address");
      return;
    }
    if (!isValidPassword(user.password)) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    await loginUser(user, setErrorMsg, setFormLoading);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(registerUser.mail)) {
      setErrorMsg("Enter a valid email address");
      return;
    }
    if (!registerUser.name.trim() || registerUser.name.trim().length < 2) {
      setErrorMsg("Name must be at least 2 characters");
      return;
    }
    if (!isValidUsername(username)) {
      setErrorMsg("Choose a valid username (letters, numbers, underscores, dots)");
      return;
    }
    if (usernameStatus !== "available") {
      setErrorMsg("Username is not available");
      return;
    }
    if (!isValidPassword(registerUser.pass)) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    await registerAccount(
      { ...registerUser, username },
      setErrorMsg,
      setFormLoading
    );
  };

  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        cancelRef.current?.();
        const CancelToken = axios.CancelToken;
        const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
          cancelToken: new CancelToken((c) => {
            cancelRef.current = c;
          }),
        });
        if (res.data?.message === "Available") {
          setUsernameStatus("available");
          setRegisterUser((prev) => ({ ...prev, username }));
        } else {
          setUsernameStatus("taken");
        }
      } catch {
        setUsernameStatus("taken");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const renderUsernameIcon = () => {
    if (!username) return null;
    if (usernameStatus === "available") {
      return <CheckIcon style={{ color: "#4ade80" }} />;
    }
    return <ClearIcon style={{ color: "#f87171" }} />;
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Sign in · SayHi</title>
      </Head>
      <Box className={classes.page}>
        <Paper className={classes.card} elevation={0}>
          <Box className={classes.brand}>
            <Typography variant="h4" className={classes.brandTitle}>
              SayHi
            </Typography>
            <Typography variant="body2" className={classes.brandSubtitle}>
              Connect, share, and chat
            </Typography>
          </Box>

          <Alert severity="info" className={classes.demoHint} icon={false}>
            Demo login pre-filled — you can edit email and password anytime.
          </Alert>

          <Tabs
            value={tab}
            onChange={(_, value) => {
              setTab(value);
              setErrorMsg(null);
            }}
            centered
            className={classes.tabs}
          >
            <Tab label="Sign in" />
            <Tab label="Sign up" />
          </Tabs>

          {errorMsg && (
            <Alert severity="error" style={{ marginBottom: 16 }}>
              {errorMsg}
            </Alert>
          )}

          {tab === 0 ? (
            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <CssTextField
                label="Email"
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                autoComplete="email"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box className={classes.fieldRow}>
                <CssTextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ color: "rgba(255,255,255,0.8)", marginBottom: 8 }}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </Box>

              {formLoading ? (
                <Box className={classes.loadingRow}>
                  <Typography variant="body2">Signing in…</Typography>
                  <CircularProgress size={22} style={{ color: "#fff" }} />
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  className={classes.submitBtn}
                  disabled={formLoading}
                >
                  Sign in
                </Button>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} noValidate autoComplete="off">
              <CssTextField
                label="Email"
                type="email"
                name="mail"
                value={registerUser.mail}
                onChange={handleChangeRegister}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <CssTextField
                label="Full name"
                type="text"
                name="name"
                value={registerUser.name}
                onChange={handleChangeRegister}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box className={classes.fieldRow}>
                <CssTextField
                  label="Username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={handleChangeRegister}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton size="small" style={{ marginBottom: 8 }}>
                  {renderUsernameIcon()}
                </IconButton>
              </Box>
              <Box className={classes.fieldRow}>
                <CssTextField
                  label="Password"
                  name="pass"
                  type={showPassword ? "text" : "password"}
                  value={registerUser.pass}
                  onChange={handleChangeRegister}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ color: "rgba(255,255,255,0.8)", marginBottom: 8 }}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </Box>

              {formLoading ? (
                <Box className={classes.loadingRow}>
                  <Typography variant="body2">Creating account…</Typography>
                  <CircularProgress size={22} style={{ color: "#fff" }} />
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  className={classes.submitBtn}
                  disabled={formLoading || usernameStatus === "taken"}
                >
                  Create account
                </Button>
              )}
            </form>
          )}

          <Divider style={{ margin: "20px 0", background: "rgba(255,255,255,0.15)" }} />

          <Link
            component="button"
            type="button"
            className={classes.switchLink}
            onClick={() => {
              setTab(tab === 0 ? 1 : 0);
              setErrorMsg(null);
            }}
          >
            {tab === 0
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </Link>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;
