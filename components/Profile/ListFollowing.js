import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Button, Typography } from "@material-ui/core";
import { useRouter } from "next/router";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import { followUser, unfollowUser } from "../../utils/profileActions";
import CircularProgress from "@material-ui/core/CircularProgress";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing(1),
  },

  gridContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  gridButton: {
    textAlign: "right",
  },
}));

const divFollower = ({ user, setCurrentUser, profileUserId, currentUser }) => {
  const classes = useStyles();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getFollowing = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/following/${profileUserId}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );

        setFollowing(res.data);
      } catch (error) {
        alert("Error Loading Followers");
      }
      setLoading(false);
    };

    getFollowing();
  }, [router.query.username]);

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : following.length > 0 ? (
        following.map((profileFollowing) => {
          const isFollowing =
            currentUser.following.length > 0 &&
            currentUser.following.filter(
              (following) => following.user === profileFollowing.user._id
            ).length > 0;

          return (
            <div key={profileFollowing._id} className={classes.root}>
              <Grid
                key={profileFollowing.user._id}
                className={classes.gridContainer}
              >
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {profileFollowing.user.name}
                  </Typography>
                </Grid>
                <Grid item xs={6} className={classes.gridButton}>
                  {profileFollowing.user._id !== user._id && (
                    <Button
                      size="small"
                      variant="contained"
                      color={isFollowing ? "secondary" : "primary"}
                      disabled={followLoading}
                      onClick={async () => {
                        setFollowLoading(true);

                        isFollowing
                          ? await unfollowUser(
                              profileFollowing.user._id,
                              setCurrentUser
                            )
                          : await followUser(
                              profileFollowing.user._id,
                              setCurrentUser
                            );

                        setFollowLoading(false);
                      }}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </div>
          );
        })
      ) : (
        " NO FOLLOWER"
      )}
    </>
  );
};

export default divFollower;
