import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
  Avatar,
  Button,
  CardHeader,
  CardMedia,
  Divider,
  Link,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import checkTime from "../../utils/checkTime";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import Comments from "./Comments";
import AllComments from "./AllComments";
import DeletePostPopup from "../Post/DeletePostPopup";
import { likePost } from "../../utils/postActions";
import PostModal from "./PostModal";
import Sidebar from "./Sidebar";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "",
    marginTop: 25,
  },

  media: {
    textAlign: "center",
    backgroundColor: "",
    display: "inline-border",
  },
  viewMore: {
    textAlign: "center",
  },
  postPicture: {
    cursor: "pointer",
    width: "auto",
    height: "800px",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: "auto",
    },
  },
}));

export default function NewsFeed({ user, post, setPosts, setShowToastr }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [likes, setLikes] = useState(post.likes);

  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  const [comments, setComments] = useState(post.comments);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Link color="inherit" href={`/${post.user.username}`}>
            <Avatar src={post.user.profilePicUrl} />
          </Link>
        }
        action={
          <>
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
            {user._id === post.user._id ? (
              <>
                {" "}
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
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem
                    onClick={handleClose}
                    style={{
                      backgroundColor: "transparent",
                      cursor: "default",
                    }}
                  >
                    <DeletePostPopup
                      post={post}
                      setPosts={setPosts}
                      setShowToastr={setShowToastr}
                    />
                  </MenuItem>
                </Menu>{" "}
              </>
            ) : (
              <></>
            )}
          </>
        }
        title={
          <Link color="inherit" href={`/${post.user.username}`}>
            <Typography gutterBottom display="inline" variant="body2">
              {post.user.username}
            </Typography>
          </Link>
        }
        subheader={
          <Typography
            gutterBottom
            display="inline"
            variant="caption"
            color="textSecondary"
          >
            {checkTime(post.createdAt)}
          </Typography>
        }
      />

      <CardContent>
        <Typography variant="body2" component="p">
          {post.text}
        </Typography>
      </CardContent>

      {post.picUrl ? (
        <CardContent className={classes.media}>
          <CardMedia>
            <img
              src={post.picUrl}
              className={classes.postPicture}
              onClick={() => setShowModal(true)}
            />
          </CardMedia>
        </CardContent>
      ) : (
        <></>
      )}

      <CardContent>
        {comments.length > 0 &&
          comments.map((comment, i) => (
            <AllComments
              key={comment._id}
              comment={comment}
              setComments={setComments}
              post={post}
              user={user}
            />
          ))}

        <br />
        {comments.length > 3 && (
          <Typography className={classes.viewMore} variant="body2">
            <Button color="primary" onClick={() => setShowModal(true)}>
              View more comments
            </Button>
          </Typography>
        )}

        <Divider variant="middle" />
      </CardContent>

      <Comments user={user} post={post} setComments={setComments} />

      {showModal && (
        <PostModal
          post={post}
          user={user}
          comments={comments}
          setComments={setComments}
          setPosts={setPosts}
          setShowToastr={setShowToastr}
          setShowModal={setShowModal}
        />
      )}
    </Card>
  );
}
