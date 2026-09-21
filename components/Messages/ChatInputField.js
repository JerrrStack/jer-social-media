import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  ClickAwayListener,
  IconButton,
  makeStyles,
  TextField,
  Tooltip,
} from "@material-ui/core";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import GifIcon from "@material-ui/icons/Gif";
import SendIcon from "@material-ui/icons/Send";
import EmojiPicker from "../common/EmojiPicker";
import GifPicker from "../common/GifPicker";
import { TEXT_MAX_LENGTH } from "../../utils/textLimits";

const useStyles = makeStyles((theme) => ({
  row: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    width: "100%",
  },
  composer: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    padding: "2px 6px 2px 4px",
    gap: 2,
  },
  tools: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    height: 36,
  },
  toolBtn: {
    width: 32,
    height: 32,
    padding: 4,
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.06)",
      color: theme.palette.primary.main,
    },
  },
  toolBtnActive: {
    color: theme.palette.primary.main,
    backgroundColor: "rgba(24, 119, 242, 0.12)",
  },
  input: {
    flex: 1,
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "transparent",
      padding: "6px 4px",
      alignItems: "center",
      "& fieldset": { border: "none" },
    },
    "& .MuiOutlinedInput-input": {
      padding: "4px 6px",
      fontSize: "0.95rem",
      lineHeight: 1.35,
    },
    "& .MuiInputBase-multiline": {
      padding: 0,
    },
  },
  popover: {
    position: "absolute",
    bottom: "calc(100% + 10px)",
    left: 0,
    zIndex: 30,
  },
  popoverRight: {
    position: "absolute",
    bottom: "calc(100% + 10px)",
    left: 0,
    zIndex: 30,
  },
  sendBtn: {
    width: 36,
    height: 36,
    padding: 0,
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&.Mui-disabled": {
      backgroundColor: "#E4E6EB",
      color: "#B0B3B8",
    },
  },
}));

function ChatInputField({ sendMsg }) {
  const classes = useStyles();
  const [text, setText] = useState("");
  const [panel, setPanel] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > TEXT_MAX_LENGTH) return;
    sendMsg(trimmed);
    setText("");
    setPanel(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertEmoji = (emoji) => {
    setText((prev) => `${prev}${emoji}`.slice(0, TEXT_MAX_LENGTH));
    setPanel(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const insertGif = (url) => {
    sendMsg(url);
    setPanel(null);
  };

  return (
    <ClickAwayListener onClickAway={() => setPanel(null)}>
      <Box component="form" onSubmit={handleSubmit} className={classes.row}>
        <Box className={classes.composer}>
          {panel === "emoji" && (
            <Box className={classes.popover}>
              <EmojiPicker onSelect={insertEmoji} />
            </Box>
          )}
          {panel === "gif" && (
            <Box className={classes.popoverRight}>
              <GifPicker onSelect={insertGif} />
            </Box>
          )}

          <Box className={classes.tools}>
            <Tooltip title="Emoji">
              <IconButton
                size="small"
                className={`${classes.toolBtn} ${
                  panel === "emoji" ? classes.toolBtnActive : ""
                }`}
                onClick={() =>
                  setPanel((p) => (p === "emoji" ? null : "emoji"))
                }
              >
                <InsertEmoticonIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="GIF">
              <IconButton
                size="small"
                className={`${classes.toolBtn} ${
                  panel === "gif" ? classes.toolBtnActive : ""
                }`}
                onClick={() => setPanel((p) => (p === "gif" ? null : "gif"))}
              >
                <GifIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            inputRef={inputRef}
            className={classes.input}
            variant="outlined"
            name="text"
            multiline
            maxRows={4}
            onKeyDown={handleKeyDown}
            value={text}
            autoComplete="off"
            onChange={(e) =>
              setText(e.target.value.slice(0, TEXT_MAX_LENGTH))
            }
            inputProps={{ maxLength: TEXT_MAX_LENGTH }}
            placeholder="Aa"
            fullWidth
            size="small"
          />
        </Box>

        <IconButton
          type="submit"
          className={classes.sendBtn}
          disabled={!text.trim()}
          aria-label="Send"
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </ClickAwayListener>
  );
}

export default ChatInputField;
