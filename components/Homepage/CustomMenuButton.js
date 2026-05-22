import React from "react";
import IconButton from "@material-ui/core/IconButton";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import MailIcon from "@material-ui/icons/Mail";
import { logoutUser } from "../../utils/authUser";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { Box, Link } from "@material-ui/core";
import SearchBar from "../Navbar/SearchBar";
import PersonIcon from "@material-ui/icons/Person";
import { getProfilePath } from "../../utils/displayUser";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  menuButton: {
    padding: 8,
  },
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.secondary.main,
    border: `2px solid ${theme.palette.primary.main}`,
    pointerEvents: "none",
  },
  popper: {
    zIndex: theme.zIndex.modal,
  },
  paper: {
    minWidth: 220,
    marginTop: theme.spacing(1),
    borderRadius: 12,
    boxShadow: theme.shadows[8],
    overflow: "hidden",
  },
  menuList: {
    padding: theme.spacing(0.5, 0),
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 2),
    fontSize: "0.9rem",
    minHeight: 44,
  },
  menuItemLabel: {
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    flexShrink: 0,
  },
  notifPill: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 10,
    padding: "2px 6px",
    lineHeight: 1.2,
    flexShrink: 0,
  },
  searchBar: {
    display: "none",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
    },
  },
  profile: {
    display: "none",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
    },
  },
}));

export default function CustomMenuButton({ user }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={classes.root}>
      <IconButton
        ref={anchorRef}
        className={classes.menuButton}
        color="inherit"
        aria-controls={open ? "nav-menu-list" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        aria-label="Open menu"
      >
        <MenuIcon />
      </IconButton>
      {user.unreadNotification ? <span className={classes.unreadDot} /> : null}

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        className={classes.popper}
        modifiers={{
          offset: { offset: "0, 8" },
          preventOverflow: { enabled: true, boundariesElement: "viewport" },
        }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-end" ? "right top" : "right bottom",
            }}
          >
            <Paper className={classes.paper} elevation={8}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="nav-menu-list"
                  className={classes.menuList}
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem className={`${classes.menuItem} ${classes.searchBar}`}>
                    <SearchBar />
                  </MenuItem>
                  <Link href={getProfilePath(user)} color="inherit">
                    <MenuItem
                      className={`${classes.menuItem} ${classes.profile}`}
                      onClick={handleClose}
                    >
                      <PersonIcon className={classes.menuIcon} color="primary" />
                      <span className={classes.menuItemLabel}>Profile</span>
                    </MenuItem>
                  </Link>
                  <Link href="/messages" color="inherit">
                    <MenuItem className={classes.menuItem} onClick={handleClose}>
                      <MailIcon className={classes.menuIcon} color="primary" />
                      <span className={classes.menuItemLabel}>Messages</span>
                    </MenuItem>
                  </Link>
                  <Link href="/notifications" color="inherit">
                    <MenuItem className={classes.menuItem} onClick={handleClose}>
                      <NotificationsIcon
                        className={classes.menuIcon}
                        color="primary"
                      />
                      <span className={classes.menuItemLabel}>Notifications</span>
                      {user.unreadNotification ? (
                        <span className={classes.notifPill}>!</span>
                      ) : null}
                    </MenuItem>
                  </Link>
                  <MenuItem
                    className={classes.menuItem}
                    onClick={() => {
                      handleClose({ target: document.body });
                      logoutUser(user.email);
                    }}
                  >
                    <ExitToAppIcon className={classes.menuIcon} color="secondary" />
                    <span className={classes.menuItemLabel}>Logout</span>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}
