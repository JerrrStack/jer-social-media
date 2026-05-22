import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Avatar, Box, Button, TextField } from "@material-ui/core";
import { ClassSharp, Image } from "@material-ui/icons";
import uploadPic from "../../utils/uploadPicToCloudinary";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import axios from "axios";
import { updateProfile } from "../../utils/profileActions";
const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "50%",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
    outline: "none",
    borderRadius: "10px",
    "&, div": {
      marginTop: "5px",
    },
  },
  modalStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButton: {
    float: "right",
    "&, button": {
      marginRight: "5px",
    },
  },
  imgContent: {
    textAlign: "center",
    position: "relative",
    borderRadius: "50%",
    padding: 0,
    margin: 0,
  },
  profilePic: {
    height: "150px",
    width: "auto",
    borderRadius: "50%",
    [theme.breakpoints.down("md")]: {
      height: "19.6vw",
    },
    "&:hover": {
      opacity: "0.5",
    },
    cursor: "pointer",
  },
}));

export default function Follower({ profile }) {
  const classes = useStyles();
  const inputRef = useRef();
  const [text, setText] = useState({
    bio: "",
    website: "",
  });

  const { bio, website } = text;

  const [errorMsg, setErrorMsg] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
    setText((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let profilePicUrl;
    if (media !== null) {
      profilePicUrl = await uploadPic(media);
    }

    await updateProfile(text, profilePicUrl, setErrorMsg);
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div className={classes.paper}>
      <h2 id="simple-modal-title">Edit Profile</h2>
      <form
        className={classes.root}
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
      >
        <Box component="div" className={classes.imgContent}>
          {profile.user.profilePicUrl ? (
            <img
              alt="Pic"
              src={mediaPreview ? mediaPreview : profile.user.profilePicUrl}
              className={classes.profilePic}
            />
          ) : mediaPreview ? (
            <img alt="Pic" src={mediaPreview} className={classes.profilePic} />
          ) : (
            "No Picture"
          )}
          <br />
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
            <Button
              component="span"
              variant="outlined"
              color="primary"
              className={classes.button}
            >
              {profile.user.profilePicUrl ? "Change Image" : "Add Image"}
            </Button>
          </label>
        </Box>

        <Box component="div">
          <TextField
            variant="outlined"
            label="Bio"
            name="bio"
            value={bio}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box component="div">
          <TextField
            variant="outlined"
            label="Website"
            name="website"
            value={website}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        <Box component="div" className={classes.modalButton}>
          <Button onClick={handleClose} variant="contained" color="default">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </form>
    </div>
  );

  return (
    <>
      {/* <Button type="button" onClick={handleOpen}>Following{followingLength}</Button> */}
      <Button type="button" onClick={handleOpen}>
        Edit Profile
      </Button>
      <Modal
        className={classes.modalStyle}
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </>
  );
}
