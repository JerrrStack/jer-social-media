import React, { useState } from "react";
import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import { postComment } from "../../utils/postActions";

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
      text,
      setComments,
      setText,
      parentCommentId
    );
    setSubmitting(false);

    if (result && onPosted) onPosted();
  };

  return (
    <Box
      className={isReply ? classes.replyRoot : classes.root}
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
    >
      <Box className={classes.row}>
        <Box className={classes.composer}>
          <TextField
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
            onChange={(e) => setText(e.target.value)}
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
      </Box>
    </Box>
  );
}

export default Comments;
