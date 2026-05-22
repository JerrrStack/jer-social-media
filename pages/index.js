import React, { useState } from "react";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { Box, makeStyles, Paper } from "@material-ui/core";
import { parseCookies } from "nookies";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import CardPost from "../components/Homepage/CardPost";
import NoPost from "../components/Homepage/NoPost";
import DrawerMessage from "../components/Homepage/DrawerMessage";
import NewsFeed from "../components/Homepage/NewsFeed";
const useStyles = makeStyles((theme) => ({
  root: {},
  newsFeed: {
    border: "solid",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

function Index({ user, postsData, errorLoading }) {
  const classes = useStyles();
  const [posts, setPosts] = useState(postsData);

  const [showToastr, setShowToastr] = useState(false);

  return (
    <>
      <CardPost user={user} setPosts={setPosts} />
      {posts.length === 0 || errorLoading ? (
        <NoPost />
      ) : (
        <>
          {posts.map((post) => (
            <NewsFeed
              key={post._id}
              post={post}
              setPosts={setPosts}
              user={user}
              setShowToastr={setShowToastr}
            />
          ))}
        </>
      )}
    </>
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
