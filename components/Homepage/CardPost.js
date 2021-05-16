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
import LocationOnIcon from "@material-ui/icons/LocationOn";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import ImageIcon from "@material-ui/icons/Image";
import uploadPic from "../../utils/uploadPicToCloudinary";
import { submitNewPost } from "../../utils/postActions";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
const useStyles = makeStyles({
  root: {
    backgroundColor: "",

    textAlign: "center",
  },
  inputField: {
    height: "auto",
    margin: 5,
    width: "50%",
    ["&,fieldset"]: {
      borderRadius: 25,
    },
  },
});

function CardPost({ user, setPosts }) {
  const classes = useStyles();
  const [createPost, setCreatePost] = useState({
    text: "",
    taggedUser: "",
  });
  const inputRef = useRef();
  const { text, taggedUser } = createPost;
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  const [mediaName, setMediaName] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "media") {
      setMedia(files[0]);
      setMediaName(files[0].name);
    }
    setCreatePost((prev) => ({ ...prev, [name]: value }));
  };
  console.log(createPost.text);

  const cancelImg = () => {
    setMediaName("");
    setMedia(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      let picUrl;

      if (media !== null) {
        picUrl = await uploadPic(media);
        if (!picUrl) {
          setLoading(false);
          return setError("Error Uploading Image");
        }
      }
      await submitNewPost(
        createPost.text,
        createPost.taggedUser,
        picUrl,
        setPosts,
        setCreatePost,
        setError
      );
      setMedia(null);
      setMediaName(null);
    } catch (error) {
      setMediaName(null);
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardContent className={classes.root}>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>
              <Avatar alt={user.name} src={user.profilePicUrl} />
            </span>

            <TextField
              size="small"
              name="text"
              value={text}
              onChange={handleChange}
              className={classes.inputField}
              id="input-with-icon-grid"
              variant="outlined"
              label="What's Happening?"
            />
          </div>
          <Box
            component="div"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              ref={inputRef}
              onChange={handleChange}
              name="media"
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              id="raised-button-file"
            />

            <label htmlFor="raised-button-file">
              <Button component="span" className={classes.button}>
                <PhotoLibraryIcon />
              </Button>
            </label>
            {/* <Button>
              <LocationOnIcon />
            </Button>
            <Button>
              <PersonPinIcon />
            </Button> */}
          </Box>
          {mediaName ? (
            <>
              <Chip
                variant="outlined"
                size="small"
                avatar={<ImageIcon color="primary" />}
                label={mediaName}
                onDelete={cancelImg}
              />
              <br />
            </>
          ) : (
            <></>
          )}
          {error ? (
            <Alert variant="outlined" severity="error">
              {error}
            </Alert>
          ) : (
            <></>
          )}

          <Button
            type="submit"
            color="primary"
            variant="contained"
            style={{ marginTop: 5 }}
          >
            Post
          </Button>
          <br />

          {loading && <CircularProgress />}
        </form>
      </CardContent>
    </Card>
  );
}

export default CardPost;
