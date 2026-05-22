import { Avatar, Box, Divider, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { getDisplayName } from "../../utils/displayUser";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  name: {
    fontWeight: 600,
    fontSize: "1rem",
  },
}));

function UserInfo({ chatWithData }) {
  const classes = useStyles();
  const displayName = getDisplayName(chatWithData);

  return (
    <>
      <Box className={classes.header}>
        <Avatar
          alt={displayName}
          src={chatWithData.profilePicUrl}
          className={classes.avatar}
        />
        <Typography className={classes.name}>{displayName}</Typography>
      </Box>
      <Divider />
    </>
  );
}

export default UserInfo;
