import React, { useState } from "react";
import { makeStyles, Typography, IconButton, Avatar, Box } from "@material-ui/core";
import checkTime from "../../utils/checkTime";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  isMediaMessage,
  renderMentionText,
} from "../../utils/renderMentions";

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
    borderRadius: 18,
    wordBreak: "break-word",
  },
  bubbleSent: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: "#E4E6EB",
    color: theme.palette.text.primary,
    borderBottomLeftRadius: 4,
  },
  mediaBubble: {
    padding: 4,
    backgroundColor: "transparent",
    maxWidth: "72%",
  },
  mediaImg: {
    display: "block",
    width: "100%",
    maxWidth: 240,
    borderRadius: 14,
    backgroundColor: "#111",
  },
  mention: {
    color: "inherit",
    fontWeight: 700,
    textDecoration: "underline",
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
  const isMedia = isMediaMessage(message.msg);

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
        <Avatar src={userProfilePic} className={classes.avatar} alt="" />
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
          isMedia
            ? classes.mediaBubble
            : ifYouSender
            ? classes.bubbleSent
            : classes.bubbleReceived
        }`}
      >
        {isMedia ? (
          <img
            src={message.msg.trim()}
            alt="GIF"
            className={classes.mediaImg}
            loading="lazy"
          />
        ) : (
          <Typography variant="body2" style={{ lineHeight: 1.4 }}>
            {renderMentionText(message.msg, classes.mention)}
          </Typography>
        )}
        <Typography
          component="span"
          className={classes.time}
          variant="caption"
          style={isMedia ? { color: "#65676B", paddingLeft: 4 } : undefined}
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
