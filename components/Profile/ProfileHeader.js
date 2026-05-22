import React, { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  IconButton,
  Tab,
  Tabs,
  Typography,
  makeStyles,
} from "@material-ui/core";
import MessageIcon from "@material-ui/icons/Message";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import uploadPic from "../../utils/uploadPicToCloudinary";
import { updateProfile } from "../../utils/profileActions";
import { getDisplayName } from "../../utils/displayUser";
import FollowerModal from "./FollowerModal";
import FollowingModal from "./FollowingModal";
import EditProfileModal from "./EditProfileModal";
import { followUser, unfollowUser } from "../../utils/profileActions";
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";

const COVER_HEIGHT = 200;
const AVATAR_SIZE = 120;

const useStyles = makeStyles((theme) => ({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    [theme.breakpoints.down("xs")]: {
      borderRadius: 8,
    },
  },
  coverWrap: {
    position: "relative",
    height: COVER_HEIGHT,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, #1e3a5f 100%)`,
    [theme.breakpoints.down("xs")]: {
      height: 160,
    },
  },
  coverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  coverUpload: {
    position: "absolute",
    right: theme.spacing(1.5),
    bottom: theme.spacing(1.5),
    backgroundColor: "rgba(255,255,255,0.9)",
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[2],
    "&:hover": { backgroundColor: "#fff" },
  },
  infoSection: {
    display: "grid",
    gridTemplateColumns: `${AVATAR_SIZE}px 1fr auto`,
    gap: theme.spacing(3),
    alignItems: "center",
    padding: theme.spacing(3, 2.5, 2.5),
    marginTop: -(AVATAR_SIZE / 2),
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
      justifyItems: "center",
      textAlign: "center",
      marginTop: -(AVATAR_SIZE / 2),
      paddingTop: theme.spacing(2.5),
    },
  },
  avatarWrap: {
    position: "relative",
    justifySelf: "start",
    [theme.breakpoints.down("xs")]: {
      justifySelf: "center",
    },
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    border: `4px solid ${theme.palette.background.paper}`,
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.grey[200],
  },
  avatarUpload: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.grey[100],
    border: `2px solid ${theme.palette.background.paper}`,
    padding: 5,
    "&:hover": { backgroundColor: theme.palette.grey[300] },
  },
  identity: {
    minWidth: 0,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(0.5),
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      paddingLeft: 0,
      paddingTop: theme.spacing(1.5),
    },
  },
  name: {
    fontWeight: 700,
    fontSize: "1.35rem",
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
    marginBottom: theme.spacing(0.5),
  },
  handle: {
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    marginTop: theme.spacing(0.75),
    display: "block",
  },
  stats: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1.25),
    "& button": {
      textTransform: "none",
      minWidth: "auto",
      padding: theme.spacing(0.25, 0.75),
      fontWeight: 600,
      fontSize: "0.875rem",
    },
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      justifyContent: "center",
      paddingBottom: 0,
    },
  },
  actionBtn: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(0.75, 2),
    whiteSpace: "nowrap",
  },
  tabsWrap: {
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  tab: {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
    minWidth: 72,
    minHeight: 44,
  },
  aboutBox: {
    padding: theme.spacing(2, 2.5, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: "#fafbfc",
  },
  bioText: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  },
  website: {
    color: theme.palette.primary.main,
    wordBreak: "break-all",
    display: "inline-block",
    marginTop: theme.spacing(0.5),
  },
}));

export default function ProfileHeader({
  profile,
  setProfile,
  followersLength,
  followingLength,
  user,
  userFollowStats,
  isOwnProfile,
  activeTab,
  setActiveTab,
  onOpenChat,
}) {
  const classes = useStyles();
  const coverInputRef = useRef();
  const avatarInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(
    userFollowStats || { following: [], followers: [] }
  );

  const isFollowing =
    Array.isArray(currentUser?.following) &&
    currentUser.following.some(
      (f) => f.user?.toString() === profile.user._id.toString()
    );

  const uploadImage = async (file, field) => {
    if (!file) return;
    setUploading(true);
    const toastId = showLoadingToast("Uploading...");
    try {
      const url = await uploadPic(file);
      const payload =
        field === "coverPicUrl"
          ? { coverPicUrl: url }
          : { profilePicUrl: url };
      await updateProfile(payload, null, (updated) => {
        setProfile(updated);
        showSuccessToast("Photo updated", toastId);
      });
    } catch {
      showErrorToast("Upload failed", toastId);
    }
    setUploading(false);
  };

  return (
    <Card className={classes.card} elevation={0}>
      <Box className={classes.coverWrap}>
        {profile.user.coverPicUrl && (
          <img
            src={profile.user.coverPicUrl}
            alt=""
            className={classes.coverImg}
          />
        )}
        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => uploadImage(e.target.files[0], "coverPicUrl")}
            />
            <IconButton
              className={classes.coverUpload}
              size="small"
              disabled={uploading}
              onClick={() => coverInputRef.current?.click()}
              aria-label="Change cover photo"
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      <Box bgcolor="background.paper">
        <Box className={classes.infoSection}>
          <Box className={classes.avatarWrap}>
            <Avatar
              alt={getDisplayName(profile.user)}
              src={profile.user.profilePicUrl || undefined}
              className={classes.avatar}
            />
            {isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    uploadImage(e.target.files[0], "profilePicUrl")
                  }
                />
                <IconButton
                  className={classes.avatarUpload}
                  size="small"
                  disabled={uploading}
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label="Change profile photo"
                >
                  <PhotoCameraIcon style={{ fontSize: 16 }} />
                </IconButton>
              </>
            )}
          </Box>

          <Box className={classes.identity}>
            <Typography className={classes.name} component="h1" noWrap>
              {getDisplayName(profile.user)}
            </Typography>
            <Typography className={classes.handle} noWrap>
              @{profile.user.username}
            </Typography>
            <Box className={classes.stats}>
              <FollowerModal
                followersLength={followersLength}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                user={user}
                profileUserId={profile.user._id}
              />
              <Typography variant="body2" color="textSecondary">
                ·
              </Typography>
              <FollowingModal
                followingLength={followingLength}
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
                user={user}
                profileUserId={profile.user._id}
              />
            </Box>
          </Box>

          <Box className={classes.actions}>
            {isOwnProfile ? (
              <EditProfileModal profile={profile} setProfile={setProfile} />
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  className={classes.actionBtn}
                  startIcon={<MessageIcon />}
                  onClick={onOpenChat}
                >
                  Message
                </Button>
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  color={isFollowing ? "default" : "primary"}
                  size="small"
                  className={classes.actionBtn}
                  onClick={async () => {
                    isFollowing
                      ? await unfollowUser(profile.user._id, setCurrentUser)
                      : await followUser(profile.user._id, setCurrentUser);
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Box className={classes.tabsWrap}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Posts" className={classes.tab} />
            <Tab label="About" className={classes.tab} />
          </Tabs>
        </Box>

        {activeTab === 1 && (
          <Box className={classes.aboutBox}>
            {profile.bio ? (
              <Typography variant="body1" className={classes.bioText}>
                {profile.bio}
              </Typography>
            ) : (
              <Typography variant="body2" color="textSecondary">
                {isOwnProfile
                  ? "Add a bio in Edit profile."
                  : "No bio yet."}
              </Typography>
            )}
            {profile.website && (
              <Typography
                variant="body2"
                className={classes.website}
                component="a"
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.website}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
}
