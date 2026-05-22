import React from "react";
import { getDisplayName, getProfilePath } from "../../utils/displayUser";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PeopleIcon from "@material-ui/icons/People";
import { Avatar, CardContent, Link } from "@material-ui/core";
import Search from "./Search";
import CustomMenuButton from "../Homepage/CustomMenuButton";
const useStyles = makeStyles({
  root: {
    position: "sticky",
    top: "3rem",
    minWidth: "275",
    "&,span": {
      paddingRight: 5,
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 14,
  },
  CardContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default function Sidebar({ user }) {
  const classes = useStyles();

  return (
    <Card className={classes.root} elevation={15}>
      <CardContent className={classes.CardContent}>
        <Button color="inherit">
          <Link
            color="inherit"
            href={getProfilePath(user)}
            className={classes.userContent}
          >
            <Avatar
              alt={getDisplayName(user)}
              src={user.profilePicUrl}
              style={{ marginRight: 10, height: "30px", width: "30px" }}
              size="small"
            />

            <Typography display="inline" variant="body2">
              <span>{getDisplayName(user)}</span>
            </Typography>
          </Link>
        </Button>
        <Search />
        <CustomMenuButton user={user} />
      </CardContent>
    </Card>
  );
}
