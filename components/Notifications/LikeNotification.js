import { Avatar, Box, Link, Typography } from "@material-ui/core";
import React from "react";
import checkTime from "../../utils/checkTime";
import { getDisplayName } from "../../utils/displayUser";
import { useNotificationStyles } from "./notificationStyles";

function LikeNotification({ notification }) {
  const classes = useNotificationStyles();

  return (
    <Box className={classes.item}>
      <Avatar
        src={notification.user.profilePicUrl}
        className={classes.avatar}
        alt={getDisplayName(notification.user)}
      />
      <Box className={classes.body}>
        <Typography className={classes.text}>
          <strong>{getDisplayName(notification.user)}</strong> liked your{" "}
          <Link href={`/post/${notification.post._id}`} className={classes.link}>
            post
          </Link>
          .
        </Typography>
      </Box>
      <Typography className={classes.time}>{checkTime(notification.date)}</Typography>
    </Box>
  );
}

export default LikeNotification;
