import axios from "axios";
import baseUrl from "./baseUrl";
import cookie from "js-cookie";

const cache = new Map();

export async function fetchProfilePreview(userId) {
  const id = String(userId);
  if (cache.has(id)) return cache.get(id);

  const res = await axios.get(`${baseUrl}/api/profile/${id}`, {
    headers: { Authorization: cookie.get("token") },
  });

  cache.set(id, res.data);
  return res.data;
}

export function clearProfilePreviewCache(userId) {
  if (userId) cache.delete(String(userId));
  else cache.clear();
}
