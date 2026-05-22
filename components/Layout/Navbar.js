import React from "react";
import Link from "next/link";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CssBaseline from "@material-ui/core/CssBaseline";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Search from "../Homepage/Search";
import { Avatar, Box, makeStyles } from "@material-ui/core";
import NavbarActions from "./NavbarActions";
import NavbarMobileMenu from "./NavbarMobileMenu";
import { getDisplayName, getProfilePath } from "../../utils/displayUser";

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: {
    minHeight: 56,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "flex-end",
    gap: theme.spacing(1),
    overflow: "visible",
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  brand: {
    flexShrink: 0,
    alignSelf: "center",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontSize: "1.15rem",
    [theme.breakpoints.up("sm")]: {
      fontSize: "1.25rem",
      marginRight: theme.spacing(1),
    },
  },
  rightSection: {
    display: "flex",
    alignItems: "flex-end",
    gap: theme.spacing(1),
    flexShrink: 0,
    marginLeft: "auto",
    minWidth: 0,
  },
  desktopNav: {
    display: "flex",
    alignItems: "flex-end",
    gap: theme.spacing(2),
    minWidth: 0,
    flex: 1,
    justifyContent: "flex-end",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  mobileNav: {
    display: "none",
    alignItems: "flex-end",
    gap: theme.spacing(0.5),
    [theme.breakpoints.down("md")]: {
      display: "flex",
    },
  },
  profileLink: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: "inherit",
    textDecoration: "none",
    padding: theme.spacing(0.5, 1),
    borderRadius: 8,
    flexShrink: 0,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      textDecoration: "none",
    },
  },
  avatar: {
    width: 32,
    height: 32,
    [theme.breakpoints.down("md")]: {
      width: 36,
      height: 36,
    },
  },
  searchWrap: {
    flex: "1 1 140px",
    maxWidth: 280,
    minWidth: 0,
    display: "flex",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    "& .MuiFormControl-root": {
      marginBottom: 0,
    },
  },
  displayName: {
    fontWeight: 600,
    fontSize: "0.875rem",
    textTransform: "lowercase",
    maxWidth: 140,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("lg")]: {
      maxWidth: 100,
    },
  },
}));

function ElevationScroll({ children, window }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

function Navbar({ user }) {
  const classes = useStyles();

  return (
    <>
      <CssBaseline />
      <ElevationScroll>
        <AppBar className={classes.appBar} position="sticky" color="primary">
          <Toolbar className={classes.toolbar} disableGutters={false}>
            <Typography variant="h6" className={classes.brand} noWrap>
              <Link href="/">
                <a style={{ color: "inherit", textDecoration: "none" }}>SayHi</a>
              </Link>
            </Typography>

            <Box className={classes.rightSection}>
              <Box className={classes.desktopNav}>
                <Link href={getProfilePath(user)}>
                  <a className={classes.profileLink}>
                    <Avatar
                      alt={getDisplayName(user)}
                      src={user.profilePicUrl}
                      className={classes.avatar}
                    />
                    <Typography className={classes.displayName} component="span">
                      {getDisplayName(user)}
                    </Typography>
                  </a>
                </Link>

                <Box className={classes.searchWrap}>
                  <Search />
                </Box>

                <NavbarActions user={user} />
              </Box>

              <Box className={classes.mobileNav}>
                <Link href={getProfilePath(user)}>
                  <a className={classes.profileLink} aria-label="Your profile">
                    <Avatar
                      alt={getDisplayName(user)}
                      src={user.profilePicUrl}
                      className={classes.avatar}
                    />
                  </a>
                </Link>
                <NavbarMobileMenu user={user} />
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </>
  );
}

export default Navbar;
