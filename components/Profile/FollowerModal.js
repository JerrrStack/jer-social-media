import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, IconButton } from "@material-ui/core";
import ListFollower from "./ListFollower";
import CancelIcon from "@material-ui/icons/Cancel";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    minWidth: "20vw",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
    outline: "none",
    borderRadius: "10px",
  },
  modalStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    padding: 0,
    float: "Right",
    "&:hover": {
      color: "#000",
    },
  },
}));

export default function Follower({
  followersLength,
  currentUser,
  setCurrentUser,
  user,
  profileUserId,
}) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <>
      <div className={classes.paper}>
        <IconButton className={classes.iconButton} onClick={handleClose}>
          <CancelIcon fontSize="inherit" />
        </IconButton>

        <h2 id="simple-modal-title">Followers</h2>

        <ListFollower
          setCurrentUser={setCurrentUser}
          user={user}
          profileUserId={profileUserId}
          currentUser={currentUser}
        />
      </div>
    </>
  );

  return (
    <>
      <Button type="button" onClick={handleOpen}>
        Followers&nbsp;{followersLength}
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
