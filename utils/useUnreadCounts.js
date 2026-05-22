import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import cookie from "js-cookie";
import baseUrl from "./baseUrl";

export default function useUnreadCounts(user) {
  const router = useRouter();
  const [messageCount, setMessageCount] = useState(
    user?.unreadMessageCount ?? (user?.unreadMessage ? 1 : 0)
  );
  const [notificationCount, setNotificationCount] = useState(
    user?.unreadNotificationCount ?? (user?.unreadNotification ? 1 : 0)
  );

  const refreshCounts = useCallback(async () => {
    const token = cookie.get("token");
    if (!token) return;

    try {
      const { data } = await axios.get(`${baseUrl}/api/auth`, {
        headers: { Authorization: token },
      });
      setMessageCount(data.user?.unreadMessageCount ?? 0);
      setNotificationCount(data.user?.unreadNotificationCount ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshCounts();
  }, [router.pathname, router.query.message, refreshCounts]);

  useEffect(() => {
    setMessageCount(
      user?.unreadMessageCount ?? (user?.unreadMessage ? 1 : 0)
    );
    setNotificationCount(
      user?.unreadNotificationCount ?? (user?.unreadNotification ? 1 : 0)
    );
  }, [
    user?.unreadMessageCount,
    user?.unreadNotificationCount,
    user?.unreadMessage,
    user?.unreadNotification,
  ]);

  return { messageCount, notificationCount, refreshCounts };
}
