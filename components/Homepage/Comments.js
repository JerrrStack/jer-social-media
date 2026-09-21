import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import GifIcon from "@material-ui/icons/Gif";
import { postComment } from "../../utils/postActions";
import EmojiPicker from "../common/EmojiPicker";
import GifPicker from "../common/GifPicker";
import { TEXT_MAX_LENGTH } from "../../utils/textLimits";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1.5, 2, 2),
  },
  replyRoot: {
    padding: theme.spacing(1, 0, 0),
    marginTop: theme.spacing(0.5),
  },
  row: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: theme.spacing(0.75),
  },
  composer: {
    position: "relative",
    flex: 1,
    width: "100%",
  },
  inputField: {
    width: "100%",
    margin: 0,
    "& .MuiFormControl-root": {
      margin: 0,
      width: "100%",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 20,
      alignItems: "flex-end",
      paddingRight: theme.spacing(11),
      paddingLeft: theme.spacing(5.5),
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px 14px",
      boxSizing: "border-box",
    },
    "& textarea.MuiOutlinedInput-input": {
      padding: "10px 14px",
      lineHeight: 1.4,
    },
  },
  tools: {
    position: "absolute",
    left: 4,
    bottom: 4,
    zIndex: 2,
    display: "flex",
    alignItems: "center",
  },
  toolBtn: {
    width: 30,
    height: 30,
    padding: 4,
    color: theme.palette.text.secondary,
  },
  toolBtnActive: {
    color: theme.palette.primary.main,
    backgroundColor: "rgba(24, 119, 242, 0.12)",
  },
  popover: {
    position: "absolute",
    left: 0,
    bottom: "calc(100% + 8px)",
    zIndex: 40,
  },
  submitBtn: {
    position: "absolute",
    right: 6,
    bottom: 6,
    zIndex: 1,
    borderRadius: 20,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(0.5, 2),
    minWidth: 68,
    height: 32,
    fontSize: "0.8125rem",
    boxShadow: "none",
  },
  counter: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    paddingLeft: 8,
  },
  counterWarn: {
    color: theme.palette.error.main,
    fontWeight: 700,
  },
}));

function Comments({
  user,
  setComments,
  post,
  parentCommentId = null,
  replyToName = null,
  onPosted,
  compact = false,
}) {
  const classes = useStyles();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [panel, setPanel] = useState(null);
  const inputRef = useRef();

  const isReply = Boolean(parentCommentId);
  const placeholder = isReply
    ? replyToName
      ? `Reply to ${replyToName}`
      : "Write a reply"
    : "Write a comment";

  const buttonLabel = isReply ? "Reply" : "Post";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    const result = await postComment(
      post._id,
      user,
      text.trim(),
      setComments,
      setText,
      parentCommentId
    );
    setSubmitting(false);
    setPanel(null);

    if (result && onPosted) onPosted();
  };

  const insertEmoji = (emoji) => {
    setText((prev) => `${prev}${emoji}`.slice(0, TEXT_MAX_LENGTH));
    setPanel(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const insertGif = async (url) => {
    if (submitting) return;
    setPanel(null);
    setSubmitting(true);
    const result = await postComment(
      post._id,
      user,
      url,
      setComments,
      setText,
      parentCommentId
    );
    setSubmitting(false);
    if (result && onPosted) onPosted();
  };

  const remaining = TEXT_MAX_LENGTH - text.length;

  return (
    <Box
      className={isReply ? classes.replyRoot : classes.root}
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
    >
      <Box className={classes.row}>
        <ClickAwayListener onClickAway={() => setPanel(null)}>
          <Box className={classes.composer}>
            {panel === "emoji" && (
              <Box className={classes.popover}>
                <EmojiPicker onSelect={insertEmoji} />
              </Box>
            )}
            {panel === "gif" && (
              <Box className={classes.popover}>
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
              size="small"
              margin="dense"
              className={classes.inputField}
              variant="outlined"
              placeholder={placeholder}
              name="text"
              value={text}
              fullWidth
              multiline
              minRows={1}
              maxRows={compact ? 2 : 4}
              autoFocus={compact}
              inputProps={{ maxLength: TEXT_MAX_LENGTH }}
              onChange={(e) =>
                setText(e.target.value.slice(0, TEXT_MAX_LENGTH))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              className={classes.submitBtn}
              disabled={!text.trim() || submitting}
            >
              {submitting ? "..." : buttonLabel}
            </Button>
          </Box>
        </ClickAwayListener>
        {text.length > 0 && (
          <Typography
            className={`${classes.counter} ${
              remaining <= 20 ? classes.counterWarn : ""
            }`}
          >
            {remaining} left
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Comments;
