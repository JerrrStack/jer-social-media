import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import axios from "axios";
import cookie from "js-cookie";
import { useRouter } from "next/router";
import baseUrl from "../../utils/baseUrl";

const TOP_VISIBLE = 5;
const TAG_REGEX = /#([A-Za-z][A-Za-z0-9_]{0,49})/g;

const useStyles = makeStyles((theme) => ({
  root: {
    position: "sticky",
    top: 72,
    borderRadius: 12,
    padding: theme.spacing(1.5, 1.25, 1.25),
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.25),
    paddingLeft: theme.spacing(0.5),
  },
  title: {
    fontWeight: 700,
    fontSize: "1.05rem",
    flex: 1,
  },
  clearBtn: {
    textTransform: "none",
    fontWeight: 650,
    fontSize: "0.75rem",
    minWidth: 0,
    padding: theme.spacing(0.25, 1),
    borderRadius: 8,
  },
  totalBadge: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    backgroundColor: "rgba(24, 119, 242, 0.1)",
    borderRadius: 10,
    padding: "2px 8px",
    lineHeight: 1.4,
  },
  row: {
    display: "block",
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: theme.spacing(1.1, 1),
    borderRadius: 10,
    transition: "background 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
  },
  rowActive: {
    backgroundColor: "rgba(24, 119, 242, 0.08)",
  },
  meta: {
    fontSize: "0.72rem",
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  tag: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: theme.palette.primary.main,
  },
  count: {
    fontSize: "0.78rem",
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(3, 0),
  },
  empty: {
    color: theme.palette.text.secondary,
    fontSize: "0.85rem",
    padding: theme.spacing(1, 0.5),
  },
  viewAll: {
    marginTop: theme.spacing(0.5),
    width: "100%",
    textTransform: "none",
    fontWeight: 650,
    borderRadius: 8,
    color: theme.palette.primary.main,
  },
}));

function formatLabel(tag) {
  return String(tag)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
}

function extractTopicsFromPosts(posts = []) {
  const counts = {};
  const displayCase = {};

  for (const post of posts) {
    const text = String(post?.text || "");
    const seen = new Set();
    const re = new RegExp(TAG_REGEX.source, "g");
    let match;
    while ((match = re.exec(text)) !== null) {
      const original = match[1];
      const key = original.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      counts[key] = (counts[key] || 0) + 1;
      if (!displayCase[key]) displayCase[key] = original;
    }
  }

  return Object.keys(counts).map((key) => ({
    tag: displayCase[key],
    label: formatLabel(displayCase[key]),
    count: counts[key],
  }));
}

/** Prefer API (site-wide) counts; keep feed tags so brand-new hashtags appear. */
function mergeTopics(apiTopics = [], feedTopics = []) {
  const map = {};

  for (const topic of apiTopics) {
    if (!topic?.tag) continue;
    const key = String(topic.tag).toLowerCase();
    map[key] = {
      tag: topic.tag,
      label: topic.label || formatLabel(topic.tag),
      count: Number(topic.count) || 1,
    };
  }

  for (const topic of feedTopics) {
    if (!topic?.tag) continue;
    const key = String(topic.tag).toLowerCase();
    if (!map[key]) {
      map[key] = {
        tag: topic.tag,
        label: topic.label || formatLabel(topic.tag),
        count: Number(topic.count) || 1,
      };
    } else {
      map[key].count = Math.max(map[key].count, Number(topic.count) || 1);
    }
  }

  return Object.values(map).sort(
    (a, b) =>
      b.count - a.count ||
      a.tag.toLowerCase().localeCompare(b.tag.toLowerCase())
  );
}

function TrendingTopics({ activeTag, onSelectTag, refreshKey, posts = [] }) {
  const classes = useStyles();
  const router = useRouter();
  const [apiTopics, setApiTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const feedSignature = useMemo(() => {
    const firstId = posts[0]?._id || "";
    return `${posts.length}:${firstId}`;
  }, [posts]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const token = cookie.get("token");
        const res = await axios.get(`${baseUrl}/api/trending`, {
          headers: { Authorization: token },
          params: { _t: Date.now() },
        });
        if (!cancelled) {
          const data = res.data || {};
          const list = Array.isArray(data) ? data : data.topics || [];
          setApiTopics(list);
        }
      } catch {
        if (!cancelled) setApiTopics([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, feedSignature]);

  const topics = useMemo(
    () => mergeTopics(apiTopics, extractTopicsFromPosts(posts)),
    [apiTopics, posts]
  );

  // Sidebar: top 5 ranked strictly by post count
  const topTopics = topics.slice(0, TOP_VISIBLE);
  const total = topics.length;

  return (
    <Paper className={classes.root} elevation={0}>
      <Box className={classes.titleRow}>
        <TrendingUpIcon color="primary" fontSize="small" />
        <Typography className={classes.title}>Trending</Typography>
        <span className={classes.totalBadge}>{total}</span>
        {activeTag && (
          <Button
            size="small"
            color="primary"
            className={classes.clearBtn}
            onClick={() => onSelectTag?.(null)}
          >
            Latest
          </Button>
        )}
      </Box>

      {loading && topics.length === 0 && (
        <Box className={classes.loading}>
          <CircularProgress size={22} />
        </Box>
      )}

      {!loading && topics.length === 0 && (
        <Typography className={classes.empty}>
          No trends yet. Use #hashtags in a post.
        </Typography>
      )}

      {topTopics.map((topic, index) => {
        const isActive =
          activeTag && activeTag.toLowerCase() === topic.tag.toLowerCase();
        return (
          <button
            key={`${topic.tag}-${index}`}
            type="button"
            className={`${classes.row} ${isActive ? classes.rowActive : ""}`}
            onClick={() => onSelectTag?.(isActive ? null : topic.tag)}
          >
            <Typography className={classes.meta}>
              {index + 1} · Trending
            </Typography>
            <Typography className={classes.tag}>#{topic.label}</Typography>
            <Typography className={classes.count}>
              {topic.count} {topic.count === 1 ? "post" : "posts"}
            </Typography>
          </button>
        );
      })}

      {total > 0 && (
        <Button
          className={classes.viewAll}
          onClick={() => router.push("/trending")}
        >
          {total > TOP_VISIBLE
            ? `View all trends (${total - TOP_VISIBLE} more)`
            : "View all trends"}
        </Button>
      )}
    </Paper>
  );
}

export default TrendingTopics;
