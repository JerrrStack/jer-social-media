import React, { useEffect, useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import {
  InputAdornment,
  makeStyles,
  TextField,
  Avatar,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useRouter } from "next/router";

let cancel;

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
  searchResult: {
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 0),
  },
}));

function SearchChat({ chats, setChats }) {
  const classes = useStyles();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleChange = async (e) => {
    const { value } = e.target;
    setText(value);

    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      cancel && cancel();
      const CancelToken = axios.CancelToken;
      const token = cookie.get("token");

      const res = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers: { Authorization: token },
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      setResults(res.data || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (text.length === 0 && loading) setLoading(false);
  }, [text, loading]);

  const options = results;
  const newChat = (result) => {
    const alreadyInChat =
      chats.length > 0 &&
      chats.some((chat) => chat.messagesWith === result._id);

    if (alreadyInChat) {
      return router.push(`/messages?message=${result._id}`);
    }

    const chatEntry = {
      messagesWith: result._id,
      name: result.name,
      profilePicUrl: result.profilePicUrl,
      lastMessage: "",
      date: Date.now(),
    };

    setChats((prev) => [chatEntry, ...prev]);
    return router.push(`/messages?message=${result._id}`);
  };

  return (
    <Autocomplete
      freeSolo
      id="autocomplete-searchChat"
      options={options}
      autoHighlight
      loading={loading}
      getOptionLabel={(result) => result.name || ""}
      renderOption={(result) => (
        <div
          className={classes.searchResult}
          onClick={() => newChat(result)}
        >
          <Avatar src={result.profilePicUrl} style={{ width: 32, height: 32 }} />
          {result.name}
        </div>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          onBlur={() => {
            if (results.length > 0) setResults([]);
            setLoading(false);
            setText("");
          }}
          variant="outlined"
          placeholder="Search people"
          className={classes.root}
          autoComplete="off"
          value={text}
          fullWidth
          size="small"
          onChange={handleChange}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default SearchChat;
