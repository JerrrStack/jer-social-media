import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import {
  Avatar,
  Box,
  Button,
  TextField,
  Typography,
} from "@material-ui/core";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import PersonIcon from "@material-ui/icons/Person";
import uploadPic from "../../utils/uploadPicToCloudinary";
import { updateProfile } from "../../utils/profileActions";
import { getDisplayName } from "../../utils/displayUser";
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "92%",
    maxWidth: 440,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2.5),
    outline: "none",
    borderRadius: 12,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: theme.shadows[10],
  },
  modalStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  title: {
    fontWeight: 700,
    fontSize: "1.15rem",
    marginBottom: theme.spacing(2),
  },
  coverBlock: {
    marginBottom: theme.spacing(2),
  },
  coverPreview: {
    width: "100%",
    height: 88,
    objectFit: "cover",
    borderRadius: 8,
    display: "block",
    marginBottom: theme.spacing(1),
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  },
  photoRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    backgroundColor: theme.palette.grey[200],
  },
  field: {
    marginBottom: theme.spacing(1.5),
  },
  modalButton: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  photoBtn: {
    textTransform: "none",
    fontSize: "0.8rem",
  },
}));

export default function EditProfileModal({
  profile,
  setProfile,
  triggerLabel = "Edit profile",
  triggerVariant = "contained",
  triggerIcon = null,
}) {
  const classes = useStyles();
  const profileInputRef = useRef();
  const coverInputRef = useRef();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState({ name: "", bio: "", website: "" });
  const [errorMsg, setErrorMsg] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [coverMedia, setCoverMedia] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const profilePicSrc = mediaPreview || profile.user.profilePicUrl || null;
  const coverSrc = coverPreview || profile.user.coverPicUrl || null;

  const handleOpen = () => {
    setText({
      name: profile.user.name || "",
      bio: profile.bio || "",
      website: profile.website || "",
    });
    setMedia(null);
    setMediaPreview(null);
    setCoverMedia(null);
    setCoverPreview(null);
    setErrorMsg(null);
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media" && files[0]) {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
    if (name === "coverMedia" && files[0]) {
      setCoverMedia(files[0]);
      setCoverPreview(URL.createObjectURL(files[0]));
    }
    setText((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = showLoadingToast("Saving profile...");
    try {
      let profilePicUrl;
      let coverPicUrl;
      if (media) profilePicUrl = await uploadPic(media);
      if (coverMedia) coverPicUrl = await uploadPic(coverMedia);

      const fields = {
        name: text.name.trim(),
        bio: text.bio,
        website: text.website,
      };
      if (profilePicUrl) fields.profilePicUrl = profilePicUrl;
      if (coverPicUrl) fields.coverPicUrl = coverPicUrl;

      await updateProfile(fields, setErrorMsg, (updated) => {
        if (setProfile) setProfile(updated);
        showSuccessToast("Profile saved", toastId);
        setOpen(false);
      });
    } catch {
      showErrorToast("Could not save profile", toastId);
    }
    setSaving(false);
  };

  const body = (
    <div className={classes.paper}>
      <Typography className={classes.title} id="edit-profile-title">
        Edit profile
      </Typography>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Box className={classes.coverBlock}>
          {coverSrc ? (
            <img alt="" src={coverSrc} className={classes.coverPreview} />
          ) : (
            <Box className={classes.coverPreview} />
          )}
          <input
            ref={coverInputRef}
            onChange={handleChange}
            name="coverMedia"
            hidden
            type="file"
            accept="image/*"
          />
          <Button
            size="small"
            variant="outlined"
            className={classes.photoBtn}
            startIcon={<PhotoCameraIcon />}
            onClick={() => coverInputRef.current?.click()}
          >
            {coverSrc ? "Change cover" : "Add cover photo"}
          </Button>
        </Box>

        <Box className={classes.photoRow}>
          <Avatar
            src={profilePicSrc || undefined}
            alt={getDisplayName(profile.user)}
            className={classes.profileAvatar}
          >
            {!profilePicSrc && <PersonIcon />}
          </Avatar>
          <Box>
            <input
              ref={profileInputRef}
              onChange={handleChange}
              name="media"
              hidden
              type="file"
              accept="image/*"
            />
            <Button
              size="small"
              variant="outlined"
              className={classes.photoBtn}
              startIcon={<PhotoCameraIcon />}
              onClick={() => profileInputRef.current?.click()}
            >
              Change photo
            </Button>
          </Box>
        </Box>

        <TextField
          className={classes.field}
          variant="outlined"
          label="Name"
          name="name"
          value={text.name}
          onChange={handleChange}
          fullWidth
          required
          size="small"
        />
        <TextField
          className={classes.field}
          variant="outlined"
          label="Bio"
          name="bio"
          value={text.bio}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
          size="small"
        />
        <TextField
          className={classes.field}
          variant="outlined"
          label="Website"
          name="website"
          value={text.website}
          onChange={handleChange}
          fullWidth
          size="small"
        />

        {errorMsg && (
          <Typography color="error" variant="body2" gutterBottom>
            {errorMsg}
          </Typography>
        )}

        <Box className={classes.modalButton}>
          <Button onClick={() => setOpen(false)} variant="outlined" size="small">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={saving}
          >
            Save
          </Button>
        </Box>
      </form>
    </div>
  );

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        color="primary"
        size="small"
        startIcon={triggerIcon}
        onClick={handleOpen}
        style={{ borderRadius: 8, textTransform: "none", fontWeight: 600 }}
      >
        {triggerLabel}
      </Button>
      <Modal
        className={classes.modalStyle}
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="edit-profile-title"
      >
        {body}
      </Modal>
    </>
  );
}
