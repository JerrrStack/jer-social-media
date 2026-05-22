import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import checkTime from "../../utils/checkTime";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteCommentPopup from "../Post/DeleteCommentPopup";
import { getDisplayName } from "../../utils/displayUser";
import ProfileLink from "../Profile/ProfileLink";
import Comments from "./Comments";
import { likeComment, unlikeComment } from "../../utils/postActions";
import { getCommentId } from "../../utils/getCommentId";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(1),
    borderRadius: 10,
    padding: theme.spacing(1.25, 1.5),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  },
  reply: {
    marginBottom: theme.spacing(0.5),
    borderRadius: 10,
    padding: theme.spacing(1, 1.5),
    backgroundColor: theme.palette.grey[50],
    borderLeft: `3px solid ${theme.palette.primary.light}`,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.25),
  },
  avatar: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(0.75),
  },
  name: {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    textDecoration: "none",
  },
  time: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  replyLabel: {
    fontSize: "0.75rem",
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
  text: {
    marginTop: theme.spacing(0.5),
    fontSize: "0.9rem",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.75),
  },
  actionBtn: {
    textTransform: "none",
    fontSize: "0.8rem",
    fontWeight: 600,
    padding: theme.spacing(0.25, 1),
    minWidth: "auto",
  },
  likeBtn: {
    padding: 4,
    marginRight: theme.spacing(0.25),
  },
  likeCount: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(0.5),
  },
}));

function AllComments({
  user,
  post,
  setComments,
  comment,
  depth = 0,
  parentAuthorName = null,
  userFollowStats,
  onFollowStatsChange,
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const open = Boolean(anchorEl);
  const isReply = depth > 0;

  const commentId = getCommentId(comment);
  const canDelete = user._id === comment.user._id;
  const displayName = getDisplayName(comment.user);
  const likes = comment.likes || [];
  const likeCount = likes.length;
  const isLiked =
    likeCount > 0 &&
    likes.some((like) => String(like.user) === String(user._id));

  const toggleLike = () => {
    if (isLiked) {
      unlikeComment(post._id, commentId, user._id, setComments);
    } else {
      likeComment(post._id, commentId, user._id, setComments);
    }
  };

  return (
    <Box className={isReply ? classes.reply : classes.root}>
      <Box className={classes.header}>
        <ProfileLink
          user={comment.user}
          currentUser={user}
          userFollowStats={userFollowStats}
          onFollowStatsChange={onFollowStatsChange}
        >
          <Avatar
            alt={displayName}
            src={comment.user.profilePicUrl}
            className={classes.avatar}
          />
        </ProfileLink>
        <Box className={classes.body}>
          <Box className={classes.metaRow}>
            <ProfileLink
              user={comment.user}
              currentUser={user}
              userFollowStats={userFollowStats}
              onFollowStatsChange={onFollowStatsChange}
            >
              <Typography component="span" className={classes.name}>
                {displayName}
              </Typography>
            </ProfileLink>
            <Typography component="span" className={classes.time}>
              {checkTime(comment.date)}
            </Typography>
            {isReply && parentAuthorName && (
              <Typography component="span" className={classes.replyLabel}>
                · Reply to {parentAuthorName}
              </Typography>
            )}
            {canDelete && (
              <>
                <Button
                  size="small"
                  aria-controls="comment-menu"
                  aria-haspopup="true"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  style={{ minWidth: 28, padding: 4, marginLeft: "auto" }}
                >
                  <MoreVertIcon fontSize="small" />
                </Button>
                <Menu
                  id="comment-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={open}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => setAnchorEl(null)}
                    style={{ backgroundColor: "transparent" }}
                  >
                    <DeleteCommentPopup
                      post={post}
                      setComments={setComments}
                      comment={comment}
                    />
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
          <Typography className={classes.text}>{comment.text}</Typography>
          <Box className={classes.actions}>
            <IconButton
              size="small"
              className={classes.likeBtn}
              onClick={toggleLike}
              aria-label={isLiked ? "Unlike comment" : "Like comment"}
            >
              {isLiked ? (
                <FavoriteIcon color="secondary" fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
            {likeCount > 0 && (
              <Typography component="span" className={classes.likeCount}>
                {likeCount}
              </Typography>
            )}
            <Button
              size="small"
              color="primary"
              className={classes.actionBtn}
              onClick={() => setShowReplyInput((v) => !v)}
            >
              {showReplyInput ? "Cancel" : "Reply"}
            </Button>
          </Box>
          {showReplyInput && (
            <Comments
              user={user}
              post={post}
              setComments={setComments}
              parentCommentId={commentId}
              replyToName={displayName}
              compact
              onPosted={() => setShowReplyInput(false)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default AllComments;
