import { Box, makeStyles, TextField } from "@material-ui/core";
import React, { useState, useRef } from "react";

const useStyles = makeStyles((theme) => ({
  input: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 24,
      backgroundColor: "#f8fafc",
    },
  },
}));

function ChatInputField({ sendMsg }) {
  const classes = useStyles();
  const inputRef = useRef();
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMsg(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        ref={inputRef}
        className={classes.input}
        variant="outlined"
        name="text"
        multiline
        maxRows={4}
        onKeyDown={handleKeyDown}
        value={text}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        fullWidth
        size="small"
      />
    </Box>
  );
}

export default ChatInputField;
