import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { likePost } from "../../utils/postActions";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Comments from "./Comments";
import checkTime from "../../utils/checkTime";
import DeleteCommentPopup from "../Post/DeleteCommentPopup";
const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "50%",
    overflow: "scroll",

    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
    outline: "none",
    borderRadius: "10px",
    [theme.breakpoints.down("sm")]: {
      width: "60%",
    },
  },
  NoImagePaper: {
    position: "absolute",
    width: "50%",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
    outline: "none",
    borderRadius: "10px",
    [theme.breakpoints.down("sm")]: {
      width: "auto",
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
    padding: 0,
    margin: 0,
  },
  postPic: {
    height: "500px",
    width: "auto",
    [theme.breakpoints.down("md")]: {
      width: "50%",
      height: "auto",
    },
    [theme.breakpoints.down("xs")]: {
      width: "30%",
      height: "auto",
    },
  },
  commentSection: {
    maxHeight: "73vh",
    minHeight: "73vh",
    overflow: "auto",
    [theme.breakpoints.down("md")]: {
      maxHeight: "35vh",
      minHeight: "35vh",
    },
  },
  NoPostPicComment: {
    maxHeight: "50vh",
    minHeight: "50vh",
    overflow: "auto",
  },
  subDate: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
  },
  actionDate: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

export default function PostModal({
  post,
  user,
  comments,
  setComments,
  setShowModal,
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const opensetting = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const [likes, setLikes] = useState(post.likes);
  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [open, setOpen] = useState(true);

  const handleCloseModal = () => {
    setOpen(false);
    setShowModal(false);
  };

  const body = (
    <div className={classes.paper}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} sm={6} lg={6}>
          <Card
            style={{
              border: "none",
              boxShadow: "none",
              marginBottom: 10,
            }}
          >
            <CardHeader
              avatar={
                <Avatar alt="Profile Pic" src={post.user.profilePicUrl} />
              }
              action={
                <Typography
                  gutterBottom
                  display="inline"
                  variant="caption"
                  color="textSecondary"
                  className={classes.actionDate}
                >
                  {checkTime(post.createdAt)}
                </Typography>
              }
              title={post.user.name}
              subheader={
                <>
                  <Typography
                    gutterBottom
                    display="inline"
                    variant="caption"
                    color="textSecondary"
                    className={classes.subDate}
                  >
                    {checkTime(post.createdAt)}
                  </Typography>
                  <div>{post.text}</div>
                </>
              }
            />

            <Button
              size="small"
              onClick={() =>
                likePost(post._id, user._id, setLikes, isLiked ? false : true)
              }
            >
              {isLiked ? (
                <FavoriteIcon color="secondary" />
              ) : (
                <FavoriteBorderIcon />
              )}

              <span>{likes.length}</span>
            </Button>
          </Card>
          <Box component="div" className={classes.imgContent}>
            <img alt="Post Pic" src={post.picUrl} className={classes.postPic} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sm={6} lg={6}>
          <Card className={classes.commentSection}>
            <Typography>Comments</Typography>
            <Divider />
            {comments.length > 0 &&
              comments.map((comment) => (
                <Card key={comment._id}>
                  <CardHeader
                    avatar={
                      <Avatar
                        alt="Profile Pic"
                        src={comment.user.profilePicUrl}
                      />
                    }
                    action={
                      user._id === comment.user._id ? (
                        <>
                          <Button
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                          >
                            <MoreVertIcon />
                          </Button>
                          <Menu
                            id="fade-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={opensetting}
                            onClose={handleClose}
                          >
                            <MenuItem
                              onClick={handleClose}
                              style={{
                                backgroundColor: "transparent",
                                cursor: "default",
                              }}
                            >
                              <DeleteCommentPopup
                                post={post}
                                setComments={setComments}
                                comment={comment}
                              />
                            </MenuItem>
                          </Menu>
                        </>
                      ) : (
                        <></>
                      )
                    }
                    title={comment.user.name}
                    subheader={comment.text}
                  />
                </Card>
              ))}
          </Card>
          <Comments user={user} post={post} setComments={setComments} />
        </Grid>
      </Grid>
    </div>
  );

  const noImageModal = (
    <div className={classes.NoImagePaper}>
      <Grid item xs={12}>
        <Card
          style={{
            border: "none",
            boxShadow: "none",
            marginBottom: 10,
          }}
        >
          <CardHeader
            avatar={<Avatar alt="Profile Pic" src={post.user.profilePicUrl} />}
            action={
              <Typography
                gutterBottom
                display="inline"
                variant="caption"
                color="textSecondary"
                className={classes.actionDate}
              >
                <span>{checkTime(post.createdAt)}</span>
              </Typography>
            }
            title={post.user.name}
            subheader={
              <>
                <Typography
                  gutterBottom
                  display="inline"
                  variant="caption"
                  color="textSecondary"
                  className={classes.subDate}
                >
                  {checkTime(post.createdAt)}
                </Typography>
                <div>{post.text}</div>
              </>
            }
          />

          <Button
            size="small"
            onClick={() =>
              likePost(post._id, user._id, setLikes, isLiked ? false : true)
            }
          >
            {isLiked ? (
              <FavoriteIcon color="secondary" />
            ) : (
              <FavoriteBorderIcon />
            )}

            <span>{likes.length}</span>
          </Button>
        </Card>
        <Card className={classes.NoPostPicComment}>
          {comments.length > 0 &&
            comments.map((comment) => (
              <Card key={comment._id}>
                <CardHeader
                  avatar={
                    <Avatar
                      alt="Profile Pic"
                      src={comment.user.profilePicUrl}
                    />
                  }
                  action={
                    user._id === comment.user._id ? (
                      <>
                        <Button
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={handleClick}
                        >
                          <MoreVertIcon />
                        </Button>
                        <Menu
                          id="fade-menu"
                          anchorEl={anchorEl}
                          keepMounted
                          open={opensetting}
                          onClose={handleClose}
                        >
                          <MenuItem
                            onClick={handleClose}
                            style={{
                              backgroundColor: "transparent",
                              cursor: "default",
                            }}
                          >
                            <DeleteCommentPopup
                              post={post}
                              setComments={setComments}
                              comment={comment}
                            />
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <></>
                    )
                  }
                  title={comment.user.name}
                  subheader={comment.text}
                />
              </Card>
            ))}
        </Card>

        <Comments user={user} post={post} setComments={setComments} />
      </Grid>
    </div>
  );

  return (
    <>
      {post.picUrl ? (
        <Modal
          className={classes.modalStyle}
          open={open}
          onClose={handleCloseModal}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {body}
        </Modal>
      ) : (
        <Modal
          className={classes.modalStyle}
          open={open}
          onClose={handleCloseModal}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {noImageModal}
        </Modal>
      )}
    </>
  );
}
