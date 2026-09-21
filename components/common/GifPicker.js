import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";

const useStyles = makeStyles((theme) => ({
  panel: {
    width: 320,
    maxHeight: 340,
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  header: {
    padding: theme.spacing(1.25, 1.5, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    fontSize: "0.8rem",
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  grid: {
    flex: 1,
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
    padding: theme.spacing(1),
    minHeight: 180,
  },
  gifBtn: {
    border: "none",
    padding: 0,
    borderRadius: 8,
    overflow: "hidden",
    cursor: "pointer",
    background: theme.palette.grey[100],
    aspectRatio: "1 / 1",
    transition: "transform 0.15s ease, opacity 0.15s ease",
    "&:hover": {
      transform: "scale(1.03)",
      opacity: 0.92,
    },
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
  },
  empty: {
    gridColumn: "1 / -1",
    textAlign: "center",
    color: theme.palette.text.secondary,
    padding: theme.spacing(3, 1),
    fontSize: "0.85rem",
  },
  loading: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
}));

function GifPicker({ onSelect }) {
  const classes = useStyles();
  const [query, setQuery] = useState("happy");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const token = cookie.get("token");
        const res = await axios.get(`${baseUrl}/api/gifs`, {
          params: { q: query || "happy" },
          headers: token ? { Authorization: token } : {},
        });
        if (!cancelled) setGifs(res.data || []);
      } catch (err) {
        if (!cancelled) {
          setGifs([]);
          setError(
            err.response?.data?.message ||
              "GIF search unavailable. Add GIPHY_API_KEY on the server."
          );
        }
      }
      if (!cancelled) setLoading(false);
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <Paper className={classes.panel} elevation={3}>
      <Box className={classes.header}>
        <Typography className={classes.title}>GIFs</Typography>
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          placeholder="Search GIFs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box className={classes.grid}>
        {loading && (
          <Box className={classes.loading}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!loading && error && (
          <Typography className={classes.empty}>{error}</Typography>
        )}
        {!loading &&
          !error &&
          gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              className={classes.gifBtn}
              onClick={() => onSelect(gif.url)}
            >
              <img src={gif.preview || gif.url} alt={gif.title || "GIF"} />
            </button>
          ))}
        {!loading && !error && gifs.length === 0 && (
          <Typography className={classes.empty}>No GIFs found</Typography>
        )}
      </Box>
    </Paper>
  );
}

export default GifPicker;
