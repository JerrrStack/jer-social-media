import React from "react";
import HeadTags from "./HeadTags";
import Navbar from "./Navbar";
import { makeStyles, CssBaseline, Box, Grid } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import nprogress from "nprogress";
import Router from "next/router";
import theme from "../../src/theme";
import Sidebar from "../Homepage/Sidebar";
import "@fontsource/roboto";

const useStyles = makeStyles({
  root: {
    minHeight: "90vh",
  },
  sideBar: {
    marginRight: "5vw",
    [theme.breakpoints.down("md")]: {
      marginRight: "0",
    },
  },
});

function Layout({ children, user, userFollowStats }) {
  const classes = useStyles();
  Router.onRouteChangeStart = () => nprogress.start();
  Router.onRouteChangeComplete = () => nprogress.done();
  Router.onRouteChangeError = () => nprogress.done();

  return (
    <>
      <HeadTags />

      <CssBaseline />
      {/* {user ? ( */}

      <Navbar user={user} />

      <Box className={classes.root}>
        <Grid container>
          <Grid item xs={12} sm={12} md={12} lg={2}>
            {/* <Sidebar user={user} /> */}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={8}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={2}>
            {/* <Sidebar user={user} userFollowStats={userFollowStats} /> */}
          </Grid>
        </Grid>
      </Box>

      {/* ) : (
        { children }
      )} */}
    </>
  );
}

export default Layout;
