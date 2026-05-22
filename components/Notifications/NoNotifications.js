import React from "react";
import { makeStyles, Paper, Typography, Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 2),
    borderRadius: 12,
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function NoNotifications() {
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={1}>
      <Typography variant="body1">No notifications yet.</Typography>
    </Paper>
  );
}
