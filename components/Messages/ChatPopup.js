import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import SearchIcon from "@material-ui/icons/Search";
import axios from "axios";
import cookie from "js-cookie";
import io from "socket.io-client";
import { useRouter } from "next/router";
import baseUrl from "../../utils/baseUrl";
import checkTime from "../../utils/checkTime";
import { isMediaMessage } from "../../utils/renderMentions";
import Messages from "./Messages";
import ChatInputField from "./ChatInputField";
import getUserInfo from "../../utils/getUserInfo";

const useStyles = makeStyles((theme) => ({
  launcher: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 1300,
    width: 56,
    height: 56,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    boxShadow: "0 8px 24px rgba(24,119,242,0.35)",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  panel: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 1300,
    width: 380,
    maxWidth: "calc(100vw - 24px)",
    height: 520,
    maxHeight: "calc(100vh - 96px)",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 1.25),
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: 52,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    minWidth: 0,
    flex: 1,
  },
  title: {
    fontWeight: 800,
    fontSize: "1.05rem",
  },
  chatTitle: {
    fontWeight: 700,
    fontSize: "0.95rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  search: {
    padding: theme.spacing(1, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "& .MuiOutlinedInput-root": {
      borderRadius: 20,
      backgroundColor: "#F0F2F5",
      "& fieldset": { border: "none" },
    },
    "& .MuiOutlinedInput-input": {
      padding: "8px 0",
    },
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: 0,
  },
  item: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.03)",
    },
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    fontWeight: 700,
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  nameUnread: {
    fontWeight: 800,
  },
  time: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    flexShrink: 0,
  },
  preview: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  previewUnread: {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    flexShrink: 0,
    marginLeft: 6,
  },
  empty: {
    padding: theme.spacing(4, 2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  thread: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(1.5),
    background: "linear-gradient(180deg, #F0F2F5 0%, #E8EAED 100%)",
    minHeight: 0,
  },
  inputArea: {
    flexShrink: 0,
    padding: theme.spacing(1, 1.25),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

function ChatPopup({ user }) {
  const classes = useStyles();
  const router = useRouter();
  const socket = useRef();
  const divRef = useRef();
  const openChatId = useRef("");

  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatWithData, setChatWithData] = useState({
    name: "",
    profilePicUrl: "",
  });

  const hideOnMessages = router.pathname === "/messages";
  const unreadCount = chats.filter((c) => c.unread).length;

  useEffect(() => {
    if (!user?._id || hideOnMessages) return undefined;

    const s = io(baseUrl);
    socket.current = s;
    s.emit("join", { userId: user._id });

    return () => {
      s.disconnect();
      socket.current = null;
    };
  }, [user?._id, hideOnMessages]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const token = cookie.get("token");
      const res = await axios.get(`${baseUrl}/api/chats`, {
        headers: { Authorization: token },
      });
      setChats(res.data || []);
    } catch {
      setChats([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!open || hideOnMessages) return;
    loadChats();
  }, [open, hideOnMessages]);

  useEffect(() => {
    const s = socket.current;
    if (!s || !activeChat) return undefined;

    const messagesWith = activeChat.messagesWith;

    const onMessagesLoaded = ({ chat }) => {
      setMessages(chat.messages || []);
      setChatWithData({
        name: chat.messagesWith.name,
        profilePicUrl: chat.messagesWith.profilePicUrl,
      });
      openChatId.current = chat.messagesWith._id;
      setChats((prev) =>
        prev.map((c) =>
          c.messagesWith === messagesWith ? { ...c, unread: false } : c
        )
      );
      setTimeout(() => {
        if (divRef.current) {
          divRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    };

    const onNoChatFound = async () => {
      const info = await getUserInfo(messagesWith);
      setChatWithData({
        name: info.name,
        profilePicUrl: info.profilePicUrl,
      });
      setMessages([]);
      openChatId.current = messagesWith;
    };

    s.emit("loadMessages", {
      userId: user._id,
      messagesWith,
    });
    s.on("messagesLoaded", onMessagesLoaded);
    s.on("noChatFound", onNoChatFound);

    return () => {
      s.off("messagesLoaded", onMessagesLoaded);
      s.off("noChatFound", onNoChatFound);
    };
  }, [activeChat, user._id]);

  useEffect(() => {
    const s = socket.current;
    if (!s) return undefined;

    const onMsgSent = ({ newMsg }) => {
      if (newMsg.receiver === openChatId.current) {
        setMessages((prev) => [...prev, newMsg]);
        setChats((prev) => {
          const next = prev.map((chat) =>
            chat.messagesWith === newMsg.receiver
              ? {
                  ...chat,
                  lastMessage: newMsg.msg,
                  date: newMsg.date,
                  unread: false,
                }
              : chat
          );
          return [...next];
        });
      }
    };

    const onNewMsgReceived = async ({ newMsg }) => {
      if (newMsg.sender === openChatId.current) {
        setMessages((prev) => [...prev, newMsg]);
        setChats((prev) =>
          prev.map((chat) =>
            chat.messagesWith === newMsg.sender
              ? {
                  ...chat,
                  lastMessage: newMsg.msg,
                  date: newMsg.date,
                  unread: false,
                }
              : chat
          )
        );
        return;
      }

      const exists = chats.some((c) => c.messagesWith === newMsg.sender);
      if (exists) {
        setChats((prev) => {
          const updated = prev.map((chat) =>
            chat.messagesWith === newMsg.sender
              ? {
                  ...chat,
                  lastMessage: newMsg.msg,
                  date: newMsg.date,
                  unread: true,
                }
              : chat
          );
          const hit = updated.find((c) => c.messagesWith === newMsg.sender);
          return [
            hit,
            ...updated.filter((c) => c.messagesWith !== newMsg.sender),
          ];
        });
      } else {
        const info = await getUserInfo(newMsg.sender);
        setChats((prev) => [
          {
            messagesWith: newMsg.sender,
            name: info.name,
            profilePicUrl: info.profilePicUrl,
            lastMessage: newMsg.msg,
            date: newMsg.date,
            unread: true,
          },
          ...prev,
        ]);
      }
    };

    s.on("msgSent", onMsgSent);
    s.on("newMsgReceived", onNewMsgReceived);
    const onMsgError = ({ error }) => {
      if (error) alert(error);
    };
    s.on("msgError", onMsgError);

    return () => {
      s.off("msgSent", onMsgSent);
      s.off("newMsgReceived", onNewMsgReceived);
      s.off("msgError", onMsgError);
    };
  }, [chats, user._id]);

  useEffect(() => {
    if (messages.length > 0 && divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [chats, query]);

  const sendMsg = (msg) => {
    if (!socket.current || !openChatId.current) return;
    socket.current.emit("sendNewMsg", {
      userId: user._id,
      msgSendToUserId: openChatId.current,
      msg,
    });
  };

  const closePanel = () => {
    setOpen(false);
    setActiveChat(null);
    setMessages([]);
    openChatId.current = "";
  };

  const backToList = () => {
    setActiveChat(null);
    setMessages([]);
    openChatId.current = "";
    loadChats();
  };

  if (!user || hideOnMessages) return null;

  if (!open) {
    return (
      <Badge
        badgeContent={unreadCount > 0 ? unreadCount : null}
        color="secondary"
        overlap="circle"
        style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1300 }}
      >
        <IconButton
          className={classes.launcher}
          style={{ position: "relative", right: 0, bottom: 0 }}
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <ChatBubbleOutlineIcon />
        </IconButton>
      </Badge>
    );
  }

  return (
    <Paper className={classes.panel} elevation={8}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          {activeChat ? (
            <>
              <IconButton
                size="small"
                onClick={backToList}
                aria-label="Back to chats"
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Avatar
                src={chatWithData.profilePicUrl || activeChat.profilePicUrl}
                style={{ width: 28, height: 28 }}
              />
              <Typography className={classes.chatTitle}>
                {chatWithData.name || activeChat.name}
              </Typography>
            </>
          ) : (
            <Typography className={classes.title}>Chat</Typography>
          )}
        </Box>
        <Box className={classes.headerActions}>
          <IconButton
            size="small"
            aria-label="Open full messages"
            onClick={() => {
              if (activeChat) {
                router.push(`/messages?message=${activeChat.messagesWith}`);
              } else {
                router.push("/messages");
              }
              closePanel();
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Collapse chat"
            onClick={closePanel}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      {!activeChat ? (
        <>
          <Box className={classes.search}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <List className={classes.list} dense>
            {loading && (
              <Typography className={classes.empty}>Loading…</Typography>
            )}
            {!loading && filtered.length === 0 && (
              <Typography className={classes.empty}>
                No conversations yet.
              </Typography>
            )}
            {!loading &&
              filtered.map((chat) => (
                <ListItem
                  key={chat.messagesWith}
                  button
                  className={classes.item}
                  onClick={() => setActiveChat(chat)}
                >
                  <ListItemAvatar>
                    <Avatar src={chat.profilePicUrl} alt={chat.name} />
                  </ListItemAvatar>
                  <ListItemText
                    disableTypography
                    primary={
                      <Box className={classes.nameRow}>
                        <Typography
                          className={`${classes.name} ${
                            chat.unread ? classes.nameUnread : ""
                          }`}
                        >
                          {chat.name}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Typography className={classes.time}>
                            {chat.date ? checkTime(chat.date) : ""}
                          </Typography>
                          {chat.unread && (
                            <span className={classes.unreadDot} />
                          )}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography
                        className={`${classes.preview} ${
                          chat.unread ? classes.previewUnread : ""
                        }`}
                      >
                        {isMediaMessage(chat.lastMessage)
                          ? "GIF"
                          : chat.lastMessage || "No messages yet"}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </>
      ) : (
        <Box className={classes.thread}>
          <Box className={classes.messagesArea}>
            {messages.length === 0 ? (
              <Typography className={classes.empty}>
                No messages yet. Say hi!
              </Typography>
            ) : (
              messages.map((message, i) => (
                <Messages
                  key={message._id || i}
                  divRef={i === messages.length - 1 ? divRef : undefined}
                  message={message}
                  user={user}
                  userProfilePic={
                    chatWithData.profilePicUrl || activeChat.profilePicUrl
                  }
                  deleteMsg={() => {}}
                />
              ))
            )}
          </Box>
          <Box className={classes.inputArea}>
            <ChatInputField sendMsg={sendMsg} />
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default ChatPopup;
