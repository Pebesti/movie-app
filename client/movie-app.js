import Axios from "axios";

export default function MovieApp() {
  return {
    accountTokenName: "movieToken",
    showRegister: false,
    user: { username: "", password: "", firstname: "", lastname: "" },
    searchMovieText: "",
    loginMessage: "",
    accountToken: "",
    movieLoadMessage: "No movies found",
    loggedIn: false,
    timer: null,
    playlist: [],
    movieSelectList: [],
    showMyPlaylist: true,
    showMovieSelect: false,

    init() {
      this.loadToken();
    },

    login() {
      Axios.post("http://localhost:4017/api/login", this.user)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.saveToken();
            this.loggedIn = true;
            this.getPlaylist();
          } else {
            this.loginMessage = "invalid User name / password";
          }
        })
        .catch((error) => {
          this.handleError(error);
          this.loginMessage = "Could not login";
        });
    },

    singup() {
      Axios.post("http://localhost:4017/api/register", this.user)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.loggedIn = true;
            this.saveToken();
          } else {
            this.loginMessage = "Could not register account";
          }
        })
        .catch((error) => {
          this.loginMessage = "Could not register";
        });
    },

    signout() {
      this.removeToken();
    },

    searchMovie() {
      this.movieSelectList = [];
      this.movieLoadMessage = "Searching for movie";
      Axios.get(`http://localhost:4017/movie/${this.searchMovieText}`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => result.results)
        .then((result) => {
          if (result && result.length > 0) {
            this.movieSelectList = result;
          } else {
            this.movieLoadMessage = "No movies found";
          }
          //poster_path
        })
        .catch((error) => {
          this.movieLoadMessage = "No movies found";
          this.handleError(error);
        });
    },

    getPlaylist() {
      this.playlist = [];

      Axios.get("http://localhost:4017/playlist", {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.playlist = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    displayMovieSearch() {
      this.playlist = [];
      this.movieSelectList = [];
      this.searchMovieText = "";
      this.showMyPlaylist = false;
    },

    hideMovieSearch() {
      this.playlist = [];
      this.movieSelectList = [];
      this.searchMovieText = "";
      this.showMyPlaylist = true;
    },

    addMovie(selectedMovie) {
      Axios.post(
        "http://localhost:4017/playlist",
        { movieid: selectedMovie },
        {
          headers: { authorization: `${this.accountToken}` },
        }
      )
        .then((result) => result.data)
        .then((result) => {
          this.handleMessage(result.message);
          if (result.status == "success") {
            this.getPlaylist();
            this.showMyPlaylist = true;
          }
        })
        .catch((error) => this.handleError(error));
    },
    removeMovie(playlistid) {
      Axios.delete(`http://localhost:4017/playlist/${playlistid}/`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          this.handleMessage(result.message);
          if (result.status == "success") {
            this.getPlaylist();
          }
        })
        .catch((error) => this.handleError(error));
    },

    removeToken() {
      localStorage.removeItem(this.accountTokenName);
      this.accountToken = "";
      this.playlist = [];
      this.movieSelect = [];
      this.select;
      this.loggedIn = false;
      this.showRegister = false;
      this.showMyPlaylist = true;
    },

    loadToken() {
      this.accountToken = localStorage.getItem(this.accountTokenName);
      if (this.accountToken != null) {
        this.loggedIn = true;
        this.getPlaylist();
      }
    },

    handleError(error) {
      alert(error);
      if (
        error.response.status &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        this.removeToken();
      }
    },

    handleMessage(message) {
      alert(message);
    },

    saveToken() {
      localStorage.setItem(this.accountTokenName, this.accountToken);
    },
  };
}
