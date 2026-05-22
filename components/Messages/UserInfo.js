import {
  Avatar,
  Box,
  Divider,
  makeStyles,
  Paper,
  Menu,
  MenuItem,
  Button,
} from "@material-ui/core";
import React, { useState } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
const useStyle = makeStyles((theme) => ({
  MessageContent: {
    minHeight: "75vh",
    overflow: "auto",
  },

  chatContent: {
    display: "flex",
    alignItems: "center",
  },
  menuButton: {
    display: "flex",
    justifyContent: "flex-end",
  },
  small: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
}));
function UserInfo({ chatWithData }) {
  const classes = useStyle();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <Box component="div" className={classes.chatContent}>
        <span style={{ marginRight: 5 }}>
          <Avatar
            alt="Pic"
            src={chatWithData.profilePicUrl}
            className={classes.small}
          />
        </span>
        {chatWithData.name}{" "}
        {/* <Box component="span" className={classes.menuButton}>
          <Button
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <MoreVertIcon />
          </Button>
          <Menu
            id="fade-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
          >
            <MenuItem
              onClick={handleClose}
              style={{
                backgroundColor: "transparent",
                cursor: "default",
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </Box> */}
      </Box>

      <Divider />
    </div>
  );
}

export default UserInfo;
