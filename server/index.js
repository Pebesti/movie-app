require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const pg = require("pg");
const axios = require("axios");

const UserManager = require("./manager/user-manager");
const MovieManager = require("./manager/movie-manager");
const Pool = pg.Pool;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const secretKey = process.env.ACCESS_TOKEN_SECRET || "";

const connectionString = process.env.DATABASE_URL || "";

const movieAPIKey = process.env.MOVIE_API_KEY || "";

const pool = new Pool({
  connectionString,
});

const userManager = UserManager(pool);
const movieManager = MovieManager(pool);
const PORT = process.env.PORT || 4017;

// API routes to be added here
app.post("/api/login", async function (req, res) {
  const { username, password } = req.body;

  const account = await userManager.getSystemUser(username);

  if (account && bcrypt.compareSync(password, account.password)) {
    const user = {
      username: account.username,
      firstname: account.firstname,
      lastname: account.lastname,
    };
    const accessKey = jwt.sign(user, secretKey, {
      expiresIn: "24h",
    });

    res.json({
      status: "success",
      message: "Signed in to account !!",
      token: accessKey,
    });
  } else {
    res.json({
      status: "fail",
      message: "User name or password is incorrect",
      token: "",
    });
  }
});

app.post("/api/signup", async function (req, res) {
  const { username, password, firstname, lastname } = req.body;

  if (!password || !username || !firstname || !lastname) {
    res.json({
      status: "fail",
      message: "Missing or empty sign up fields",
    });
  } else {
    const account = await userManager.getSystemUser(username);

    if (account != null && account.id != null) {
      res.json({
        status: "fail",
        message: "User Name already exists",
      });
      return;
    }

    const bcryptPassword = bcrypt.hashSync(password, 10);
    const result = await userManager.signUpSystemUser(
      username,
      bcryptPassword,
      firstname,
      lastname
    );

    if (result > 0) {
      const user = {
        username: username,
        firstname: firstname,
        lastname: lastname,
      };
      const accessKey = jwt.sign(user, secretKey, {
        expiresIn: "24h",
      });
      res.json({
        status: "success",
        message: "Your account has been created !!",
        token: accessKey,
      });
    } else {
      res.json({
        status: "fail",
        message: "Could not create account !!",
      });
    }
  }
});

app.get("/movie/:moviename", authenticateToken, async function (req, res) {
  const account = await userManager.getSystemUser(req.user.username);

  if (account == null || account.id == null) {
    res.sendStatus(403);
    return;
  }

  const moviename = req.params.moviename;

  if (moviename) {
    axios
      .get(
        `https://api.themoviedb.org/3/search/movie?api_key=${movieAPIKey}&query=${moviename}`,
        null
      )
      .then((result) => result.data)
      .then((result) => res.json(result))
      .catch((error) =>
        res.json({ page: 0, total_pages: 0, total_results: 0, results: [] })
      );
  } else {
    res.json({ page: 0, total_pages: 0, total_results: 0, results: [] });
  }
});

app.get("/playlist", authenticateToken, async function (req, res) {
  const account = await userManager.getSystemUser(req.user.username);

  if (account == null || account.id == null) {
    res.sendStatus(403);
    return;
  }

  const playlist = await movieManager.getPlaylist(account.id);

  if (playlist) {
    res.json(playlist);
  } else {
    res.json([]);
  }
});

app.post("/playlist", authenticateToken, async function (req, res) {
  const account = await userManager.getSystemUser(req.user.username);

  if (account == null || account.id == null) {
    res.sendStatus(403);
    return;
  }

  const { movieid } = req.body;

  if (movieid) {
    const hasMovie = await movieManager.movieAdded(movieid, account.id);

    if (hasMovie.count == 0) {
      axios
        .get(
          `https://api.themoviedb.org/3/movie/${movieid}?api_key=${movieAPIKey}&append_to_response=videos`
        )
        .then((result) => result.data)
        .then((result) =>
          movieManager.addToPlaylist(
            result.id,
            result.original_title,
            result.poster_path,
            account.id
          )
        )
        .then((result) => {
          if (result > 0) {
            res.json({
              status: "success",
              message: "Movie added to playlist",
            });
          } else {
            res.json({
              status: "fail",
              message: "Could not add selected movie",
            });
          }
        })
        .catch((err) => {
          res.json({
            status: "fail",
            message: "Could not find movie",
          });
        });
    } else {
      res.json({
        status: "fail",
        message: "Movie already added to playlist",
      });
    }
  } else {
    res.json({
      status: "fail",
      message: "Select a movie to add",
    });
  }
});

app.delete("/playlist/:id", authenticateToken, async function (req, res) {
  const account = await userManager.getSystemUser(req.user.username);

  if (account == null || account.id == null) {
    res.sendStatus(403);
    return;
  }

  const playlistId = req.params.id;

  if (playlistId) {
    const result = await movieManager.removeFromPlaylist(
      playlistId,
      account.id
    );

    if (result > 0) {
      res.json({
        status: "success",
        message: "Movie deleted from playlist!!",
      });
    } else {
      res.json({
        status: "fail",
        message: "Could not find selected movie to delete",
      });
    }
  } else {
    res.json({
      status: "fail",
      message: "Could not delete movie from playlist!!",
    });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ");

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token[0], secretKey, (err, user) => {
    if (err) {
      res.sendStatus(403);
    } else {
      req.user = user;
      next();
    }
  });
}

app.listen(PORT, function () {
  console.log(`App started on port ${PORT}`);
});
