import React from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  IconButton,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import MailIcon from "@material-ui/icons/Mail";
import NotificationsIcon from "@material-ui/icons/Notifications";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { logoutUser } from "../../utils/authUser";
import useUnreadCounts from "../../utils/useUnreadCounts";

const ICON_SIZE = 40;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.25),
    flexShrink: 0,
    height: ICON_SIZE,
  },
  slot: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: ICON_SIZE,
    height: ICON_SIZE,
    flexShrink: 0,
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: ICON_SIZE,
    height: ICON_SIZE,
    padding: 8,
    boxSizing: "border-box",
    color: "#fff",
    verticalAlign: "middle",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
    },
  },
  navIcon: {
    fontSize: 22,
    display: "block",
  },
  badge: {
    display: "inline-flex",
    "& .MuiBadge-badge": {
      fontSize: "0.65rem",
      fontWeight: 700,
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      top: 4,
      right: 4,
      left: "auto",
      transform: "scale(1) translate(30%, -45%)",
    },
  },
}));

function NavIconLink({ href, label, count, children }) {
  const classes = useStyles();
  const showBadge = count > 0;

  const icon = showBadge ? (
    <Badge
      badgeContent={count > 99 ? "99+" : count}
      color="secondary"
      className={classes.badge}
      overlap="circle"
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {children}
    </Badge>
  ) : (
    children
  );

  return (
    <Box className={classes.slot}>
      <Tooltip title={label}>
        <Link href={href} passHref>
          <IconButton
            className={classes.iconBtn}
            color="inherit"
            aria-label={label}
            component="a"
          >
            {icon}
          </IconButton>
        </Link>
      </Tooltip>
    </Box>
  );
}

export default function NavbarActions({ user }) {
  const classes = useStyles();
  const { messageCount, notificationCount } = useUnreadCounts(user);

  return (
    <Box className={classes.root}>
      <NavIconLink href="/messages" label="Messages" count={messageCount}>
        <MailIcon className={classes.navIcon} />
      </NavIconLink>

      <NavIconLink
        href="/notifications"
        label="Notifications"
        count={notificationCount}
      >
        <NotificationsIcon className={classes.navIcon} />
      </NavIconLink>

      <Box className={classes.slot}>
        <Tooltip title="Logout">
          <IconButton
            className={classes.iconBtn}
            color="inherit"
            aria-label="Logout"
            onClick={() => logoutUser(user.email)}
          >
            <ExitToAppIcon className={classes.navIcon} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
