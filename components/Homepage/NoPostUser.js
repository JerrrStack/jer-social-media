import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: theme.palette.grey[50],
    border: `1px dashed ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
  },
}));

export default function NoPostUser({ isOwnProfile }) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography variant="body2">
        {isOwnProfile
          ? "You haven't posted yet. Share something from the home feed."
          : "No posts from this person yet."}
      </Typography>
    </Box>
  );
}
