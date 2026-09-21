import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import GifIcon from "@material-ui/icons/Gif";
import CloseIcon from "@material-ui/icons/Close";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import cookie from "js-cookie";
import uploadPic from "../../utils/uploadPicToCloudinary";
import { submitNewPost } from "../../utils/postActions";
import baseUrl from "../../utils/baseUrl";
import { getDisplayName } from "../../utils/displayUser";
import EmojiPicker from "../common/EmojiPicker";
import GifPicker from "../common/GifPicker";
import { TEXT_MAX_LENGTH } from "../../utils/textLimits";

const useStyles = makeStyles((theme) => ({
  card: {
    width: "100%",
    borderRadius: 12,
    overflow: "visible",
  },
  content: {
    padding: theme.spacing(1.5, 2, 1.5),
    "&:last-child": {
      paddingBottom: theme.spacing(1.5),
    },
  },
  title: {
    fontWeight: 700,
    fontSize: "1.05rem",
    marginBottom: theme.spacing(1),
  },
  composer: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.25),
  },
  avatar: {
    width: 40,
    height: 40,
    marginTop: 4,
  },
  input: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 20,
      backgroundColor: "#F0F2F5",
      "& fieldset": { border: "none" },
    },
    "& .MuiOutlinedInput-input": {
      padding: "12px 16px",
    },
  },
  mentionWrap: {
    position: "relative",
    flex: 1,
  },
  mentionMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    zIndex: 20,
    marginTop: 4,
    maxHeight: 220,
    overflowY: "auto",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },
  previewWrap: {
    position: "relative",
    marginTop: theme.spacing(1.5),
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    border: `1px solid ${theme.palette.divider}`,
  },
  previewImg: {
    display: "block",
    width: "100%",
    maxHeight: 360,
    objectFit: "contain",
    backgroundColor: "#111",
  },
  removePreview: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    color: "#fff",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.8)",
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.25),
    paddingTop: theme.spacing(1),
  },
  mediaBtn: {
    borderRadius: 8,
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
    minWidth: 0,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  mediaBtnActive: {
    backgroundColor: "rgba(24, 119, 242, 0.12)",
    color: theme.palette.primary.main,
  },
  pickerPopover: {
    position: "absolute",
    left: 0,
    bottom: "calc(100% + 8px)",
    zIndex: 30,
  },
  toolsWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  counter: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  counterWarn: {
    color: theme.palette.error.main,
    fontWeight: 700,
  },
  postBtn: {
    minWidth: 110,
    borderRadius: 8,
    fontWeight: 700,
  },
  error: {
    marginTop: theme.spacing(1),
    borderRadius: 10,
  },
}));

function CardPost({ user, setPosts, onPostCreated }) {
  const classes = useStyles();
  const [text, setText] = useState("");
  const [taggedUser, setTaggedUser] = useState("");
  const inputRef = useRef();
  const fileRef = useRef();
  const [media, setMedia] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionResults, setMentionResults] = useState([]);
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    if (gifUrl) {
      setPreviewUrl(gifUrl);
      return;
    }
    if (!media) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(media);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [media, gifUrl]);

  useEffect(() => {
    if (!mentionQuery || mentionQuery.length < 1) {
      setMentionResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const token = cookie.get("token");
        const res = await axios.get(
          `${baseUrl}/api/search/${encodeURIComponent(mentionQuery)}`,
          { headers: { Authorization: token } }
        );
        if (!cancelled) setMentionResults(res.data || []);
      } catch {
        if (!cancelled) setMentionResults([]);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mentionQuery]);

  const updateMentionState = (value) => {
    const match = value.slice(0, value.length).match(/@([a-zA-Z0-9._]*)$/);
    if (match) setMentionQuery(match[1]);
    else setMentionQuery(null);
  };

  const handleTextChange = (e) => {
    const value = e.target.value.slice(0, TEXT_MAX_LENGTH);
    setText(value);
    updateMentionState(value);
    if (error) setError(null);
  };

  const insertMention = (person) => {
    const username = person.username;
    const replaced = text.replace(/@([a-zA-Z0-9._]*)$/, `@${username} `);
    setText(replaced.slice(0, TEXT_MAX_LENGTH));
    setTaggedUser(username);
    setMentionQuery(null);
    setMentionResults([]);
    if (inputRef.current) inputRef.current.focus();
  };

  const insertEmoji = (emoji) => {
    setText((prev) => `${prev}${emoji}`.slice(0, TEXT_MAX_LENGTH));
    setPanel(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const insertGif = (url) => {
    setGifUrl(url);
    setMedia(null);
    if (fileRef.current) fileRef.current.value = "";
    setPanel(null);
    if (error) setError(null);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setMedia(file);
    setGifUrl(null);
    if (error) setError(null);
  };

  const cancelImg = () => {
    setMedia(null);
    setGifUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (trimmed.length < 1 && !media && !gifUrl) {
      setError("Add some text, a GIF, or a photo to post.");
      return;
    }

    if (trimmed.length > TEXT_MAX_LENGTH) {
      setError(`Post is too long (max ${TEXT_MAX_LENGTH} characters).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let picUrl = gifUrl || undefined;
      if (media) {
        picUrl = await uploadPic(media);
        if (!picUrl) {
          setError("Error uploading image. Check Cloudinary settings.");
          setLoading(false);
          return;
        }
      }

      await submitNewPost(
        trimmed,
        taggedUser,
        picUrl,
        setPosts,
        () => {
          setText("");
          setTaggedUser("");
          setMedia(null);
          setGifUrl(null);
          if (fileRef.current) fileRef.current.value = "";
          onPostCreated?.();
        },
        setError
      );
    } catch (err) {
      setError("Could not create post. Try again.");
    }

    setLoading(false);
  };

  const remaining = TEXT_MAX_LENGTH - text.length;
  const canPost = Boolean(text.trim() || media || gifUrl);

  return (
    <Card className={`${classes.card} sayhi-fade-up`} elevation={1}>
      <CardContent className={classes.content}>
        <Typography className={classes.title}>Create post</Typography>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Box className={classes.composer}>
            <Avatar
              alt={user.name}
              src={user.profilePicUrl}
              className={classes.avatar}
            />
            <Box className={classes.mentionWrap}>
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                minRows={2}
                maxRows={8}
                name="text"
                value={text}
                onChange={handleTextChange}
                className={classes.input}
                variant="outlined"
                inputProps={{ maxLength: TEXT_MAX_LENGTH }}
                placeholder={`What's on your mind, ${
                  user.name?.split(" ")[0] || "friend"
                }? Use @ to mention, # for trends`}
              />
              {mentionQuery !== null && mentionResults.length > 0 && (
                <Paper className={classes.mentionMenu} elevation={4}>
                  <List dense disablePadding>
                    {mentionResults.map((person) => (
                      <ListItem
                        key={person._id}
                        button
                        onClick={() => insertMention(person)}
                      >
                        <ListItemAvatar>
                          <Avatar src={person.profilePicUrl} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={getDisplayName(person)}
                          secondary={`@${person.username}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </Box>

          {previewUrl && (
            <Box className={classes.previewWrap}>
              <img
                src={previewUrl}
                alt="Upload preview"
                className={classes.previewImg}
              />
              <IconButton
                size="small"
                className={classes.removePreview}
                onClick={cancelImg}
                aria-label="Remove image"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {error && (
            <Alert severity="error" className={classes.error}>
              {error}
            </Alert>
          )}

          <Divider style={{ marginTop: 12 }} />

          <Box className={classes.toolbar}>
            <ClickAwayListener onClickAway={() => setPanel(null)}>
              <Box className={classes.toolsWrap}>
                {panel === "emoji" && (
                  <Box className={classes.pickerPopover}>
                    <EmojiPicker onSelect={insertEmoji} />
                  </Box>
                )}
                {panel === "gif" && (
                  <Box className={classes.pickerPopover}>
                    <GifPicker onSelect={insertGif} />
                  </Box>
                )}

                <input
                  ref={fileRef}
                  onChange={handleMediaChange}
                  name="media"
                  style={{ display: "none" }}
                  type="file"
                  accept="image/*"
                  id="composer-photo-input"
                />
                <label htmlFor="composer-photo-input">
                  <Button
                    component="span"
                    size="small"
                    startIcon={
                      <PhotoLibraryIcon style={{ color: "#45BD62" }} />
                    }
                    className={classes.mediaBtn}
                  >
                    Photo
                  </Button>
                </label>
                <Button
                  size="small"
                  startIcon={<InsertEmoticonIcon style={{ color: "#F7B928" }} />}
                  className={`${classes.mediaBtn} ${
                    panel === "emoji" ? classes.mediaBtnActive : ""
                  }`}
                  onClick={() =>
                    setPanel((p) => (p === "emoji" ? null : "emoji"))
                  }
                >
                  Emoji
                </Button>
                <Button
                  size="small"
                  startIcon={<GifIcon style={{ color: "#F56040" }} />}
                  className={`${classes.mediaBtn} ${
                    panel === "gif" ? classes.mediaBtnActive : ""
                  }`}
                  onClick={() => setPanel((p) => (p === "gif" ? null : "gif"))}
                >
                  GIF
                </Button>
              </Box>
            </ClickAwayListener>

            <Box display="flex" alignItems="center" style={{ gap: 10 }}>
              <Typography
                className={`${classes.counter} ${
                  remaining <= 20 ? classes.counterWarn : ""
                }`}
              >
                {remaining}
              </Typography>
              {loading && <CircularProgress size={22} />}
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.postBtn}
                disabled={loading || !canPost}
              >
                Post
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}

export default CardPost;
