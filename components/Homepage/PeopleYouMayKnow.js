import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import axios from "axios";
import cookie from "js-cookie";
import Link from "next/link";
import baseUrl from "../../utils/baseUrl";
import { followUser } from "../../utils/profileActions";
import { getDisplayName, getProfilePath } from "../../utils/displayUser";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "sticky",
    top: 72,
    borderRadius: 12,
    padding: theme.spacing(1.5, 1.25, 1.25),
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  title: {
    fontWeight: 700,
    fontSize: "1.05rem",
    marginBottom: theme.spacing(1.25),
    paddingLeft: theme.spacing(0.5),
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 0.5),
    borderRadius: 10,
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.03)",
    },
  },
  info: {
    flex: 1,
    minWidth: 0,
    textDecoration: "none",
    color: "inherit",
  },
  name: {
    fontWeight: 650,
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  handle: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  followBtn: {
    flexShrink: 0,
    borderRadius: 18,
    minWidth: 72,
    padding: "4px 12px",
    fontWeight: 700,
    textTransform: "none",
  },
  empty: {
    color: theme.palette.text.secondary,
    fontSize: "0.85rem",
    padding: theme.spacing(1, 0.5, 0.5),
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(3, 0),
  },
}));

function PeopleYouMayKnow({ userFollowStats, onFollowStatsChange }) {
  const classes = useStyles();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const token = cookie.get("token");
        const res = await axios.get(`${baseUrl}/api/profile/suggestions`, {
          headers: { Authorization: token },
        });
        if (!cancelled) setPeople(res.data || []);
      } catch {
        if (!cancelled) setPeople([]);
      }
      if (!cancelled) setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userFollowStats?.following?.length]);

  const handleFollow = async (personId) => {
    await followUser(personId, onFollowStatsChange);
    setPeople((prev) => prev.filter((p) => p._id !== personId));
  };

  return (
    <Paper className={classes.root} elevation={0}>
      <Typography className={classes.title}>People you may know</Typography>

      {loading && (
        <Box className={classes.loading}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && people.length === 0 && (
        <Typography className={classes.empty}>
          No suggestions right now. Check back after more people join.
        </Typography>
      )}

      {!loading &&
        people.map((person) => (
          <Box key={person._id} className={classes.row}>
            <Avatar src={person.profilePicUrl} alt={getDisplayName(person)} />
            <Link href={getProfilePath(person)}>
              <a className={classes.info}>
                <Typography className={classes.name}>
                  {getDisplayName(person)}
                </Typography>
                <Typography className={classes.handle}>
                  @{person.username}
                </Typography>
              </a>
            </Link>
            <Button
              size="small"
              color="primary"
              variant="contained"
              className={classes.followBtn}
              onClick={() => handleFollow(person._id)}
            >
              Follow
            </Button>
          </Box>
        ))}
    </Paper>
  );
}

export default PeopleYouMayKnow;
