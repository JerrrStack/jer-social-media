import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { Box, Button, makeStyles, Paper, Typography } from "@material-ui/core";
import DynamicFeedIcon from "@material-ui/icons/DynamicFeed";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import CardPost from "../components/Homepage/CardPost";
import NoPost from "../components/Homepage/NoPost";
import NewsFeed from "../components/Homepage/NewsFeed";
import PeopleYouMayKnow from "../components/Homepage/PeopleYouMayKnow";
import TrendingTopics from "../components/Homepage/TrendingTopics";

const useStyles = makeStyles((theme) => ({
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: theme.spacing(2),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "260px minmax(0, 680px) 300px",
      justifyContent: "center",
      alignItems: "start",
    },
  },
  feed: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    backgroundColor: "transparent",
    minWidth: 0,
  },
  aside: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "block",
    },
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  filterText: {
    fontWeight: 650,
    fontSize: "0.95rem",
  },
  filterTag: {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  latestBtn: {
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 8,
    whiteSpace: "nowrap",
  },
}));

function Index({
  user,
  postsData,
  userFollowStats: initialFollowStats,
  errorLoading,
}) {
  const classes = useStyles();
  const router = useRouter();
  const [posts, setPosts] = useState(postsData || []);
  const [userFollowStats, setUserFollowStats] = useState(
    initialFollowStats || { following: [], followers: [] }
  );
  const [activeTag, setActiveTag] = useState(null);
  const [trendRefreshKey, setTrendRefreshKey] = useState(0);

  const [showToastr, setShowToastr] = useState(false);

  // Open a trend from /trending → /?tag=Name
  useEffect(() => {
    const tag = router.query?.tag;
    if (typeof tag === "string" && tag.trim()) {
      setActiveTag(tag.trim());
    }
  }, [router.query?.tag]);

  const visiblePosts = useMemo(() => {
    if (!activeTag) return posts;
    const needle = `#${activeTag}`.toLowerCase();
    return posts.filter((p) => (p.text || "").toLowerCase().includes(needle));
  }, [posts, activeTag]);

  const clearTrendFilter = () => {
    setActiveTag(null);
    if (router.query?.tag) {
      router.replace("/", undefined, { shallow: true });
    }
  };

  const handleSelectTag = (tag) => {
    setActiveTag(tag);
    if (!tag && router.query?.tag) {
      router.replace("/", undefined, { shallow: true });
    } else if (tag) {
      router.replace({ pathname: "/", query: { tag } }, undefined, {
        shallow: true,
      });
    }
  };

  const handlePostCreated = () => {
    setActiveTag(null);
    setTrendRefreshKey((k) => k + 1);
    if (router.query?.tag) {
      router.replace("/", undefined, { shallow: true });
    }
  };

  return (
    <Box className={classes.layout}>
      <Box className={classes.aside} component="aside">
        <TrendingTopics
          activeTag={activeTag}
          onSelectTag={handleSelectTag}
          refreshKey={trendRefreshKey}
          posts={posts}
        />
      </Box>

      <Box className={classes.feed}>
        <CardPost
          user={user}
          setPosts={setPosts}
          onPostCreated={handlePostCreated}
        />

        {activeTag && (
          <Paper className={classes.filterBar} elevation={0}>
            <Typography className={classes.filterText}>
              Viewing posts with{" "}
              <span className={classes.filterTag}>#{activeTag}</span>
            </Typography>
            <Button
              color="primary"
              variant="contained"
              size="small"
              className={classes.latestBtn}
              startIcon={<DynamicFeedIcon />}
              onClick={clearTrendFilter}
            >
              Latest news feed
            </Button>
          </Paper>
        )}

        {errorLoading || visiblePosts.length === 0 ? (
          <NoPost
            filtered={Boolean(activeTag)}
            tag={activeTag}
            onClearFilter={clearTrendFilter}
          />
        ) : (
          visiblePosts.map((post) => (
            <NewsFeed
              key={post._id}
              post={post}
              setPosts={setPosts}
              user={user}
              userFollowStats={userFollowStats}
              onFollowStatsChange={setUserFollowStats}
              setShowToastr={setShowToastr}
              activeTag={activeTag}
              onSelectTag={handleSelectTag}
            />
          ))
        )}
      </Box>

      <Box className={classes.aside} component="aside">
        <PeopleYouMayKnow
          userFollowStats={userFollowStats}
          onFollowStatsChange={setUserFollowStats}
        />
      </Box>
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
