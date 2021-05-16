import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    backgroundColor: "#9CC3D5FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  content: {
    width: "100%",
  },
}));

export default function NoPostUser() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        This person is too lazy to post something.
      </CardContent>
    </Card>
  );
}
