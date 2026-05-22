import { TextField, withStyles } from "@material-ui/core";

const CssTextField = withStyles({
  root: {
    width: "100%",
    marginBottom: 16,
    "& label": {
      color: "rgba(255, 255, 255, 0.85)",
      fontWeight: 500,
    },
    "& label.Mui-focused": {
      color: "#fff",
    },
    "& .MuiInput-underline:before": {
      borderBottomColor: "rgba(255, 255, 255, 0.35)",
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottomColor: "rgba(255, 255, 255, 0.6)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#fff",
    },
    "& .MuiInputBase-input": {
      color: "#fff",
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      color: "rgba(255, 255, 255, 0.75)",
    },
  },
})(TextField);

export default CssTextField;
