const supertest = require("supertest");
const express = require("express");
const app = express();
const pg = require("pg");
const API = require("../server/manager/user-manager");
const Pool = pg.Pool;
require("dotenv").config();
const connection_string = process.env.DATABASE_URL || "";
const { parse } = require("pg-connection-string");

const config = parse(connection_string);
const pool = new Pool(config);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const DATABASE_URL = process.env.DATABASE_URL;

let assert = require("assert");
let token

describe("The movie API", function () {

//1
it("should allow registered user to be able to log in", async () => {
        const response = await supertest(app).post("/api/login").send({
          username: "Davm2",
          firstname: "David",
          lastname:"Jackson",
        });
        token = response.body.token;
        const { status, message } = response.body;
        if (status == "error") {
          assert("User name or password is incorrect", message);
        } else {
          assert("Signed in to account !!", message);
        }
    
        
      });
//2
it("should be able to register a new user", async () => {
    const response = await supertest(app).post("/api/signup").send({
      username: "Davm2",
      password: "peace67",
      firstname: "David",
      lastname: "Jackson",
      
    });

    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not create account !!", message);
    } else {
      assert("Your account has been created !!", message);
    }
  });

//3
it("should allow user to add favourite movie to playlist", async () => {
    const response = await supertest(app)
      .post("/playlist")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not add selected movie", message);
    } else {
      assert("Movie added to playlist", message);
    }
  });

//4
it("should allow user to remove movies from playlist", async () => {
    const response = await supertest(app)
      .delete("/playlist/:id")
      .set({ Authorization: `Bearer ${token}` });

    token = response.body.token;
    const { status, message } = response.body;
    if (status == "error") {
      assert("Could not find selected movie to delete", message);
    } else {
      assert("Movie deleted from playlist!!", message);
    }
  });
});



