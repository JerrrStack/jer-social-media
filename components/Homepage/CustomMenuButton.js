import React from "react";
import Button from "@material-ui/core/Button";
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
import { Avatar, Badge, Link, Typography } from "@material-ui/core";
import SearchBar from "../Navbar/SearchBar";
import PersonIcon from "@material-ui/icons/Person";
const useStyles = makeStyles((theme) => ({
  root: {},
  paper: {
    marginRight: theme.spacing(2),
  },
  searchBar: {
    display: "none ",
    [theme.breakpoints.down("xs")]: {
      display: "block ",
    },
  },
  profile: {
    display: "none ",
    [theme.breakpoints.down("xs")]: {
      display: "block ",
    },
  },
}));

export default function CustomMenuButton({ email, user }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <div className={classes.root}>
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          {user.unreadNotification > 0 ? (
            <>
              <Badge badgeContent={"!"} overlap="rectangle" color="secondary">
                <MenuIcon />
              </Badge>
            </>
          ) : (
            <>
              <MenuIcon />
            </>
          )}
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="menu-list-grow"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem className={classes.searchBar}>
                      <SearchBar />
                    </MenuItem>
                    <Link color="inherit" href={`/${user.username}`}>
                      <MenuItem className={classes.profile}>
                        <PersonIcon color="primary" />
                        Profile
                      </MenuItem>
                    </Link>
                    <Link href="/messages" color="inherit">
                      <MenuItem onClick={handleClose}>
                        {/* {user.unreadMessage > 0 ? (
                          <>
                            <MailIcon color="secondary" /> Messages
                          </>
                        ) : (
                          <> */}
                        <MailIcon color="primary" /> Messages
                        {/* </>
                        )} */}
                      </MenuItem>{" "}
                    </Link>

                    <Link href="/notifications" color="inherit">
                      <MenuItem onClick={handleClose}>
                        {user.unreadNotification > 0 ? (
                          <>
                            <Badge
                              badgeContent={"!"}
                              overlap="rectangle"
                              color="secondary"
                            >
                              <NotificationsIcon color="secondary" />
                              Notifications
                            </Badge>
                          </>
                        ) : (
                          <>
                            <NotificationsIcon color="primary" />
                            Notifications
                          </>
                        )}
                      </MenuItem>
                    </Link>
                    <MenuItem onClick={() => logoutUser(email)}>
                      <ExitToAppIcon color="secondary" />
                      Logout
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  );
}
