import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import { Button } from "@material-ui/core";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import FollowerModal from "../components/Profile/FollowerModal";
import FollowingModal from "../components/Profile/FollowingModal";
import EditProfileModal from "../components/Profile/EditProfileModal";
import { useRouter } from "next/router";
import NewsFeed from "../components/Homepage/NewsFeed";
import NoPostUser from "../components/Homepage/NoPostUser";
import { followUser, unfollowUser } from "../utils/profileActions";
import CircularProgress from "@material-ui/core/CircularProgress";
const useStyles = makeStyles(() => ({
  root: {},
  media: {
    height: 0,
    paddingTop: "56.25%",
  },

  avatar: {
    backgroundColor: red[500],
  },
}));

function Profile({
  profile,
  followersLength,
  followingLength,
  user,
  userFollowStats,
}) {
  const router = useRouter();
  const classes = useStyles();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(userFollowStats);

  const isFollowing =
    currentUser.following.length > 0 &&
    currentUser.following.filter(
      (following) => following.user === profile.user._id
    ).length > 0;

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const { username } = router.query;
        const res = await axios.get(
          `${baseUrl}/api/profile/posts/${username}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );
        setPosts(res.data);
      } catch (error) {
        alert("Error Loading Posts");
      }
      setLoading(false);
    };
    getPosts();
  }, [router.query.username]);

  return (
    <>
      <Card className={classes.root}>
        <CardHeader
          avatar={
            <Avatar alt={profile.user.name} src={profile.user.profilePicUrl} />
          }
          action={
            user.username === router.query.username ? (
              <></>
            ) : (
              <Button
                variant="contained"
                color={isFollowing ? "secondary" : "primary"}
                onClick={async () => {
                  isFollowing
                    ? await unfollowUser(profile.user._id, setCurrentUser)
                    : await followUser(profile.user._id, setCurrentUser);
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )
          }
          title={profile.user.name}
          subheader={
            <>
              <FollowerModal
                followersLength={followersLength}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                user={user}
                profileUserId={profile.user._id}
              />
              <FollowingModal
                followingLength={followingLength}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                user={user}
                profileUserId={profile.user._id}
              />
              {user.username === router.query.username && (
                <EditProfileModal profile={profile} />
              )}
            </>
          }
        />
        <CardContent>
          <Typography variant="body2" color="textPrimary" component="p">
            {profile.bio}
          </Typography>
          <Typography variant="body2" color="textPrimary" component="p">
            {profile.website}
          </Typography>
        </CardContent>
      </Card>
      {loading ? (
        <CircularProgress style={{ textAlign: "center" }} />
      ) : posts.length === 0 ? (
        <NoPostUser />
      ) : (
        <>
          {posts.map((post) => (
            <NewsFeed
              key={post._id}
              post={post}
              setPosts={setPosts}
              user={user}
              profile={profile}
            />
          ))}
        </>
      )}
    </>
  );
}

Profile.getInitialProps = async (ctx) => {
  try {
    const { username } = ctx.query;

    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
      headers: { Authorization: token },
    });

    const { profile, followersLength, followingLength } = res.data;

    return {
      profile,
      followersLength,
      followingLength,
    };
  } catch (error) {
    return { errorLoading: true };
  }
};
export default Profile;
