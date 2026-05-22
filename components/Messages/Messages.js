import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Avatar, Box, IconButton } from "@material-ui/core";
import checkTime from "../../utils/checkTime";
import DeleteIcon from "@material-ui/icons/Delete";
const useStyles = makeStyles({
  root: {},
});

const Messages = ({ message, user, userProfilePic, divRef, deleteMsg }) => {
  const classes = useStyles();
  const [ifHover, setIfHover] = useState(false);

  const ifYouSender = message.sender === user._id;
  return (
    <Box components="div" className={classes.root} ref={divRef}>
      <List>
        <ListItem
          onMouseOver={() => setIfHover(true)}
          onMouseLeave={() => setIfHover(false)}
        >
          {!ifYouSender && (
            <>
              <Avatar
                src={ifYouSender ? user.profilePicUrl : userProfilePic}
                style={{ marginRight: 5 }}
              />
            </>
          )}
          {ifYouSender && (
            <IconButton onClick={() => deleteMsg(message._id)}>
              {ifHover && (
                <DeleteIcon color="secondary" style={{ fontSize: 14 }} />
              )}
            </IconButton>
          )}

          <ListItemText
            align={ifYouSender ? "right" : "left"}
            primary={message.msg}
            secondary={checkTime(message.date)}
          />
          {ifYouSender && (
            <Avatar
              src={ifYouSender ? user.profilePicUrl : userProfilePic}
              style={{ marginLeft: 5 }}
            />
          )}
          {!ifYouSender && (
            <span>{ifHover && <DeleteIcon color="secondary" />}</span>
          )}
        </ListItem>
      </List>
    </Box>
  );
};

export default Messages;
