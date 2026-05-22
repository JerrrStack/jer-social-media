import {
  Avatar,
  Card,
  CardHeader,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React from "react";
import checkTime from "../../utils/checkTime";
const useStyles = makeStyles((theme) => ({
  root: {},
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));
function FollowerNotification({ notification }) {
  const classes = useStyles();
  return (
    <>
      <Card className={classes.root}>
        <CardHeader
          avatar={
            <Avatar
              src={notification.user.profilePicUrl}
              className={classes.small}
              component="span"
            />
          }
          action={
            <Typography variant="caption">
              {checkTime(notification.date)}
            </Typography>
          }
          title={
            <>
              <Link href={`/${notification.user.username}`}>
                {notification.user.name}
              </Link>
              &nbsp;Followed you.
            </>
          }
        />
      </Card>
    </>
  );
}

export default FollowerNotification;
