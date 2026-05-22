import { TextField, withStyles } from "@material-ui/core";
const CssTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "#fff ",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#fff",
    },
  },
})(TextField);

export default CssTextField;
