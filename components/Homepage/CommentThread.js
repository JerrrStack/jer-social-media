import React from "react";
import { Box, makeStyles } from "@material-ui/core";
import AllComments from "./AllComments";
import {
  buildCommentTree,
  getCommentAuthorName,
} from "../../utils/groupComments";
import { getCommentId } from "../../utils/getCommentId";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0),
  },
  thread: {
    marginBottom: theme.spacing(0.5),
  },
  children: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
    paddingLeft: theme.spacing(1.5),
    borderLeft: `2px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(2),
      paddingLeft: theme.spacing(1),
    },
  },
}));

function CommentBranch({
  comment,
  depth,
  parentAuthorName,
  user,
  post,
  setComments,
  userFollowStats,
  onFollowStatsChange,
}) {
  const classes = useStyles();

  return (
    <Box className={depth === 0 ? classes.thread : undefined}>
      <AllComments
        comment={comment}
        setComments={setComments}
        post={post}
        user={user}
        depth={depth}
        parentAuthorName={parentAuthorName}
        userFollowStats={userFollowStats}
        onFollowStatsChange={onFollowStatsChange}
      />
      {comment.children?.length > 0 && (
        <Box className={classes.children}>
          {comment.children.map((child) => (
            <CommentBranch
              key={getCommentId(child)}
              comment={child}
              depth={depth + 1}
              parentAuthorName={getCommentAuthorName(comment)}
              user={user}
              post={post}
              setComments={setComments}
              userFollowStats={userFollowStats}
              onFollowStatsChange={onFollowStatsChange}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function CommentThread({
  comments,
  user,
  post,
  setComments,
  userFollowStats,
  onFollowStatsChange,
}) {
  const classes = useStyles();
  const tree = buildCommentTree(comments);

  if (tree.length === 0) return null;

  return (
    <Box className={classes.root}>
      {tree.map((comment) => (
        <CommentBranch
          key={getCommentId(comment)}
          comment={comment}
          depth={0}
          parentAuthorName={null}
          user={user}
          post={post}
          setComments={setComments}
          userFollowStats={userFollowStats}
          onFollowStatsChange={onFollowStatsChange}
        />
      ))}
    </Box>
  );
}
