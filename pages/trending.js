import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import SearchIcon from "@material-ui/icons/Search";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import RefreshIcon from "@material-ui/icons/Refresh";
import axios from "axios";
import cookie from "js-cookie";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import baseUrl from "../utils/baseUrl";

const useStyles = makeStyles((theme) => ({
  page: {
    width: "100%",
    maxWidth: 680,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  backBtn: {
    marginLeft: -6,
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: "1.15rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flex: 1,
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    backgroundColor: "rgba(24, 119, 242, 0.1)",
    borderRadius: 10,
    padding: "2px 8px",
  },
  searchCard: {
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  searchInput: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 20,
      backgroundColor: "#F0F2F5",
      "& fieldset": { border: "none" },
    },
  },
  list: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  row: {
    display: "block",
    width: "100%",
    textAlign: "left",
    border: "none",
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: "transparent",
    cursor: "pointer",
    padding: theme.spacing(1.5, 2),
    transition: "background 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    "&:last-child": {
      borderBottom: "none",
    },
  },
  meta: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  tag: {
    fontWeight: 700,
    fontSize: "1.05rem",
    color: theme.palette.primary.main,
  },
  count: {
    fontSize: "0.82rem",
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
  empty: {
    padding: theme.spacing(4, 2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(6),
  },
}));

function normalizeTopics(data) {
  if (Array.isArray(data)) {
    return {
      topics: data,
      total: data.length,
    };
  }
  const list = Array.isArray(data?.topics) ? data.topics : [];
  return {
    topics: list,
    total: typeof data?.total === "number" ? data.total : list.length,
  };
}

function TrendingPage({ initialTopics = [], initialTotal = 0 }) {
  const classes = useStyles();
  const router = useRouter();
  const [topics, setTopics] = useState(initialTopics);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const loadTrends = useCallback(async () => {
    setLoading(true);
    try {
      const token = cookie.get("token");
      const res = await axios.get(`${baseUrl}/api/trending`, {
        headers: { Authorization: token },
        params: { _t: Date.now() },
      });
      const { topics: list, total: count } = normalizeTopics(res.data);
      setTopics(list);
      setTotal(count);
    } catch (err) {
      console.error("Failed to load trends", err);
      // Keep whatever we already have (SSR / previous load)
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  const filtered = useMemo(() => {
    const q = query.trim().replace(/^#/, "").toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        String(t.tag || "")
          .toLowerCase()
          .includes(q) ||
        String(t.label || "")
          .toLowerCase()
          .includes(q)
    );
  }, [topics, query]);

  const openTag = (tag) => {
    router.push({ pathname: "/", query: { tag } });
  };

  return (
    <Box className={classes.page}>
      <Paper className={classes.header} elevation={0}>
        <IconButton
          className={classes.backBtn}
          onClick={() => router.push("/")}
          aria-label="Back to feed"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography className={classes.headerTitle}>
          <TrendingUpIcon color="primary" />
          All trends
          <span className={classes.badge}>{total}</span>
        </Typography>
        <IconButton
          onClick={loadTrends}
          aria-label="Refresh trends"
          disabled={loading}
        >
          <RefreshIcon />
        </IconButton>
      </Paper>

      <Paper className={classes.searchCard} elevation={0}>
        <TextField
          className={classes.searchInput}
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search trends (e.g. test)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper className={classes.list} elevation={0}>
        {loading && topics.length === 0 && (
          <Box className={classes.loading}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Typography className={classes.empty}>
            {query.trim()
              ? `No trends match “${query.trim()}”.`
              : "No trends yet. Use #hashtags in a post."}
          </Typography>
        )}

        {filtered.map((topic, index) => (
          <button
            key={`${topic.tag}-${index}`}
            type="button"
            className={classes.row}
            onClick={() => openTag(topic.tag)}
          >
            <Typography className={classes.meta}>
              #{topic.rank || index + 1} · Ranked by posts
            </Typography>
            <Typography className={classes.tag}>
              #{topic.label || topic.tag}
            </Typography>
            <Typography className={classes.count}>
              {topic.count} {topic.count === 1 ? "post" : "posts"}
            </Typography>
          </button>
        ))}
      </Paper>
    </Box>
  );
}

TrendingPage.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/trending`, {
      headers: { Authorization: token },
      params: { _t: Date.now() },
    });
    const { topics, total } = normalizeTopics(res.data);
    return {
      initialTopics: topics,
      initialTotal: total,
    };
  } catch {
    return { initialTopics: [], initialTotal: 0 };
  }
};

export default TrendingPage;
