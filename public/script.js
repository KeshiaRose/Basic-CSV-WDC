/* global tableau Papa */

///////////////////////////////////////////////////////////////////////
// CSV Web Data Connector														        				 //
// A Tableau Web Data Connector for connecting to hosted CSVs.       //
// Author: Keshia Rose                                               //
// GitHub: https://github.com/KeshiaRose/Basic-CSV-WDC               //
// Version 1.0                                                       //
///////////////////////////////////////////////////////////////////////

// Test URLs
// https://en.unesco.org/sites/default/files/covid_impact_education.csv
// https://opendata.ecdc.europa.eu/covid19/casedistribution/csv
// https://data.cityofnewyork.us/resource/ic3t-wcy2.csv

let cachedTableData; // Always a JSON object

let myConnector = tableau.makeConnector();

// Create the schemas for each table
myConnector.getSchema = async function(schemaCallback) {
  console.log("Creating table schema.");
  let conData = JSON.parse(tableau.connectionData);
  let dataUrl = conData.dataUrl;
  let method = conData.method;
  let token = tableau.password;

  let data =
    cachedTableData || (await _retrieveCSVData({ dataUrl, method, token }));

  let cols = [];

  for (let field in data.headers) {
    cols.push({
      id: field,
      alias: data.headers[field].alias,
      dataType: data.headers[field].dataType
    });
  }

  let tableSchema = {
    id: "csvData",
    alias: "CSV Data",
    columns: cols
  };

  schemaCallback([tableSchema]);
};

// Get the data for each table
myConnector.getData = async function(table, doneCallback) {
  console.log("Getting data.");
  let conData = JSON.parse(tableau.connectionData);
  let dataUrl = conData.dataUrl;
  let method = conData.method;
  let token = tableau.password;
  let tableSchemas = [];

  let data =
    cachedTableData || (await _retrieveCSVData({ dataUrl, method, token }));

  table.appendRows(data.rows);
  doneCallback();
};

tableau.connectionName = "CSV Data";
tableau.registerConnector(myConnector);

// Grabs wanted fields and submits data to Tableau
function _submitDataToTableau() {
  let dataUrl = $("#url")
    .val()
    .trim();
  let method = $("#method").val();
  let token = $("#token").val();
  if (!dataUrl) return _error("No data entered.");

  // const urlRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
  const result = dataUrl.match(urlRegex);
  if (result === null) return _error("URL is not valid.");

  tableau.connectionData = JSON.stringify({ dataUrl, method });
  tableau.password = token;

  tableau.submit();
}

// Gets data from URL or string. Inputs are all strings. Always returns JSON data, even if XML input.
async function _retrieveCSVData({ dataUrl, method, token }) {
  let result = await $.post("/proxy/" + dataUrl, { method, token });
  if (result.error) {
    if (tableau.phase !== "interactive") {
      console.error(result.error);
      tableau.abortWithError(result.error);
    } else {
      _error(result.error);
    }
    return;
  }

  cachedTableData = _csv2table(result.body);
  return cachedTableData;
}

// Turns tabular data into json for Tableau input
function _csv2table(csv) {
  let lines = Papa.parse(csv, {
    delimiter: ",",
    newline: "\n",
    dynamicTyping: true
  }).data;
  let fields = lines.shift();
  let headers = {};
  let rows = [];

  for (let field of fields) {
    let newKey = field.replace(/[^A-Za-z0-9_]/g, "_");
    let safeToAdd = false;

    do {
      if (Object.keys(headers).includes(newKey)) {
        newKey += "_copy";
      } else {
        safeToAdd = true;
      }
    } while (!safeToAdd);

    headers[newKey] = { alias: field };
  }
  let counts = lines.map(line => line.length);
  let lineLength = counts.reduce((m, c) =>
    counts.filter(v => v === c).length > m ? c : m
  );
  
  for (let line of lines) {
    if (line.length === lineLength) {
      let obj = {};
      let headerKeys = Object.keys(headers);
      for (let field in headerKeys) {
        let header = headers[headerKeys[field]];
        let value = line[field];

        if (
          value === "" ||
          value === '""' ||
          value === "null" ||
          value === null
        ) {
          obj[headerKeys[field]] = null;
          header.null = header.null ? header.null + 1 : 1;
        } else if (value === "true" || value === true) {
          obj[headerKeys[field]] = true;
          header.bool = header.bool ? header.bool + 1 : 1;
        } else if (value === "false" || value === false) {
          obj[headerKeys[field]] = false;
          header.bool = header.bool ? header.bool + 1 : 1;
        } else if (typeof value === "object") {
          obj[headerKeys[field]] = value.toISOString();
          header.string = header.string ? header.string + 1 : 1;
        } else if (!isNaN(value)) {
          obj[headerKeys[field]] = value;
          if (parseInt(value) == value) {
            header.int = header.int ? header.int + 1 : 1;
          } else {
            header.float = header.float ? header.float + 1 : 1;
          }
        } else {
          obj[headerKeys[field]] = value;
          header.string = header.string ? header.string + 1 : 1;
        }
      }
      rows.push(obj);
    } else {
      console.log("Row ommited due to mismatched length.", line)
    }
  }

  for (let field in headers) {
    // strings
    if (headers[field].string) {
      headers[field].dataType = "string";
      continue;
    }
    // nulls
    if (Object.keys(headers[field]).length === 1 && headers[field].null) {
      headers[field].dataType = "string";
      continue;
    }
    // floats
    if (headers[field].float) {
      headers[field].dataType = "float";
      continue;
    }
    // integers
    if (headers[field].int) {
      headers[field].dataType = "int";
      continue;
    }
    // booleans
    if (headers[field].bool) {
      headers[field].dataType = "bool";
      continue;
    }
    headers[field].dataType = "string";
  }

  return { headers, rows };
}

function toggleAdvanced() {
  $("#advanced").toggleClass("hidden");
}

// Shows error message below submit button
function _error(message) {
  $(".error")
    .fadeIn("fast")
    .delay(3000)
    .fadeOut("slow");
  $(".error").html(message);
  $("html, body").animate({ scrollTop: $(document).height() }, "fast");
}
