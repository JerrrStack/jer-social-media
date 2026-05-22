import React, { useState } from "react";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { Avatar, Box, Button, makeStyles, TextField } from "@material-ui/core";
import { postComment } from "../../utils/postActions";

const useStyles = makeStyles({
  root: {
    backgroundColor: "",
    textAlign: "center",
    marginTop: 5,
  },
  inputField: {
    height: "auto",
    margin: 5,
    width: "60%",
    ["&,fieldset"]: {
      borderRadius: 25,
    },
  },
});

function CardPost({ user, setComments, post }) {
  const classes = useStyles();
  const [text, setText] = useState("");

  return (
    <Box className={classes.root}>
      <Box component="div">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await postComment(post._id, user, text, setComments, setText);
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            size="small"
            className={classes.inputField}
            variant="outlined"
            label="Post a Comment"
            name="text"
            value={text}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => setText(e.target.value)}
          />
          {/* <Button
            type="submit"
            color="primary"
            size="small"
            variant="contained"
            style={{ marginTop: 10 }}
          >
            Post Comment
          </Button> */}
        </form>
      </Box>
    </Box>
  );
}

export default CardPost;
