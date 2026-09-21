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
import CommentThread from "./CommentThread";
import { normalizeComments } from "../../utils/groupComments";
import DeletePostPopup from "../Post/DeletePostPopup";
import { likePost } from "../../utils/postActions";
import PostModal from "./PostModal";
import Sidebar from "./Sidebar";
import { getDisplayName } from "../../utils/displayUser";
import ProfileLink from "../Profile/ProfileLink";
import { renderMentionText } from "../../utils/renderMentions";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  viewMore: {
    textAlign: "center",
  },
  postText: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "0.98rem",
    lineHeight: 1.45,
  },
  mention: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    textDecoration: "none",
  },
  hashtag: {
    display: "inline",
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: "inherit",
    fontFamily: "inherit",
    lineHeight: "inherit",
    "&:hover": {
      textDecoration: "underline",
    },
    "&.is-active": {
      backgroundColor: "rgba(24, 119, 242, 0.12)",
      borderRadius: 4,
      padding: "0 3px",
    },
  },
  likeBtn: {
    minWidth: 0,
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 650,
  },
  postPicture: {
    cursor: "pointer",
    display: "block",
    width: "100%",
    maxHeight: 560,
    objectFit: "cover",
    backgroundColor: "#000",
  },
  media: {
    textAlign: "center",
    padding: 0,
    "&:last-child": {
      paddingBottom: 0,
    },
  },
}));

export default function NewsFeed({
  user,
  post,
  setPosts,
  setShowToastr,
  userFollowStats,
  onFollowStatsChange,
  activeTag,
  onSelectTag,
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [likes, setLikes] = useState(post.likes);

  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  const [comments, setComments] = useState(normalizeComments(post.comments));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card className={`${classes.root} sayhi-fade-up`}>
      <CardHeader
        avatar={
          <ProfileLink
            user={post.user}
            currentUser={user}
            userFollowStats={userFollowStats}
            onFollowStatsChange={onFollowStatsChange}
          >
            <Avatar
              alt={getDisplayName(post.user)}
              src={post.user.profilePicUrl}
            />
          </ProfileLink>
        }
        action={
          <>
            <Button
              size="small"
              className={classes.likeBtn}
              onClick={() =>
                likePost(post._id, user._id, setLikes, isLiked ? false : true)
              }
            >
              {isLiked ? (
                <FavoriteIcon color="secondary" />
              ) : (
                <FavoriteBorderIcon />
              )}
              <span style={{ marginLeft: 6 }}>{likes.length}</span>
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
          <ProfileLink
            user={post.user}
            currentUser={user}
            userFollowStats={userFollowStats}
            onFollowStatsChange={onFollowStatsChange}
          >
            <Typography gutterBottom display="inline" variant="body2">
              {getDisplayName(post.user)}
            </Typography>
          </ProfileLink>
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

      {Boolean(post.text && post.text.trim()) && (
        <CardContent>
          <Typography variant="body2" component="p" className={classes.postText}>
            {renderMentionText(post.text, classes.mention, {
              onHashtagClick: (tag) => {
                if (!onSelectTag) return;
                if (activeTag && activeTag.toLowerCase() === tag.toLowerCase()) {
                  onSelectTag(null);
                } else {
                  onSelectTag(tag);
                }
              },
              hashtagClassName: classes.hashtag,
              activeTag,
            })}
          </Typography>
        </CardContent>
      )}

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

      <CardContent style={{ paddingTop: 8, paddingBottom: 8 }}>
        {comments.length > 0 && (
          <CommentThread
            comments={comments}
            setComments={setComments}
            post={post}
            user={user}
            userFollowStats={userFollowStats}
            onFollowStatsChange={onFollowStatsChange}
          />
        )}

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
          userFollowStats={userFollowStats}
          onFollowStatsChange={onFollowStatsChange}
        />
      )}
    </Card>
  );
}
