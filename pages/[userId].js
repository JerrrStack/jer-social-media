import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import ProfileHeader from "../components/Profile/ProfileHeader";
import { useRouter } from "next/router";
import NewsFeed from "../components/Homepage/NewsFeed";
import NoPostUser from "../components/Homepage/NoPostUser";
import { getProfilePath } from "../utils/displayUser";
import Link from "next/link";

const useStyles = makeStyles((theme) => ({
  page: {
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    boxSizing: "border-box",
  },
  postsBlock: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    backgroundColor: "transparent",
  },
  postsTitle: {
    fontWeight: 700,
    fontSize: "1rem",
    marginBottom: theme.spacing(1.5),
  },
  loadingWrap: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  errorBox: {
    textAlign: "center",
    padding: theme.spacing(6),
  },
}));

function Profile({
  profile: initialProfile,
  followersLength: initialFollowers = 0,
  followingLength: initialFollowing = 0,
  user,
  userFollowStats,
  errorLoading: initialError,
}) {
  const router = useRouter();
  const classes = useStyles();
  const [profile, setProfile] = useState(initialProfile);
  const [followersLength, setFollowersLength] = useState(initialFollowers);
  const [followingLength, setFollowingLength] = useState(initialFollowing);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loadError, setLoadError] = useState(Boolean(initialError));
  const [profileLoading, setProfileLoading] = useState(!initialProfile?.user);

  const profileUserId = router.isReady ? router.query.userId : null;

  useEffect(() => {
    if (!router.isReady || !profileUserId) return;

    if (profile?.user?._id?.toString() === String(profileUserId)) {
      setProfileLoading(false);
      setLoadError(false);
      return;
    }

    const fetchProfile = async () => {
      setProfileLoading(true);
      setLoadError(false);
      try {
        const res = await axios.get(`${baseUrl}/api/profile/${profileUserId}`, {
          headers: { Authorization: cookie.get("token") },
        });
        if (res.data?.profile?.user) {
          setProfile(res.data.profile);
          setFollowersLength(res.data.followersLength ?? 0);
          setFollowingLength(res.data.followingLength ?? 0);
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      }
      setProfileLoading(false);
    };

    fetchProfile();
  }, [router.isReady, profileUserId]);

  useEffect(() => {
    const getPosts = async () => {
      if (!profileUserId || loadError) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/posts/${profileUserId}`,
          { headers: { Authorization: cookie.get("token") } }
        );
        setPosts(res.data);
      } catch {
        setPosts([]);
      }
      setLoading(false);
    };
    if (profile?.user && !loadError) getPosts();
  }, [profileUserId, loadError, profile?.user?._id]);

  if (!router.isReady || profileLoading) {
    return (
      <Box className={classes.loadingWrap}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !profile?.user) {
    return (
      <Box className={classes.errorBox}>
        <Typography variant="h6" gutterBottom>
          Profile not found
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          No user exists with id{" "}
          <Box component="span" fontFamily="monospace">
            {profileUserId}
          </Box>
        </Typography>
        {user?._id && (
          <Box mt={2}>
            <Link href={getProfilePath(user)}>
              <Button color="primary" variant="contained" component="a">
                Go to your profile
              </Button>
            </Link>
          </Box>
        )}
        <Box mt={1}>
          <Button variant="outlined" onClick={() => router.push("/")}>
            Back to feed
          </Button>
        </Box>
      </Box>
    );
  }

  const isOwnProfile =
    user?._id?.toString() === profile.user._id.toString();

  const openChat = () => {
    router.push(`/messages?message=${profile.user._id}`);
  };

  return (
    <Box className={classes.page}>
      <ProfileHeader
        profile={profile}
        setProfile={setProfile}
        followersLength={followersLength}
        followingLength={followingLength}
        user={user}
        userFollowStats={userFollowStats}
        isOwnProfile={isOwnProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChat={openChat}
      />

      {activeTab === 0 && (
        <Box className={classes.postsBlock}>
          <Typography className={classes.postsTitle} component="h2">
            {isOwnProfile ? "My posts" : "Posts"}
          </Typography>
          {loading ? (
            <Box className={classes.loadingWrap}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <NoPostUser isOwnProfile={isOwnProfile} />
          ) : (
            posts.map((post) => (
              <NewsFeed
                key={post._id}
                post={post}
                setPosts={setPosts}
                user={user}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

Profile.getInitialProps = async (ctx) => {
  const { userId } = ctx.query;
  if (!userId) {
    return { errorLoading: true };
  }

  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/profile/${userId}`, {
      headers: { Authorization: token },
    });

    const { profile, followersLength, followingLength } = res.data;

    if (!profile?.user) {
      return { errorLoading: true };
    }

    return {
      profile,
      followersLength,
      followingLength,
    };
  } catch {
    return { errorLoading: true };
  }
};

export default Profile;
