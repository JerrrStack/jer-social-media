import React, { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  makeStyles,
  TextField,
} from "@material-ui/core";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import uploadPic from "../../utils/uploadPicToCloudinary";
import { submitNewPost } from "../../utils/postActions";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  card: {
    width: "100%",
    borderRadius: 16,
    overflow: "visible",
  },
  content: {
    padding: theme.spacing(2, 2.5, 2.5),
    "&:last-child": {
      paddingBottom: theme.spacing(2.5),
    },
  },
  composer: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  avatar: {
    width: 44,
    height: 44,
    marginTop: 4,
  },
  input: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: theme.palette.grey[50],
    },
    "& .MuiInputLabel-outlined": {
      transform: "translate(14px, 14px) scale(1)",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
    },
  },
  actions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    paddingLeft: 56,
    marginBottom: theme.spacing(1),
  },
  mediaChip: {
    marginLeft: 56,
    marginBottom: theme.spacing(1),
  },
  error: {
    marginLeft: 56,
    marginBottom: theme.spacing(1),
    borderRadius: 10,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    paddingLeft: 56,
    paddingTop: theme.spacing(0.5),
  },
  postBtn: {
    minWidth: 96,
    borderRadius: 10,
  },
}));

function CardPost({ user, setPosts }) {
  const classes = useStyles();
  const [text, setText] = useState("");
  const [taggedUser, setTaggedUser] = useState("");
  const inputRef = useRef();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaName, setMediaName] = useState(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (error) setError(null);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMedia(file);
    setMediaName(file.name);
    if (error) setError(null);
  };

  const cancelImg = () => {
    setMediaName(null);
    setMedia(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (trimmed.length < 1 && !media) {
      setError("Add some text or attach an image to post.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let picUrl;
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
        },
        setError
      );

      setMedia(null);
      setMediaName(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError("Could not create post. Try again.");
    }

    setLoading(false);
  };

  return (
    <Card className={classes.card} elevation={1}>
      <CardContent className={classes.content}>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Box className={classes.composer}>
            <Avatar
              alt={user.name}
              src={user.profilePicUrl}
              className={classes.avatar}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              name="text"
              value={text}
              onChange={handleTextChange}
              className={classes.input}
              variant="outlined"
              label="What's happening?"
              placeholder="Share something with your network..."
            />
          </Box>

          <Box className={classes.actions}>
            <input
              ref={inputRef}
              onChange={handleMediaChange}
              name="media"
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              id="raised-button-file"
            />
            <label htmlFor="raised-button-file">
              <Button
                component="span"
                size="small"
                startIcon={<PhotoLibraryIcon />}
                color="primary"
              >
                Photo
              </Button>
            </label>
          </Box>

          {mediaName && (
            <Chip
              className={classes.mediaChip}
              variant="outlined"
              size="small"
              color="primary"
              label={mediaName}
              onDelete={cancelImg}
            />
          )}

          {error && (
            <Alert severity="error" className={classes.error}>
              {error}
            </Alert>
          )}

          <Box className={classes.footer}>
            {loading && <CircularProgress size={22} />}
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.postBtn}
              disabled={loading}
            >
              Post
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}

export default CardPost;
