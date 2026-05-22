const mongoose = require("mongoose");
const User = require("../models/User");

const OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/;

async function findUserByIdOrUsername(idOrUsername) {
  if (!idOrUsername) return null;

  const value = String(idOrUsername).trim();

  if (OBJECT_ID_HEX.test(value)) {
    try {
      const byId = await User.findById(value);
      if (byId) return byId;
    } catch {
      // invalid id cast — fall through to username lookup
    }
  }

  return User.findOne({ username: value.toLowerCase() });
}

module.exports = findUserByIdOrUsername;
