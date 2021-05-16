import {
  List,
  ListItem,
  IconButton,
  Avatar,
  Typography,
  ListItemAvatar,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import checkTime from "../../utils/checkTime";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import { green } from "@material-ui/core/colors";
import DeleteIcon from "@material-ui/icons/Delete";
const useStyle = makeStyles({
  root: {
    maxHeight: "76vh",
    overflow: "auto",
  },
});

const themeGreen = createMuiTheme({
  palette: {
    primary: green,
  },
});

function Chat({ chat, deleteChat, chatIndex, connectedUsers }) {
  const router = useRouter();
  const classes = useStyle();
  const isOnline =
    connectedUsers.length > 0 &&
    connectedUsers.filter((user) => user.userId === chat.messagesWith).length >
      0;
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  useEffect(
    (event) => {
      {
        router.query.message === chat.messagesWith
          ? handleListItemClick(event, chatIndex)
          : setSelectedIndex(null);
      }
    },
    [router.query.message]
  );

  return (
    <>
      <List
        disablePadding={true}
        className={classes.root}
        component="div"
        aria-label="main mailbox folders"
        onClick={() =>
          router.push(`/messages?message=${chat.messagesWith}`, undefined, {
            shallow: true,
          })
        }
      >
        <ListItem button selected={selectedIndex === chatIndex}>
          <ListItemAvatar>
            <Avatar src={chat.profilePicUrl} />
          </ListItemAvatar>

          <ListItemText
            primary={
              <>
                {chat.name}
                <span style={{ marginLeft: 5 }}>
                  <Typography variant="caption">
                    {checkTime(chat.date)}
                  </Typography>
                </span>
                <span style={{ float: "right" }}>
                  <IconButton
                    size="small"
                    onClick={() => deleteChat(chat.messagesWith)}
                  >
                    <DeleteIcon color="secondary" style={{ fontSize: 14 }} />
                  </IconButton>
                </span>
              </>
            }
            secondary={
              <>
                {chat.lastMessage.length > 20
                  ? `${chat.lastMessage.substring(0, 20)}...`
                  : chat.lastMessage}

                <span
                  style={{
                    float: "right",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {isOnline ? (
                    <ThemeProvider theme={themeGreen}>
                      <Typography variant="caption">Online</Typography>
                      <FiberManualRecordIcon
                        color="primary"
                        style={{ fontSize: 12 }}
                      />
                    </ThemeProvider>
                  ) : (
                    <>
                      <Typography variant="caption">Offline</Typography>
                      <FiberManualRecordIcon
                        style={{ fontSize: 12 }}
                        style={{ fontSize: 12 }}
                      />
                    </>
                  )}
                </span>
              </>
            }
          />
        </ListItem>
      </List>
    </>
  );
}

export default Chat;
