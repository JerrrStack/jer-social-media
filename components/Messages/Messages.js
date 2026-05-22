import React, { useState } from "react";
import { makeStyles, Typography, IconButton, Avatar, Box } from "@material-ui/core";
import checkTime from "../../utils/checkTime";
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles((theme) => ({
  row: {
    display: "flex",
    marginBottom: theme.spacing(1.5),
    alignItems: "flex-end",
    gap: theme.spacing(1),
  },
  rowSent: {
    justifyContent: "flex-end",
  },
  rowReceived: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "70%",
    padding: theme.spacing(1, 1.5),
    borderRadius: 16,
    wordBreak: "break-word",
  },
  bubbleSent: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.primary,
    borderBottomLeftRadius: 4,
  },
  time: {
    display: "block",
    marginTop: 4,
    fontSize: "0.7rem",
    opacity: 0.85,
  },
  avatar: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },
  deleteBtn: {
    padding: 4,
    opacity: 0,
    transition: "opacity 0.15s",
    "$row:hover &": {
      opacity: 1,
    },
  },
}));

function MessageItem({
  message,
  user,
  userProfilePic,
  divRef,
  deleteMsg,
}) {
  const classes = useStyles();
  const [ifHover, setIfHover] = useState(false);
  const ifYouSender = message.sender === user._id;

  return (
    <Box
      component="div"
      ref={divRef}
      className={`${classes.row} ${
        ifYouSender ? classes.rowSent : classes.rowReceived
      }`}
      onMouseEnter={() => setIfHover(true)}
      onMouseLeave={() => setIfHover(false)}
    >
      {!ifYouSender && (
        <Avatar
          src={userProfilePic}
          className={classes.avatar}
          alt=""
        />
      )}

      {ifYouSender && ifHover && (
        <IconButton
          size="small"
          className={classes.deleteBtn}
          style={{ opacity: 1 }}
          onClick={() => deleteMsg(message._id)}
        >
          <DeleteIcon color="secondary" style={{ fontSize: 16 }} />
        </IconButton>
      )}

      <Box
        className={`${classes.bubble} ${
          ifYouSender ? classes.bubbleSent : classes.bubbleReceived
        }`}
      >
        <Typography variant="body2" style={{ lineHeight: 1.4 }}>
          {message.msg}
        </Typography>
        <Typography
          component="span"
          className={classes.time}
          variant="caption"
        >
          {checkTime(message.date)}
        </Typography>
      </Box>

      {ifYouSender && (
        <Avatar src={user.profilePicUrl} className={classes.avatar} alt="" />
      )}
    </Box>
  );
}

export default MessageItem;
