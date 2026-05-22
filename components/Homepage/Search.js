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

let cancel;

const useStyle = makeStyles((theme) => ({
  root: ({ fullWidth, variant }) => ({
    width: fullWidth ? "100%" : 220,
    maxWidth: "100%",
    ...(variant === "light"
      ? {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#f8fafc",
            color: theme.palette.text.primary,
            minHeight: 40,
            "& fieldset": {
              borderColor: theme.palette.divider,
            },
            "&:hover fieldset": {
              borderColor: theme.palette.primary.light,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
            },
          },
          "& .MuiOutlinedInput-input": {
            padding: "8px 10px",
            fontSize: "0.875rem",
            color: theme.palette.text.primary,
          },
          "& .MuiInputAdornment-root .MuiSvgIcon-root": {
            color: theme.palette.text.secondary,
            fontSize: 20,
          },
        }
      : {
          "& .MuiFormControl-root": {
            marginBottom: 0,
            marginTop: 0,
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            color: "#fff",
            minHeight: 34,
            padding: "0 8px",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.35)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.55)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#fff",
            },
          },
          "& .MuiOutlinedInput-input": {
            padding: "5px 8px",
            fontSize: "0.8125rem",
          },
          "& .MuiInputAdornment-root": {
            marginRight: 0,
            "& .MuiSvgIcon-root": {
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 18,
            },
          },
        }),
  }),
  searchResult: {
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));

function Search({ fullWidth = false, variant = "navbar", onNavigate }) {
  const classes = useStyle({ fullWidth, variant });
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleChange = async (e) => {
    const { value } = e.target;
    setText(value);

    if (value.trim().length === 0) {
      setResults([]);
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

      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setResults([]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (text.length === 0 && loading) {
      setLoading(false);
    }
  }, [text, loading]);

  const goToProfile = (id) => {
    if (onNavigate) onNavigate();
    window.location.href = `/${id}`;
  };

  return (
    <Autocomplete
      freeSolo
      id={fullWidth ? "autocomplete-search-mobile" : "autocomplete-search"}
      options={results}
      loading={loading}
      autoHighlight
      getOptionLabel={(result) =>
        typeof result === "string" ? result : result.name
      }
      renderOption={(result) => (
        <div
          className={classes.searchResult}
          onClick={() => goToProfile(result._id)}
        >
          <Avatar src={result.profilePicUrl} style={{ width: 28, height: 28 }} />
          {result.name}
        </div>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          onBlur={() => {
            setResults([]);
            setLoading(false);
          }}
          variant="outlined"
          placeholder="Search people"
          className={classes.root}
          autoComplete="off"
          value={text}
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

export default Search;
