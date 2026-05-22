import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import MessageIcon from "@material-ui/icons/Message";
import Router from "next/router";
import { getDisplayName, getProfilePath } from "../../utils/displayUser";
import { followUser, unfollowUser } from "../../utils/profileActions";
import Link from "next/link";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 320,
    maxWidth: "90vw",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: theme.shadows[12],
    border: `1px solid ${theme.palette.divider}`,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: "#fff",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    color: "#fff",
    padding: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    border: "3px solid #fff",
    flexShrink: 0,
  },
  name: {
    fontWeight: 700,
    fontSize: "1.1rem",
    lineHeight: 1.2,
    color: "#fff",
    paddingRight: theme.spacing(3),
  },
  handle: {
    fontSize: "0.8rem",
    opacity: 0.9,
    marginTop: 4,
  },
  body: {
    padding: theme.spacing(2),
  },
  bio: {
    fontSize: "0.875rem",
    lineHeight: 1.45,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  website: {
    fontSize: "0.8rem",
    color: theme.palette.primary.main,
    wordBreak: "break-all",
    display: "block",
    marginBottom: theme.spacing(1),
  },
  stats: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
    "& > *": {
      flex: 1,
    },
  },
  actionBtn: {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 8,
  },
  viewLink: {
    display: "block",
    textAlign: "center",
    marginTop: theme.spacing(1.5),
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
}));

export default function ProfileHoverCard({
  preview,
  loading,
  profileUserId,
  currentUser,
  userFollowStats,
  onFollowStatsChange,
  onClose,
}) {
  const classes = useStyles();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const profile = preview?.profile;
  const user = profile?.user;

  useEffect(() => {
    if (!profileUserId || !userFollowStats?.following) {
      setIsFollowing(false);
      return;
    }
    setIsFollowing(
      userFollowStats.following.some(
        (f) => String(f.user) === String(profileUserId)
      )
    );
  }, [profileUserId, userFollowStats, preview]);

  const openMessage = () => {
    Router.push(`/messages?message=${profileUserId}`);
    onClose?.();
  };

  const toggleFollow = async () => {
    if (!onFollowStatsChange) return;
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileUserId, onFollowStatsChange);
        setIsFollowing(false);
      } else {
        await followUser(profileUserId, onFollowStatsChange);
        setIsFollowing(true);
      }
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <Paper className={classes.paper} elevation={8}>
        <Box className={classes.loading}>
          <CircularProgress size={28} />
        </Box>
      </Paper>
    );
  }

  if (!user) {
    return (
      <Paper className={classes.paper} elevation={8}>
        <Box className={classes.body}>
          <Typography variant="body2" color="textSecondary">
            Could not load profile
          </Typography>
        </Box>
      </Paper>
    );
  }

  const displayName = getDisplayName(user);
  const followersLength = preview?.followersLength ?? 0;

  return (
    <Paper
      className={classes.paper}
      elevation={8}
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <Box className={classes.header}>
        <IconButton
          className={classes.closeBtn}
          size="small"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Avatar
          src={user.profilePicUrl || undefined}
          alt={displayName}
          className={classes.avatar}
        />
        <Box minWidth={0}>
          <Typography className={classes.name} noWrap>
            {displayName}
          </Typography>
          <Typography className={classes.handle}>@{user.username}</Typography>
        </Box>
      </Box>

      <Box className={classes.body}>
        {profile.bio ? (
          <Typography className={classes.bio}>{profile.bio}</Typography>
        ) : (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            No bio yet
          </Typography>
        )}
        {profile.website && (
          <Typography
            component="a"
            className={classes.website}
            href={
              profile.website.startsWith("http")
                ? profile.website
                : `https://${profile.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile.website}
          </Typography>
        )}
        <Typography className={classes.stats}>
          {followersLength} follower{followersLength !== 1 ? "s" : ""}
        </Typography>

        <Box className={classes.actions}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={classes.actionBtn}
            startIcon={<MessageIcon />}
            onClick={openMessage}
          >
            Message
          </Button>
          <Button
            variant={isFollowing ? "outlined" : "contained"}
            color={isFollowing ? "default" : "primary"}
            size="small"
            className={classes.actionBtn}
            disabled={followBusy}
            onClick={toggleFollow}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </Box>

        <Link href={getProfilePath(user)}>
          <Typography
            component="a"
            color="primary"
            className={classes.viewLink}
            onClick={onClose}
          >
            View full profile
          </Typography>
        </Link>
      </Box>
    </Paper>
  );
}
