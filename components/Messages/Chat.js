import {
  ListItem,
  IconButton,
  Avatar,
  Typography,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Box,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import checkTime from "../../utils/checkTime";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import { green, grey } from "@material-ui/core/colors";
import DeleteIcon from "@material-ui/icons/Delete";
import { getDisplayName } from "../../utils/displayUser";

const useStyles = makeStyles((theme) => ({
  item: {
    padding: theme.spacing(1.25, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&.Mui-selected": {
      backgroundColor: "rgba(25, 118, 210, 0.08)",
    },
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
  },
  primaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    width: "100%",
  },
  name: {
    fontWeight: 600,
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
  },
  time: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    flexShrink: 0,
  },
  secondaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(0.5),
    marginTop: 2,
  },
  preview: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
    fontSize: "0.65rem",
    color: theme.palette.text.secondary,
  },
  deleteBtn: {
    padding: 4,
  },
}));

const themeGreen = createMuiTheme({
  palette: { primary: green },
});

function Chat({ chat, deleteChat, chatIndex, connectedUsers }) {
  const router = useRouter();
  const classes = useStyles();
  const isOnline =
    connectedUsers.length > 0 &&
    connectedUsers.some((u) => u.userId === chat.messagesWith);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const displayName = getDisplayName(chat);

  useEffect(() => {
    if (router.query.message === chat.messagesWith) {
      setSelectedIndex(chatIndex);
    } else {
      setSelectedIndex(null);
    }
  }, [router.query.message, chat.messagesWith, chatIndex]);

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteChat(chat.messagesWith);
  };

  const preview =
    chat.lastMessage?.length > 28
      ? `${chat.lastMessage.substring(0, 28)}...`
      : chat.lastMessage || "No messages yet";

  return (
    <ListItem
      button
      selected={selectedIndex === chatIndex}
      className={classes.item}
      onClick={() =>
        router.push(`/messages?message=${chat.messagesWith}`, undefined, {
          shallow: true,
        })
      }
    >
      <ListItemAvatar>
        <Avatar src={chat.profilePicUrl} alt={displayName} />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Box className={classes.primaryRow}>
            <Typography className={classes.name} component="span">
              {displayName}
            </Typography>
            <Typography className={classes.time} component="span">
              {chat.date ? checkTime(chat.date) : ""}
            </Typography>
            <IconButton
              size="small"
              className={classes.deleteBtn}
              onClick={handleDelete}
              aria-label="Delete chat"
            >
              <DeleteIcon color="secondary" style={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        }
        secondary={
          <Box className={classes.secondaryRow}>
            <Typography className={classes.preview} component="span">
              {preview}
            </Typography>
            <Box className={classes.status}>
              {isOnline ? (
                <ThemeProvider theme={themeGreen}>
                  <Typography variant="caption" style={{ color: green[600] }}>
                    Online
                  </Typography>
                  <FiberManualRecordIcon color="primary" style={{ fontSize: 10 }} />
                </ThemeProvider>
              ) : (
                <>
                  <Typography variant="caption">Offline</Typography>
                  <FiberManualRecordIcon style={{ fontSize: 10, color: grey[400] }} />
                </>
              )}
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
}

export default Chat;
