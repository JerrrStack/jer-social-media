import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Popper from "@material-ui/core/Popper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { getProfilePath } from "../../utils/displayUser";
import { fetchProfilePreview } from "../../utils/fetchProfilePreview";
import ProfileHoverCard from "./ProfileHoverCard";

const HOVER_OPEN_MS = 450;
const HOVER_CLOSE_MS = 200;

export default function ProfileLink({
  user,
  currentUser,
  userFollowStats,
  onFollowStatsChange,
  children,
  className,
  style,
}) {
  const anchorRef = useRef(null);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const popperHover = useRef(false);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const userId = user?._id ? String(user._id) : null;
  const isSelf =
    userId &&
    currentUser?._id &&
    userId === String(currentUser._id);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const close = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, []);

  const loadPreview = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchProfilePreview(userId);
      setPreview(data);
    } catch {
      setPreview(null);
    }
    setLoading(false);
  };

  const scheduleOpen = () => {
    if (isSelf || !userId) return;
    clearTimers();
    closeTimer.current = setTimeout(() => {
      setOpen(true);
      loadPreview();
    }, HOVER_OPEN_MS);
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => {
      if (!popperHover.current) close();
    }, HOVER_CLOSE_MS);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    popperHover.current = true;
  };

  const leavePopper = () => {
    popperHover.current = false;
    scheduleClose();
  };

  if (!userId) {
    return <span className={className}>{children}</span>;
  }

  if (isSelf) {
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          color: "inherit",
          textDecoration: "none",
          cursor: "default",
          ...style,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <>
      <span
        ref={anchorRef}
        className={className}
        style={{ display: "inline-flex", ...style }}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
      >
        <Link href={getProfilePath(user)}>
          <a
            style={{
              color: "inherit",
              textDecoration: "none",
              fontWeight: "inherit",
            }}
          >
            {children}
          </a>
        </Link>
      </span>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1400 }}
        modifiers={{
          offset: { offset: "0, 8" },
          preventOverflow: { enabled: true, boundariesElement: "viewport" },
        }}
      >
        <ClickAwayListener onClickAway={close}>
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={leavePopper}
          >
            <ProfileHoverCard
              preview={preview}
              loading={loading}
              profileUserId={userId}
              currentUser={currentUser}
              userFollowStats={userFollowStats}
              onFollowStatsChange={onFollowStatsChange}
              onClose={close}
            />
          </div>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
