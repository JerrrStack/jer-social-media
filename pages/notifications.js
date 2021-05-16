import { Box, List, makeStyles, Paper, Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import NoNotifications from "../components/Notifications/NoNotifications";
import LikeNotification from "../components/Notifications/LikeNotification";
import CommentNotification from "../components/Notifications/CommentNotification";
import FollowerNotification from "../components/Notifications/FollowerNotification";

const useStyle = makeStyles(() => ({
  root: {
    minHeight: "70vh",
  },
  notificationContent: {
    maxHeight: "70vh",
    minHeight: "70vh",
    overflow: "auto",
  },
}));

function notifications({ notifications, errorLoading, user, userFollowStats }) {
  const classes = useStyle();

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
    <>
      <Box component="div" className={classes.root}>
        <Typography>Notifications</Typography>
        {notifications.length > 0 ? (
          <Paper className={classes.notificationContent}>
            <div>
              {notifications.map((notification) => (
                <React.Fragment key={notification._id}>
                  {notification.type === "newLike" &&
                    notification.post !== null && (
                      <LikeNotification
                        key={notification._id}
                        notification={notification}
                      />
                    )}

                  {notification.type === "newComment" &&
                    notification.post !== null && (
                      <CommentNotification
                        key={notification._id}
                        notification={notification}
                      />
                    )}

                  {notification.type === "newFollower" && (
                    <FollowerNotification
                      key={notification._id}
                      notification={notification}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </Paper>
        ) : (
          <NoNotifications />
        )}
      </Box>
    </>
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
