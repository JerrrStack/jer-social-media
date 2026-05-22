import { Box, List, makeStyles, Typography } from "@material-ui/core";
import React, { useEffect, useState, useRef } from "react";
import SearchChat from "../components/Messages/SearchChat";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import io from "socket.io-client";
import NoChats from "../components/Messages/NoChats";
import Chat from "../components/Messages/Chat";
import { useRouter } from "next/router";
import Messages from "../components/Messages/Messages";
import UserInfo from "../components/Messages/UserInfo";
import ChatInputField from "../components/Messages/ChatInputField";
import getUserInfo from "../utils/getUserInfo";

const useStyles = makeStyles((theme) => ({
  shell: {
    display: "flex",
    width: "100%",
    minHeight: "calc(100vh - 72px)",
    maxHeight: "calc(100vh - 72px)",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("md")]: {
      minHeight: "calc(100vh - 68px)",
      maxHeight: "calc(100vh - 68px)",
      borderRadius: 8,
    },
    [theme.breakpoints.down("xs")]: {
      minHeight: "calc(100vh - 64px)",
      maxHeight: "calc(100vh - 64px)",
      borderRadius: 0,
      border: "none",
    },
  },
  sidebar: {
    width: 300,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: "100%",
      borderRight: "none",
      display: (props) => (props.showChat ? "none" : "flex"),
    },
  },
  sidebarSearch: {
    padding: theme.spacing(1.5),
    flexShrink: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  chatList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    minHeight: 0,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
    [theme.breakpoints.down("sm")]: {
      display: (props) => (props.showChat ? "flex" : "none"),
    },
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
    backgroundColor: "#f8fafc",
    minHeight: 0,
  },
  inputArea: {
    flexShrink: 0,
    padding: theme.spacing(1.5, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  emptyMain: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    backgroundColor: "#f8fafc",
  },
  emptyText: {
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
}));

const scrollDivToBottom = (divRef) => {
  if (divRef?.current) {
    divRef.current.scrollIntoView({ behavior: "smooth" });
  }
};

function MessagesPage({ chatsData, user }) {
  const router = useRouter();
  const showChat = Boolean(router.query.message);
  const classes = useStyles({ showChat });
  const socket = useRef();
  const divRef = useRef();
  const [chats, setChats] = useState(chatsData);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatWithData, setChatWithData] = useState({
    name: "",
    profilePicUrl: "",
  });

  const openChatId = useRef("");

  useEffect(() => {
    const s = io(baseUrl);
    socket.current = s;

    s.emit("join", { userId: user._id });

    const onConnectedUsers = ({ users }) => {
      if (users?.length > 0) setConnectedUsers(users);
    };
    s.on("connectedUsers", onConnectedUsers);

    return () => {
      s.off("connectedUsers", onConnectedUsers);
      s.disconnect();
      socket.current = null;
    };
  }, [user._id]);

  useEffect(() => {
    if (chats.length > 0 && !router.query.message) {
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });
    }
  }, [chats, router.query.message]);

  useEffect(() => {
    const s = socket.current;
    if (!s || !router.query.message) return;

    const onMessagesLoaded = ({ chat }) => {
      setMessages(chat.messages);
      setChatWithData({
        name: chat.messagesWith.name,
        profilePicUrl: chat.messagesWith.profilePicUrl,
      });
      openChatId.current = chat.messagesWith._id;
      scrollDivToBottom(divRef);
    };

    const onNoChatFound = async () => {
      const { name, profilePicUrl } = await getUserInfo(router.query.message);
      setChatWithData({ name, profilePicUrl });
      setMessages([]);
      openChatId.current = router.query.message;
    };

    s.emit("loadMessages", {
      userId: user._id,
      messagesWith: router.query.message,
    });
    s.on("messagesLoaded", onMessagesLoaded);
    s.on("noChatFound", onNoChatFound);

    return () => {
      s.off("messagesLoaded", onMessagesLoaded);
      s.off("noChatFound", onNoChatFound);
    };
  }, [router.query.message, user._id]);

  const sendMsg = (msg) => {
    if (socket.current) {
      socket.current.emit("sendNewMsg", {
        userId: user._id,
        msgSendToUserId: openChatId.current,
        msg,
      });
    }
  };

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const onMsgSent = ({ newMsg }) => {
      if (newMsg.receiver === openChatId.current) {
        setMessages((prev) => [...prev, newMsg]);
        setChats((prev) => {
          const previousChat = prev.find(
            (chat) => chat.messagesWith === newMsg.receiver
          );
          if (previousChat) {
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;
          }
          return [...prev];
        });
      }
    };

    const onNewMsgReceived = async ({ newMsg }) => {
      if (newMsg.sender === openChatId.current) {
        setMessages((prev) => [...prev, newMsg]);
        setChats((prev) => {
          const previousChat = prev.find(
            (chat) => chat.messagesWith === newMsg.sender
          );
          if (previousChat) {
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;
          }
          return [...prev];
        });
        return;
      }

      let chatExists = false;
      setChats((prev) => {
        const existing = prev.find(
          (chat) => chat.messagesWith === newMsg.sender
        );
        if (existing) {
          chatExists = true;
          existing.lastMessage = newMsg.msg;
          existing.date = newMsg.date;
          return [
            existing,
            ...prev.filter((chat) => chat.messagesWith !== newMsg.sender),
          ];
        }
        return prev;
      });

      if (!chatExists) {
        const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
        setChats((prev) => {
          if (prev.some((c) => c.messagesWith === newMsg.sender)) return prev;
          return [
            {
              messagesWith: newMsg.sender,
              name,
              profilePicUrl,
              lastMessage: newMsg.msg,
              date: newMsg.date,
            },
            ...prev,
          ];
        });
      }
    };

    s.on("msgSent", onMsgSent);
    s.on("newMsgReceived", onNewMsgReceived);

    return () => {
      s.off("msgSent", onMsgSent);
      s.off("newMsgReceived", onNewMsgReceived);
    };
  }, [user._id]);

  useEffect(() => {
    if (messages.length > 0) scrollDivToBottom(divRef);
  }, [messages]);

  const deleteMsg = (messageId) => {
    const s = socket.current;
    if (!s) return;

    s.emit("deleteMsg", {
      userId: user._id,
      messagesWith: openChatId.current,
      messageId,
    });

    const onDeleted = () => {
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId)
      );
      s.off("msgDeleted", onDeleted);
    };
    s.on("msgDeleted", onDeleted);
  };

  const deleteChat = async (messagesWith) => {
    try {
      await axios.delete(`${baseUrl}/api/chats/${messagesWith}`, {
        headers: { Authorization: cookie.get("token") },
      });
      setChats((prev) =>
        prev.filter((chat) => chat.messagesWith !== messagesWith)
      );
      router.push("/messages", undefined, { shallow: true });
    } catch {
      alert("Error deleting chat");
    }
  };

  return (
    <Box className={classes.shell}>
      <Box className={classes.sidebar}>
        <Box className={classes.sidebarSearch}>
          <SearchChat chats={chats} setChats={setChats} />
        </Box>
        <List disablePadding className={classes.chatList}>
          {chats.length > 0 ? (
            chats.map((chat, i) => (
              <Chat
                connectedUsers={connectedUsers}
                key={chat.messagesWith || i}
                chatIndex={i}
                user={user}
                chat={chat}
                deleteChat={deleteChat}
              />
            ))
          ) : (
            <NoChats />
          )}
        </List>
      </Box>

      <Box className={classes.main}>
        {router.query.message ? (
          <>
            <UserInfo chatWithData={chatWithData} />
            <Box className={classes.messagesArea}>
              {messages.length > 0 ? (
                messages.map((message, i) => (
                  <Messages
                    divRef={i === messages.length - 1 ? divRef : null}
                    deleteMsg={deleteMsg}
                    message={message}
                    user={user}
                    userProfilePic={chatWithData.profilePicUrl}
                    key={message._id || i}
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  No messages yet. Say hi!
                </Typography>
              )}
            </Box>
            <Box className={classes.inputArea}>
              <ChatInputField sendMsg={sendMsg} />
            </Box>
          </>
        ) : (
          <Box className={classes.emptyMain}>
            <Typography variant="h6" className={classes.emptyText}>
              Select a conversation or search for someone to message
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

MessagesPage.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });
    return { chatsData: res.data };
  } catch {
    return { chatsData: [], errorLoading: true };
  }
};

export default MessagesPage;
