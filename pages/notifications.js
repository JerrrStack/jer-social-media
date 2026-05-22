import { Box, makeStyles, Paper, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import NoNotifications from "../components/Notifications/NoNotifications";
import LikeNotification from "../components/Notifications/LikeNotification";
import CommentNotification from "../components/Notifications/CommentNotification";
import FollowerNotification from "../components/Notifications/FollowerNotification";

const useStyle = makeStyles((theme) => ({
  page: {
    width: "100%",
    maxWidth: 720,
    margin: "0 auto",
    padding: theme.spacing(0, 0.5),
    boxSizing: "border-box",
    [theme.breakpoints.up("sm")]: {
      padding: 0,
    },
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(1.5),
  },
  notificationContent: {
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "calc(100vh - 160px)",
    overflowY: "auto",
  },
}));

function notifications({
  notifications: notificationList,
  errorLoading,
  user,
  userFollowStats: initialFollowStats,
}) {
  const classes = useStyle();
  const [userFollowStats, setUserFollowStats] = useState(
    initialFollowStats || { following: [], followers: [] }
  );

  useEffect(() => {
    const markAsReadNotif = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/notifications`,
          {},
          { headers: { Authorization: cookie.get("token") } }
        );
      } catch (error) {
        console.log(error);
      }
    };

    markAsReadNotif();
  }, []);

  return (
    <Box className={classes.page}>
      <Typography variant="h6" className={classes.title}>
        Notifications
      </Typography>

      {notificationList.length > 0 ? (
        <Paper className={classes.notificationContent} elevation={1}>
          {notificationList.map((notification) => (
            <React.Fragment key={notification._id}>
              {notification.type === "newLike" && notification.post !== null && (
                <LikeNotification notification={notification} />
              )}

              {notification.type === "newComment" &&
                notification.post !== null && (
                  <CommentNotification notification={notification} />
                )}

              {notification.type === "newFollower" && (
                <FollowerNotification
                  notification={notification}
                  user={user}
                  userFollowStats={userFollowStats}
                  onFollowStatsChange={setUserFollowStats}
                />
              )}
            </React.Fragment>
          ))}
        </Paper>
      ) : (
        <NoNotifications />
      )}
    </Box>
  );
}

notifications.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/notifications`, {
      headers: { Authorization: token },
    });

    return { notifications: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default notifications;
