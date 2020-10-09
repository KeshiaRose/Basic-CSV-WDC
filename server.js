///////////////////////////////////////////////////////////////////////
// CSV Web Data Connector														        				 //
// A Tableau Web Data Connector for connecting to hosted CSVs.       //
// Author: Keshia Rose                                               //
// GitHub: https://github.com/KeshiaRose/Basic-CSV-WDC               //
// Version 1.0                                                       //
///////////////////////////////////////////////////////////////////////

const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.static("public"));
app.use(express.text());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/proxy/*", async (req, res) => {
  let url = req.url.split("/proxy/")[1];
  let options = { 
    method: req.body.method,
  }
  
  if (req.body.token) {
    options['headers'] = {
      Authorization: `Bearer ${req.body.token}`
    }
  }
  
  try {
    let response = await fetch(url, options);
    let data = await response.text();
    response.ok ? res.send({ body: data}) : res.send({ error: response.statusText });
  } catch (error) {
    res.send({ error: error.message });
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});