///////////////////////////////////////////////////////////////////////
// CSV Web Data Connector														        				 //
// A Tableau Web Data Connector for connecting to hosted CSVs.       //
// Author: Keshia Rose                                               //
// GitHub: https://github.com/KeshiaRose/Basic-CSV-WDC               //
// Version 1.0                                                       //
///////////////////////////////////////////////////////////////////////

const express = require("express");
const fetch = require("node-fetch");
const iconv = require("iconv-lite");
const app = express();

app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/proxy/*", async (req, res) => {
  let url = req.url.split("/proxy/")[1];
  let options = {
    method: req.body.method
  };

  if (req.body.token) {
    options["headers"] = {
      Authorization: `Bearer ${req.body.token}`
    };
  }

  try {
    let data;
    let response = await fetch(url, options);
    if (req.body.encoding && req.body.encoding !== "") {
      let buffer = await response.arrayBuffer();
      data = iconv.decode(new Buffer(buffer), req.body.encoding).toString();
    } else {
      data = await response.text();
    }
    response.ok ? res.send(data) : res.send({ error: response.statusText });
    return;
  } catch (error) {
    res.send({ error: error.message });
    return;
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
