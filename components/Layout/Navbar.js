import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CssBaseline from "@material-ui/core/CssBaseline";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Button from "@material-ui/core/Button";
import Search from "../Homepage/Search";
import {
  Avatar,
  Badge,
  Box,
  Link,
  makeStyles,
  Menu,
  MenuItem,
} from "@material-ui/core";

import CustomMenuButton from "../Homepage/CustomMenuButton";
const useStyles = makeStyles((theme) => ({
  root: {},

  appBar: {
    backgroundColor: "#0063B2FF",
  },
  toolBar: { minHeight: "55px" },
  title: {
    flexGrow: 1,
  },
  userContent: {
    display: "flex",
    alignItems: "center",
    "&:hover": {
      textDecoration: "none",
    },
  },
  searchBar: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  profile: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
}));
function ElevationScroll(props) {
  const { children, window } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

function Navbar({ user, props }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <React.Fragment>
      <CssBaseline />

      <ElevationScroll {...props}>
        <AppBar className={classes.appBar} elevation={0}>
          <Toolbar className={classes.toolBar}>
            <Typography variant="h6" className={classes.title}>
              <Link color="inherit" href="/">
                Social Media
              </Link>
            </Typography>
            <span className={classes.profile}>
              <Button color="inherit">
                <Link
                  color="inherit"
                  href={`/${user.username}`}
                  className={classes.userContent}
                >
                  <Avatar
                    alt="profile pic"
                    src={user.profilePicUrl}
                    style={{ marginRight: 10, height: "30px", width: "30px" }}
                    size="small"
                  />

                  <Typography display="inline" variant="body2">
                    <span>{user.username}</span>
                  </Typography>
                </Link>
              </Button>
            </span>
            <span className={classes.searchBar}>
              <Search />
            </span>
            {/* 
            <NotifMenu user={user} /> */}
            <CustomMenuButton user={user} />
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
    </React.Fragment>
  );
}
export default Navbar;
