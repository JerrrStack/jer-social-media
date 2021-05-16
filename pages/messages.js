import { Box, Grid, makeStyles, Paper } from "@material-ui/core";
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
import CircularProgress from "@material-ui/core/CircularProgress";
const useStyle = makeStyles({
  root: {
    minHeight: "80vh",
    position: "relative",
  },

  chatList: {
    maxHeight: "76vh",
  },
  MessageContent: {
    minHeight: "75vh",
    maxHeight: "75vh",
    overflow: "auto",
    whiteSpace: "normal",
    wordWrap: "break-word",
  },
});
const scrollDivToBottom = (divRef) =>
  divRef.current !== null &&
  divRef.current.scrollIntoView({ behaviour: "smooth" });

function messages({ chatsData, user }) {
  const router = useRouter();
  const classes = useStyle();
  const socket = useRef();
  const divRef = useRef();
  const [chats, setChats] = useState(chatsData);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatWithData, setChatWithData] = useState({
    name: "",
    profilePicUrl: "",
  });
  const [loading, setLoading] = useState(false);

  // Query string
  const openChatId = useRef("");

  //CONNECTION useEffect
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit("join", { userId: user._id });

      socket.current.on("connectedUsers", ({ users }) => {
        users.length > 0 && setConnectedUsers(users);
      });

      if (chats.length > 0 && !router.query.message) {
        router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
          shallow: true,
        });
      }
    }

    return () => {
      if (socket.current) {
        socket.current.emit("disconnect");
        socket.current.off();
      }
    };
  }, []);

  // LOAD MESSAGES useEffect
  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit("loadMessages", {
        userId: user._id,
        messagesWith: router.query.message,
      });

      socket.current.on("messagesLoaded", async ({ chat }) => {
        setMessages(chat.messages);
        setChatWithData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
        });

        openChatId.current = chat.messagesWith._id;
        divRef.current && scrollDivToBottom(divRef);
      });

      socket.current.on("noChatFound", async () => {
        const { name, profilePicUrl } = await getUserInfo(router.query.message);

        setChatWithData({ name, profilePicUrl });
        setMessages([]);

        openChatId.current = router.query.message;
      });
    };

    if (socket.current && router.query.message) loadMessages();
  }, [router.query.message]);

  const sendMsg = (msg) => {
    if (socket.current) {
      socket.current.emit("sendNewMsg", {
        userId: user._id,
        msgSendToUserId: openChatId.current,
        msg,
      });
    }
  };

  // Confirming msg is sent and receving the messages useEffect
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msgSent", ({ newMsg }) => {
        if (newMsg.receiver === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);

          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.messagesWith === newMsg.receiver
            );
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;

            return [...prev];
          });
        }
      });

      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        let senderName;

        // WHEN CHAT WITH SENDER IS CURRENTLY OPENED INSIDE YOUR BROWSER
        if (newMsg.sender === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);

          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.messagesWith === newMsg.sender
            );
            if (previousChat) {
              previousChat.lastMessage = newMsg.msg;
              previousChat.date = newMsg.date;

              senderName = previousChat.name;
            }

            return [...prev];
          });
        }
        //
        else {
          const ifPreviouslyMessaged =
            chats.filter((chat) => chat.messagesWith === newMsg.sender).length >
            0;

          if (ifPreviouslyMessaged) {
            setChats((prev) => {
              const previousChat = prev.find(
                (chat) => chat.messagesWith === newMsg.sender
              );
              previousChat.lastMessage = newMsg.msg;
              previousChat.date = newMsg.date;

              senderName = previousChat.name;

              return [
                previousChat,
                ...prev.filter((chat) => chat.messagesWith !== newMsg.sender),
              ];
            });
          }

          //IF NO PREVIOUS CHAT WITH THE SENDER
          else {
            const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
            senderName = name;

            const newChat = {
              messagesWith: newMsg.sender,
              name,
              profilePicUrl,
              lastMessage: newMsg.msg,
              date: newMsg.date,
            };
            setChats((prev) => [newChat, ...prev]);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages]);

  const deleteMsg = (messageId) => {
    if (socket.current) {
      socket.current.emit("deleteMsg", {
        userId: user._id,
        messagesWith: openChatId.current,
        messageId,
      });

      socket.current.on("msgDeleted", () => {
        setMessages((prev) =>
          prev.filter((message) => message._id !== messageId)
        );
      });
    }
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
    } catch (error) {
      alert("Error deleting chat");
    }
  };
  return (
    <>
      <Paper className={classes.root}>
        <Grid container>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Box component="div">
              <SearchChat chats={chats} setChats={setChats} />
            </Box>

            <Box component="div" className={classes.chatList}>
              {chats.length > 0 ? (
                <>
                  {chats.map((chat, i) => (
                    <Chat
                      connectedUsers={connectedUsers}
                      key={i}
                      chatIndex={i}
                      user={user}
                      chat={chat}
                      deleteChat={deleteChat}
                    />
                  ))}
                </>
              ) : (
                <NoChats />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={8}>
            {/* {loading ? (
              <CircularProgress />
            ) : (
              <> */}
            {router.query.message && (
              <>
                <UserInfo chatWithData={chatWithData} />
                <Paper className={classes.MessageContent}>
                  {messages.length > 0 &&
                    messages.map((message, i) => (
                      <Messages
                        divRef={divRef}
                        deleteMsg={deleteMsg}
                        message={message}
                        user={user}
                        userProfilePic={chatWithData.profilePicUrl}
                        key={i}
                      />
                    ))}
                </Paper>

                <ChatInputField sendMsg={sendMsg} />
              </>
            )}
            {/* </>
            )} */}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

messages.getInitialProps = async (ctx) => {
  try {
    // setLoading(true);
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });
    // setLoading(false);
    return { chatsData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default messages;
