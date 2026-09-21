import React from "react";
import { Box, makeStyles, Paper, Typography } from "@material-ui/core";

const EMOJIS = [
  "😀", "😂", "🥹", "😍", "🥰", "😎", "🤩", "😭", "🔥", "👍",
  "👎", "❤️", "💙", "💜", "✨", "🎉", "🙌", "👏", "🙏", "💯",
  "😮", "🤔", "😴", "🤝", "💪", "🌟", "☕", "🍕", "✅", "❌",
];

const useStyles = makeStyles((theme) => ({
  panel: {
    width: 280,
    maxHeight: 220,
    overflowY: "auto",
    padding: theme.spacing(1),
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  title: {
    fontSize: "0.75rem",
    fontWeight: 650,
    color: theme.palette.text.secondary,
    padding: theme.spacing(0.5, 0.75, 1),
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 2,
  },
  emojiBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "1.35rem",
    lineHeight: 1.4,
    borderRadius: 8,
    padding: theme.spacing(0.5),
    transition: "background 0.12s ease, transform 0.12s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "scale(1.12)",
    },
  },
}));

function EmojiPicker({ onSelect }) {
  const classes = useStyles();

  return (
    <Paper className={classes.panel} elevation={3}>
      <Typography className={classes.title}>Emojis</Typography>
      <Box className={classes.grid}>
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={classes.emojiBtn}
            onClick={() => onSelect(emoji)}
            aria-label={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </Box>
    </Paper>
  );
}

export default EmojiPicker;
