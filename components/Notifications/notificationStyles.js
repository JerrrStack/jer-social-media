import { makeStyles } from "@material-ui/core";

export const useNotificationStyles = makeStyles((theme) => ({
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  text: {
    fontSize: "0.9rem",
    lineHeight: 1.45,
    color: theme.palette.text.primary,
  },
  time: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
  link: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));
