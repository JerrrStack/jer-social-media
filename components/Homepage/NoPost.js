import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 2),
    borderRadius: 16,
    textAlign: "center",
    backgroundColor: theme.palette.primary.light + "22",
    border: `1px solid ${theme.palette.primary.light}55`,
    color: theme.palette.text.secondary,
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  icon: {
    color: theme.palette.primary.main,
    fontSize: 32,
  },
}));

export default function NoPost() {
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={0}>
      <div className={classes.inner}>
        <SentimentVeryDissatisfiedIcon className={classes.icon} />
        <Typography variant="body1">
          No posts yet. Follow someone to see their updates in your feed.
        </Typography>
      </div>
    </Paper>
  );
}
