import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import React, { useState, useRef } from "react";

const useStyle = makeStyles({
  root: {},
});
function ChatInputField({ sendMsg }) {
  const classes = useStyle();
  const inputRef = useRef();
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMsg(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.which === 13) {
      e.preventDefault();
      inputRef.current.getElementsByTagName("textarea")[0].style.height =
        "auto";
      handleSubmit(e);
    }
  };

  return (
    <>
      <Box component="div">
        <form onSubmit={handleSubmit}>
          <TextField
            ref={inputRef}
            variant="outlined"
            name="text"
            multiline
            rowsMax={3}
            onKeyDown={handleKeyDown}
            value={text}
            autoComplete="off"
            onChange={(e) => setText(e.target.value)}
            style={{ borderRadius: 15 }}
            placeholder="Type Message..."
            fullWidth
          />
        </form>
      </Box>
    </>
  );
}

export default ChatInputField;
