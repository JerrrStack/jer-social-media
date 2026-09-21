import React from "react";
import HeadTags from "./HeadTags";
import Navbar from "./Navbar";
import { makeStyles, CssBaseline, Box } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import nprogress from "nprogress";
import Router, { useRouter } from "next/router";
import theme from "../../src/theme";
import "@fontsource/roboto";
import ChatPopup from "../Messages/ChatPopup";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "90vh",
    backgroundColor: "#F0F2F5",
    paddingBottom: theme.spacing(2),
  },
  main: {
    margin: "0 auto",
    width: "100%",
    maxWidth: "100%",
    padding: theme.spacing(1, 1.5, 2),
    boxSizing: "border-box",
    backgroundColor: "transparent",
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(1.5, 2, 2),
    },
  },
  mainFeed: {
    maxWidth: 1280,
    [theme.breakpoints.up("lg")]: {
      maxWidth: 1280,
    },
  },
  mainNarrow: {
    maxWidth: 680,
  },
  mainWide: {
    maxWidth: 1200,
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
    },
  },
}));

function Layout({ children, user }) {
  const classes = useStyles();
  const router = useRouter();
  const isFeedPage = router.pathname === "/";
  const isWidePage =
    router.pathname === "/messages" || router.pathname === "/[userId]";

  const widthClass = isWidePage
    ? classes.mainWide
    : isFeedPage
    ? classes.mainFeed
    : classes.mainNarrow;

  Router.onRouteChangeStart = () => nprogress.start();
  Router.onRouteChangeComplete = () => nprogress.done();
  Router.onRouteChangeError = () => nprogress.done();

  return (
    <ThemeProvider theme={theme}>
      <HeadTags />
      <CssBaseline />
      <Navbar user={user} />
      <Box className={classes.root}>
        <Box className={`${classes.main} ${widthClass}`}>{children}</Box>
      </Box>
      <ChatPopup user={user} />
    </ThemeProvider>
  );
}

export default Layout;
