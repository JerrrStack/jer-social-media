import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import MailIcon from "@material-ui/icons/Mail";
import NotificationsIcon from "@material-ui/icons/Notifications";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PersonIcon from "@material-ui/icons/Person";
import Search from "../Homepage/Search";
import { logoutUser } from "../../utils/authUser";
import { getDisplayName, getProfilePath } from "../../utils/displayUser";
import useUnreadCounts from "../../utils/useUnreadCounts";

const DRAWER_WIDTH = 300;

const useStyles = makeStyles((theme) => ({
  menuBtn: {
    color: "#fff",
    padding: 8,
  },
  drawerPaper: {
    width: DRAWER_WIDTH,
    maxWidth: "88vw",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2, 2, 1),
  },
  drawerTitle: {
    fontWeight: 700,
    fontSize: "1.1rem",
  },
  searchBlock: {
    padding: theme.spacing(0, 2, 2),
  },
  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2, 2),
    textDecoration: "none",
    color: "inherit",
  },
  profileName: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  listItem: {
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
  },
  listIcon: {
    minWidth: 40,
    color: theme.palette.primary.main,
  },
  badge: {
    "& .MuiBadge-badge": {
      fontSize: "0.7rem",
      fontWeight: 700,
    },
  },
  countPill: {
    marginLeft: "auto",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 10,
    padding: "2px 8px",
    lineHeight: 1.3,
  },
}));

function MenuLinkItem({ href, icon, label, count, onNavigate }) {
  const classes = useStyles();

  return (
    <Link href={href} passHref>
      <ListItem
        button
        component="a"
        className={classes.listItem}
        onClick={onNavigate}
      >
        <ListItemIcon className={classes.listIcon}>{icon}</ListItemIcon>
        <ListItemText primary={label} />
        {count > 0 ? (
          <span className={classes.countPill}>
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </ListItem>
    </Link>
  );
}

export default function NavbarMobileMenu({ user }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { messageCount, notificationCount } = useUnreadCounts(user);

  const close = () => setOpen(false);

  const totalBadge = messageCount + notificationCount;

  return (
    <>
      <IconButton
        className={classes.menuBtn}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        {totalBadge > 0 ? (
          <Badge
            badgeContent={totalBadge > 99 ? "99+" : totalBadge}
            color="secondary"
            className={classes.badge}
            overlap="circle"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuIcon />
          </Badge>
        ) : (
          <MenuIcon />
        )}
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={close}
        classes={{ paper: classes.drawerPaper }}
        ModalProps={{ keepMounted: true }}
      >
        <Box className={classes.drawerHeader}>
          <Typography className={classes.drawerTitle}>Menu</Typography>
          <IconButton aria-label="Close menu" onClick={close} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>

        <Link href={getProfilePath(user)} passHref>
          <a className={classes.profileRow} onClick={close}>
            <Avatar
              src={user.profilePicUrl}
              alt={getDisplayName(user)}
              style={{ width: 44, height: 44 }}
            />
            <Typography className={classes.profileName}>
              {getDisplayName(user)}
            </Typography>
          </a>
        </Link>

        <Box className={classes.searchBlock}>
          <Search fullWidth variant="light" onNavigate={close} />
        </Box>

        <Divider />

        <List disablePadding>
          <MenuLinkItem
            href={getProfilePath(user)}
            icon={<PersonIcon />}
            label="My profile"
            onNavigate={close}
          />
          <MenuLinkItem
            href="/messages"
            icon={<MailIcon />}
            label="Messages"
            count={messageCount}
            onNavigate={close}
          />
          <MenuLinkItem
            href="/notifications"
            icon={<NotificationsIcon />}
            label="Notifications"
            count={notificationCount}
            onNavigate={close}
          />
          <ListItem
            button
            className={classes.listItem}
            onClick={() => {
              close();
              logoutUser(user.email);
            }}
          >
            <ListItemIcon className={classes.listIcon}>
              <ExitToAppIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
