import { Avatar, Box, Typography } from "@material-ui/core";
import React from "react";
import { getDisplayName } from "../../utils/displayUser";
import checkTime from "../../utils/checkTime";
import ProfileLink from "../Profile/ProfileLink";
import { useNotificationStyles } from "./notificationStyles";

function FollowerNotification({
  notification,
  user,
  userFollowStats,
  onFollowStatsChange,
}) {
  const classes = useNotificationStyles();
  const displayName = getDisplayName(notification.user);

  return (
    <Box className={classes.item}>
      <ProfileLink
        user={notification.user}
        currentUser={user}
        userFollowStats={userFollowStats}
        onFollowStatsChange={onFollowStatsChange}
      >
        <Avatar
          src={notification.user.profilePicUrl}
          className={classes.avatar}
          alt={displayName}
        />
      </ProfileLink>
      <Box className={classes.body}>
        <Typography className={classes.text}>
          <ProfileLink
            user={notification.user}
            currentUser={user}
            userFollowStats={userFollowStats}
            onFollowStatsChange={onFollowStatsChange}
          >
            <strong>{displayName}</strong>
          </ProfileLink>{" "}
          started following you.
        </Typography>
      </Box>
      <Typography className={classes.time}>{checkTime(notification.date)}</Typography>
    </Box>
  );
}

export default FollowerNotification;
