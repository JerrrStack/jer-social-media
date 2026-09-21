import React from "react";
import Link from "next/link";

const TOKEN_REGEX = /(@[a-zA-Z0-9._]+|#[A-Za-z][A-Za-z0-9_]*)/g;
const GIF_URL_REGEX =
  /^https?:\/\/\S+\.(gif|webp|png|jpe?g)(\?\S*)?$/i;
const TENOR_OR_GIPHY =
  /^https?:\/\/(media\d*\.tenor\.com|media\.giphy\.com|i\.giphy\.com)\S+/i;

export const isMediaMessage = (msg) =>
  typeof msg === "string" &&
  (GIF_URL_REGEX.test(msg.trim()) || TENOR_OR_GIPHY.test(msg.trim()));

export function formatHashtagLabel(tag) {
  if (!tag) return "";
  const raw = String(tag).replace(/^#/, "");
  return raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
}

/** Split text into @mentions and #hashtags */
export function renderMentionText(
  text,
  linkClassName,
  { onHashtagClick, hashtagClassName, activeTag } = {}
) {
  if (!text) return null;

  const parts = String(text).split(TOKEN_REGEX);

  return parts.map((part, index) => {
    if (part.startsWith("@") && part.length > 1) {
      const username = part.slice(1);
      return (
        <Link key={`${part}-${index}`} href={`/${username}`}>
          <a className={linkClassName} onClick={(e) => e.stopPropagation()}>
            {part}
          </a>
        </Link>
      );
    }

    if (part.startsWith("#") && part.length > 1) {
      const tag = part.slice(1);
      const isActive =
        activeTag && activeTag.toLowerCase() === tag.toLowerCase();
      return (
        <button
          key={`${part}-${index}`}
          type="button"
          className={`${hashtagClassName || linkClassName}${
            isActive ? " is-active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onHashtagClick?.(tag);
          }}
        >
          {part}
        </button>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
