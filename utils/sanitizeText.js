/**
 * Shared text limits + XSS / injection hardening for posts, comments, messages.
 * MongoDB is not SQL, but we still strip HTML and block injection-style payloads.
 */

const TEXT_MAX_LENGTH = 255;
const MEDIA_URL_MAX_LENGTH = 500;

const MEDIA_URL_REGEX =
  /^https?:\/\/\S+\.(gif|webp|png|jpe?g)(\?\S*)?$/i;
const GIPHY_OR_TENOR =
  /^https?:\/\/(media\d*\.tenor\.com|media\.giphy\.com|i\.giphy\.com)\S+/i;

const SQLISH_REGEX =
  /(\bunion\b[\s\S]+\bselect\b)|(\bdrop\b\s+\btable\b)|(\binsert\b\s+\binto\b)|(\bdelete\b\s+\bfrom\b)|(\bupdate\b\s+\w+\s+\bset\b)|(--\s)|\/\*|\*\//i;

function isMediaUrl(value) {
  const v = String(value || "").trim();
  return MEDIA_URL_REGEX.test(v) || GIPHY_OR_TENOR.test(v);
}

function stripDangerous(raw) {
  return String(raw || "")
    .replace(/\0/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/&#x?[\da-f]+;?/gi, "")
    .replace(/[<>]/g, "");
}

/**
 * @param {string} raw
 * @param {{ allowEmpty?: boolean, label?: string, maxLength?: number }} [opts]
 */
function sanitizeUserText(raw, opts = {}) {
  const {
    allowEmpty = false,
    label = "Text",
    maxLength = TEXT_MAX_LENGTH,
  } = opts;

  let value = stripDangerous(raw).trim();

  if (!value) {
    if (allowEmpty) return { ok: true, value: "" };
    return { ok: false, message: `${label} cannot be empty.` };
  }

  if (isMediaUrl(value)) {
    if (value.length > MEDIA_URL_MAX_LENGTH) {
      return {
        ok: false,
        message: `${label} link is too long.`,
      };
    }
    if (/porn|xxx|nude|nsfw|gore/i.test(value)) {
      return { ok: false, message: "That media link is not allowed." };
    }
    return { ok: true, value };
  }

  if (value.length > maxLength) {
    return {
      ok: false,
      message: `${label} is too long (max ${maxLength} characters).`,
    };
  }

  if (SQLISH_REGEX.test(value)) {
    return {
      ok: false,
      message: "This content is not allowed.",
    };
  }

  return { ok: true, value };
}

function sanitizePostText(text) {
  return sanitizeUserText(text, {
    allowEmpty: true,
    label: "Post",
    maxLength: TEXT_MAX_LENGTH,
  });
}

function sanitizeCommentText(text) {
  return sanitizeUserText(text, {
    allowEmpty: false,
    label: "Comment",
    maxLength: TEXT_MAX_LENGTH,
  });
}

function sanitizeMessageText(text) {
  return sanitizeUserText(text, {
    allowEmpty: false,
    label: "Message",
    maxLength: TEXT_MAX_LENGTH,
  });
}

module.exports = {
  TEXT_MAX_LENGTH,
  MEDIA_URL_MAX_LENGTH,
  isMediaUrl,
  stripDangerous,
  sanitizeUserText,
  sanitizePostText,
  sanitizeCommentText,
  sanitizeMessageText,
};
