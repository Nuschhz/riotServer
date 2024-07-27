var express = require("express");
var cors = require("cors");
const axios = require("axios");
require("dotenv").config();

var app = express();

app.use(cors());

const ContinentEndpoints = [
  "https://americas.api.riotgames.com",
  "https://europe.api.riotgames.com",
  "https://asia.api.riotgames.com",
];
const ServerEndpoints = [
  "https://br1.api.riotgames.com",
  "https://na1.api.riotgames.com",
  "https://euw1.api.riotgames.com",
  "https://kr.api.riotgames.com",
];

function getPUUID(playerName, tagline, apiKey) {
  return axios
    .get(
      `${ContinentEndpoints[0]}/riot/account/v1/accounts/by-riot-id/${playerName}/${tagline}?api_key=${apiKey}`
    )
    .then((res) => {
      console.log(res.data);
      return res.data.puuid;
    })
    .catch((err) => err);
}

app.get("/", (req, res) => res.send("RiotAPI on Vercel"));

app.get("/SummonerProfile", async (req, res) => {
  let playerName = req.query.username;
  let tagline = req.query.tagline;
  let server = req.query.server;
  let apiKey = req.query.apiKey;
  const PUUID = await getPUUID(playerName, tagline, apiKey);
  const PROFILE_API_CALL = `${ServerEndpoints[server]}/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${apiKey}`;
  const profile = await axios
    .get(PROFILE_API_CALL)
    .then((res) => res.data)
    .catch((err) => err);

  console.log(profile);

  res.json(profile);
});

app.get("/SummonerMastery", async (req, res) => {
  let puuid = req.query.puuid;
  let server = req.query.server;
  let apiKey = req.query.apiKey;
  const MASTERY_API_CALL = `${ServerEndpoints[server]}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3&api_key=${apiKey}`;
  const mastery = await axios
    .get(MASTERY_API_CALL)
    .then((res) => res.data)
    .catch((err) => err);

  console.log(mastery);

  res.json(mastery);
});

app.get("/LeagueMatches", async (req, res) => {
  let puuid = req.query.puuid;
  let continent = req.query.continent;
  let apiKey = req.query.apiKey;
  const LEAGUE_GAMES_API_CALL = `${ContinentEndpoints[continent]}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=40&api_key=${apiKey}`;

  const gameIDS = await axios
    .get(LEAGUE_GAMES_API_CALL)
    .then((res) => res.data)
    .catch((err) => err);
  console.log(gameIDS);

  var matchDataArray = [];
  for (let i = 0; i < gameIDS.length; i++) {
    const matchID = gameIDS[i];
    const matchData = await axios
      .get(
        `${ContinentEndpoints[continent]}/lol/match/v5/matches/${matchID}?api_key=${apiKey}`
      )
      .then((res) => res.data)
      .catch((err) => err);
    matchDataArray.push(matchData);
  }
  res.json(matchDataArray);
});

app.listen(4000, function () {
  console.log("Server started on port 4000");
});

module.exports = app;
