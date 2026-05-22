import React, { useState } from "react";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { Box, makeStyles } from "@material-ui/core";
import { parseCookies } from "nookies";
import CardPost from "../components/Homepage/CardPost";
import NoPost from "../components/Homepage/NoPost";
import NewsFeed from "../components/Homepage/NewsFeed";

const useStyles = makeStyles((theme) => ({
  feed: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    backgroundColor: "transparent",
  },
}));

function Index({ user, postsData, userFollowStats: initialFollowStats, errorLoading }) {
  const classes = useStyles();
  const [posts, setPosts] = useState(postsData);
  const [userFollowStats, setUserFollowStats] = useState(
    initialFollowStats || { following: [], followers: [] }
  );

  const [showToastr, setShowToastr] = useState(false);

  return (
    <Box className={classes.feed}>
      <CardPost user={user} setPosts={setPosts} />
      {posts.length === 0 || errorLoading ? (
        <NoPost />
      ) : (
        posts.map((post) => (
          <NewsFeed
            key={post._id}
            post={post}
            setPosts={setPosts}
            user={user}
            userFollowStats={userFollowStats}
            onFollowStatsChange={setUserFollowStats}
            setShowToastr={setShowToastr}
          />
        ))
      )}
    </Box>
  );
}

Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: { Authorization: token },
      params: { pageNumber: 1 },
    });

    return { postsData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};
export default Index;
