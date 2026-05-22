import React, { useEffect, useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import {
  InputAdornment,
  makeStyles,
  TextField,
  Link,
  Avatar,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

let cancel;

const useStyle = makeStyles({
  root: {
    ["&,fieldset"]: {
      borderRadius: 15,
    },
  },
  searchResult: {
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  input: {
    color: "#fff",
    height: 1,
  },
});

function Search() {
  const classes = useStyle();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleChange = async (e) => {
    const { value } = e.target;

    setText(value);

    if (value.length === 0) return;

    if (value.trim().length === 0) return;

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

      if (res.data.length === 0) {
        results.length > 0 && setResults([]);
        return setLoading(false);
      }

      setResults(res.data);
    } catch (error) {
      console.log("Error Searching");
    }

    setLoading(false);
  };
  useEffect(() => {
    if (text.length === 0 && loading) {
      setLoading(false);
    }
  }, [text]);

  const options = results ? results.map((result) => result) : [];

  return (
    <Autocomplete
      freeSolo
      id="autocmplete-clickable"
      options={options}
      autoHighlight
      getOptionLabel={(result) => result.name}
      renderOption={(result) => (
        <>
          <div
            className={classes.searchResult}
            onClick={() => {
              window.location.href = `/${result.username}`;
            }}
          >
            <Avatar
              src={result.profilePicUrl}
              style={{ marginRight: ".5rem" }}
            />
            {result.name}
          </div>
        </>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          onBlur={() => {
            results.length > 0 && setResults([]);
            loading && setLoading(false);
            setText("");
          }}
          variant="outlined"
          placeholder="Search"
          className={classes.root}
          autoComplete="off"
          value={text}
          style={{ width: 150 }}
          onChange={handleChange}
          InputProps={{
            classes: { input: classes.input },
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
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

export default Search;
