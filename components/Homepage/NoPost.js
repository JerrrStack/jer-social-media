import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import DynamicFeedIcon from "@material-ui/icons/DynamicFeed";

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
  btn: {
    marginTop: theme.spacing(1),
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 8,
  },
}));

export default function NoPost({ filtered, tag, onClearFilter }) {
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={0}>
      <div className={classes.inner}>
        <SentimentVeryDissatisfiedIcon className={classes.icon} />
        {filtered ? (
          <>
            <Typography variant="body1">
              No posts with #{tag} in your feed yet.
            </Typography>
            <Button
              color="primary"
              variant="contained"
              className={classes.btn}
              startIcon={<DynamicFeedIcon />}
              onClick={onClearFilter}
            >
              Latest news feed
            </Button>
          </>
        ) : (
          <Typography variant="body1">
            No posts yet. Follow someone to see their updates in your feed.
          </Typography>
        )}
      </div>
    </Paper>
  );
}
