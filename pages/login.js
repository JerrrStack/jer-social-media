import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  makeStyles,
  Button,
  InputAdornment,
  IconButton,
  Link,
} from "@material-ui/core";
import ReactCardFlip from "react-card-flip";
import Head from "next/head";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import PersonIcon from "@material-ui/icons/Person";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import baseUrl from "../utils/baseUrl";
import CssTextField from "../components/Layout/CssTextField";
import LockIcon from "@material-ui/icons/Lock";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import { loginUser, registerAccount } from "../utils/authUser";
import Alert from "@material-ui/lab/Alert";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
import { green } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    margin: 0,
    minHeight: "100vh",
    backgroundImage: `url(${"/img/bg.jpg"})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center center",
  },

  buttonSwitch: {
    backgroundColor: "#000",
    marginBottom: 20,
    "&, Button": {
      borderRadius: "50px",
    },
  },

  title: {
    textAlign: "center",
    paddingBottom: 20,
    margin: 0,
  },

  formDiv: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "5px",
    boxShadow: "3px 3px 10px #000",
    width: "340px",
    margin: 30,
    padding: 30,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      margin: "auto",
    },
  },
  backFormDiv: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "5px",
    boxShadow: "3px 3px 10px #000",
    width: "340px",

    margin: 10,
    padding: 10,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      margin: "auto",
    },
  },

  helperAccount: {
    textAlign: "center",
  },

  btnStyle: {
    textAlign: "center",
    padding: 30,
  },
  sendBtn: {
    color: "#FFF",
    width: "100px",
    fontWeight: "bold",
  },
  frontCard: {
    backgroundColor: "green",
    height: 100,
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backCard: {
    backgroundColor: "red",
    height: 100,
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  cssLabel: {
    position: "relative",
    color: "#fff",
    fontColor: "#fff",
    fontSize: "1.1rem",
    fontWeight: "bold",
    minWidth: "300px",
    [theme.breakpoints.down("sm", "md")]: {
      minWidth: "19vw",
    },
  },

  cssOutlinedInput: {
    "&$cssFocused $notchedOutline": {
      borderColor: `${theme.palette.secondary.main} !important`,
    },
  },

  cssFocused: {},
  notchedOutline: {},
}));

const themeGreen = createMuiTheme({
  palette: {
    primary: green,
  },
});

function login() {
  const classes = useStyles();
  const [user, setUser] = useState({
    email: "test@test.com",
    password: "test123",
  });
  const [registerUser, setRegisterUser] = useState({
    mail: "",
    name: "",
    pass: "",
  });
  const { email, password } = user;
  const { mail, name, pass } = registerUser;

  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  let cancel;

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeRegister = (e) => {
    const { name, value } = e.target;

    setRegisterUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await loginUser(user, setErrorMsg, setFormLoading);
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    await registerAccount(registerUser, setErrorMsg, setFormLoading);
  };
  const checkUsername = async () => {
    setUsernameLoading(true);
    try {
      cancel && cancel();

      const CancelToken = axios.CancelToken;

      const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (errorMsg !== null) setErrorMsg(null);

      if (res.data === "Available") {
        setUsernameAvailable(true);
        setRegisterUser((prev) => ({ ...prev, username }));
      }
    } catch (error) {
      setErrorMsg("Username Not Available");
      setUsernameAvailable(false);
    }
    setUsernameLoading(false);
  };

  useEffect(() => {
    username === "" ? setUsernameAvailable(false) : checkUsername();
  }, [username]);

  return (
    <>
      {" "}
      <Head>
        <title>Social Media</title>
      </Head>
      <Box className={classes.root}>
        <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
          <Box component="div" className={classes.formDiv}>
            <form
              onSubmit={handleSubmit}
              noValidate
              autoComplete="off"
              className={classes.formField}
            >
              <Box component="div" className={classes.title}>
                <h2>Welcome Back</h2>
                <span>Login to your Account</span>
              </Box>

              <div>
                <CssTextField
                  label="Email"
                  type="email"
                  name="email"
                  // value={email}
                  value="test@test.com"
                  // onChange={handleChange}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                      focused: classes.cssFocused,
                    },
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon />
                      </InputAdornment>
                    ),
                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <CssTextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  // value={password}
                  value="test123"
                  // onChange={handleChange}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                      focused: classes.cssFocused,
                    },
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),

                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                />
                {user.password ? (
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </span>
                ) : (
                  <></>
                )}
              </div>
              <div className={classes.btnStyle}>
                <Button
                  className={classes.sendBtn}
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  LOGIN
                </Button>
              </div>
              <Box component="div" className={classes.helperAccount}>
                <Link
                  onClick={handleClick}
                  style={{ color: "#008DFF", cursor: "pointer" }}
                >
                  Create an Account?
                </Link>
              </Box>
            </form>
          </Box>

          {/* Signup */}

          <Box component="div" className={classes.backFormDiv}>
            <form
              onSubmit={handleRegisterSubmit}
              noValidate
              autoComplete="off"
              className={classes.formField}
            >
              <Box component="div" className={classes.title}>
                <h2>Register</h2>
                <span>Create your new Account</span>
              </Box>

              <div>
                <CssTextField
                  label="Email"
                  type="email"
                  name="mail"
                  value={mail}
                  onChange={handleChangeRegister}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                      focused: classes.cssFocused,
                    },
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon />
                      </InputAdornment>
                    ),
                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                />
              </div>
              <div>
                <CssTextField
                  label="Name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChangeRegister}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                      focused: classes.cssFocused,
                    },
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <CssTextField
                  label="Usename"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (regexUserName.test(e.target.value)) {
                      setUsernameAvailable(true);
                    } else {
                      setUsernameAvailable(false);
                    }
                  }}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                      focused: classes.cssFocused,
                    },
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon />
                      </InputAdornment>
                    ),

                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                />
                {username ? (
                  <span>
                    <IconButton size="small" style={{ cursor: "default" }}>
                      {usernameAvailable ? (
                        <ThemeProvider theme={themeGreen}>
                          <CheckIcon />
                        </ThemeProvider>
                      ) : (
                        <ClearIcon color="secondary" />
                      )}
                    </IconButton>
                  </span>
                ) : (
                  <></>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <CssTextField
                  label="Password"
                  name="pass"
                  type={showPassword ? "text" : "password"}
                  value={pass}
                  onChange={handleChangeRegister}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                      focused: classes.cssFocused,
                    },
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),

                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                />
                {registerUser.pass ? (
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </span>
                ) : (
                  <></>
                )}
              </div>
              {errorMsg ? (
                <Alert variant="outlined" severity="error">
                  {errorMsg}
                </Alert>
              ) : (
                ""
              )}
              <div className={classes.btnStyle}>
                <Button
                  className={classes.sendBtn}
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Sign Up
                </Button>
              </div>
              <Box component="div" className={classes.helperAccount}>
                <Link
                  onClick={handleClick}
                  style={{ color: "#008DFF", cursor: "pointer" }}
                >
                  Already have an account?
                </Link>
              </Box>
            </form>
          </Box>
        </ReactCardFlip>
      </Box>
    </>
  );
}

export default login;
