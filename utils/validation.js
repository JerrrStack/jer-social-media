const USERNAME_REGEX = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

const isValidEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password) =>
  typeof password === "string" && password.length >= 6;

const isValidUsername = (username) =>
  typeof username === "string" && USERNAME_REGEX.test(username);

module.exports = {
  USERNAME_REGEX,
  isValidEmail,
  isValidPassword,
  isValidUsername,
};
