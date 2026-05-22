import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import checkTime from "../../utils/checkTime";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteCommentPopup from "../Post/DeleteCommentPopup";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "",
    textAlign: "center",
    width: "80%",
    margin: "auto",

    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  inputField: {
    height: "auto",
    margin: 5,
    width: "50%",
    ["&,fieldset"]: {
      borderRadius: 15,
    },
  },
  commentField: {
    textAlign: "justify",
    justifyContent: "center",
  },
  message: {
    color: "#00000",
  },
  user: {
    display: "flex",
  },
  userName: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
  },
  commentDate: {
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
  },
}));

function AllComments({ user, post, setComments, comment }) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card className={classes.root}>
      <CardContent>
        <Box component="div" className={classes.commentField}>
          <Box className={classes.user}>
            <Link color="inherit" href={`/${comment.user.name}`}>
              <Avatar
                alt={comment.user.name}
                src={comment.user.profilePicUrl}
                style={{ marginRight: 10 }}
              />
            </Link>
            <Typography
              gutterBottom
              display="inline"
              variant="body2"
              className={classes.userName}
            >
              <Link color="inherit" href={`/${comment.user.name}`}>
                <span>{comment.user.name}</span>
              </Link>
            </Typography>
            <Box component="span" className={classes.commentDate}>
              <Typography
                gutterBottom
                display="inline"
                variant="caption"
                color="textSecondary"
              >
                <span>{checkTime(comment.date)}</span>
              </Typography>
              {user._id === comment.user._id ? (
                <>
                  <Button
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <MoreVertIcon />
                  </Button>
                  <Menu
                    id="fade-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem
                      onClick={handleClose}
                      style={{
                        backgroundColor: "transparent",
                        cursor: "default",
                      }}
                    >
                      <DeleteCommentPopup
                        post={post}
                        setComments={setComments}
                        comment={comment}
                      />
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <></>
              )}
            </Box>
          </Box>

          <CardContent className={classes.message}>
            <Typography display="inline" variant="body2">
              {comment.text}
            </Typography>
          </CardContent>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AllComments;
