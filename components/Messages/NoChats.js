import React from "react";
import { makeStyles, Typography, Box } from "@material-ui/core";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(3, 2),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
}));

export default function NoChats() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <SentimentVeryDissatisfiedIcon fontSize="small" />
      <Typography variant="body2">No chats yet — search above to start one</Typography>
    </Box>
  );
}
