/* global tableau Papa */

///////////////////////////////////////////////////////////////////////
// CSV Web Data Connector														        				 //
// A Tableau Web Data Connector for connecting to hosted CSVs.       //
// Author: Keshia Rose                                               //
// GitHub: https://github.com/KeshiaRose/Basic-CSV-WDC               //
// Version 2.1                                                       //
///////////////////////////////////////////////////////////////////////

// Test URLs
// https://en.unesco.org/sites/default/files/covid_impact_education.csv (<1 MB)
// https://opendata.ecdc.europa.eu/covid19/casedistribution/csv (4 MB)
// https://data.cityofnewyork.us/resource/ic3t-wcy2.csv (<1 MB)
// https://media.githubusercontent.com/media/microsoft/Bing-COVID-19-Data/master/data/Bing-COVID19-Data.csv (180MB)
// https://www.data.gouv.fr/fr/datasets/r/406c6a23-e283-4300-9484-54e78c8ae675 (12MB) (; delimited!!)

let savedCSVData; // Always a string

let myConnector = tableau.makeConnector();

// Populate inputs if they were previously entered
myConnector.init = function(initCallback) {
  if (
    tableau.phase == tableau.phaseEnum.interactivePhase &&
    tableau.connectionData.length > 0
  ) {
    const conData = JSON.parse(tableau.connectionData);
    $("#url").val(conData.dataUrl || "");
    $("#method").val(conData.method || "GET");
    $("#token").val(tableau.password || "");
    $("#delimiter").val(conData.delimiter || "");
    if (conData.fastMode) {
      _setMode("fast");
    }
    if (conData.mode) {
      _setMode(conData.mode);
    }
  }

  initCallback();
};

// Fetch the data and create the schema
myConnector.getSchema = async function(schemaCallback) {
  console.time("Creating table schema");
  let conData = JSON.parse(tableau.connectionData);
  let dataUrl = conData.dataUrl;
  let method = conData.method;
  let delimiter =
    conData.delimiter && conData.delimiter !== "" ? conData.delimiter : ",";
  let token = tableau.password;
  let mode = conData.fastMode ? "fast" : conData.mode ? conData.mode : "typed";

  let data =
    savedCSVData || (await _retrieveCSVData({ dataUrl, method, token }));

  let cols = [];

  if (mode === "fast") {
    let headers = data
      .split(/\r?\n/)[0]
      .split(delimiter)
      .map(header => header.replace(/"/g, ""));
    headers = _sanitizeKeys(headers);
    for (let header in headers) {
      cols.push({
        id: header,
        alias: headers[header].alias,
        dataType: "string"
      });
    }
  } else {
    let headers = _determineTypes(_parse(data, delimiter, true));
    for (let field in headers) {
      cols.push({
        id: field,
        alias: headers[field].alias,
        dataType: headers[field].dataType
      });
    }
  }

  let tableSchema = {
    id: "csvData",
    alias: "CSV Data",
    columns: cols
  };

  console.timeEnd("Creating table schema");
  schemaCallback([tableSchema]);
};

// Fetch the data and parse
myConnector.getData = async function(table, doneCallback) {
  console.time("Getting data");
  let conData = JSON.parse(tableau.connectionData);
  let dataUrl = conData.dataUrl;
  let method = conData.method;
  let delimiter =
    conData.delimiter && conData.delimiter !== "" ? conData.delimiter : ",";
  let token = tableau.password;
  let mode = conData.fastMode ? "fast" : conData.mode ? conData.mode : "typed";
  let tableSchemas = [];

  let data =
    savedCSVData || (await _retrieveCSVData({ dataUrl, method, token }));

  let rows;
  switch (mode) {
    case "fast":
      rows = _parse(data, delimiter, false).slice(1);
      break;
    case "typed":
      rows = _cleanData(_parse(data, delimiter, true));
      break;
    case "loosetyped":
      rows = _parse(data, delimiter, true).slice(1);
      break;
    default:
      rows = _cleanData(_parse(data, delimiter, true));
  }

  let row_index = 0;
  let size = 10000;
  while (row_index < rows.length) {
    table.appendRows(rows.slice(row_index, size + row_index));
    row_index += size;
    tableau.reportProgress("Getting row: " + row_index);
  }
  console.timeEnd("Getting data");

  doneCallback();
};

tableau.connectionName = "CSV Data";
tableau.registerConnector(myConnector);
window._tableau.triggerInitialization &&
  window._tableau.triggerInitialization(); // Make sure WDC is initialized properly

// Grabs wanted fields and submits configuration to Tableau
async function _submitDataToTableau() {
  let dataUrl = $("#url")
    .val()
    .trim();
  let method = $("#method").val();
  let token = $("#token").val();
  let delimiter = $("#delimiter").val();
  let mode =
    $("#fast").attr("class") === "is-active"
      ? "fast"
      : $("#typed").attr("class") === "is-active"
      ? "typed"
      : "loosetyped";
  if (!dataUrl) return _error("No data entered.");

  const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|ftp:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
  const result = dataUrl.match(urlRegex);
  if (result === null) {
    _error("WARNING: URL may not be valid...");
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  tableau.connectionData = JSON.stringify({
    dataUrl,
    method,
    delimiter,
    mode
  });
  tableau.password = token;

  tableau.submit();
}

// Gets data from CSV URL
async function _retrieveCSVData({ dataUrl, method, token }) {
  console.time("Fetching data");
  let result;

  try {
    let options = {
      method
    };

    if (token) {
      options["headers"] = {
        Authorization: `Bearer ${token}`
      };
    }
    const response = await fetch(dataUrl, options);
    result = await response.text();
  } catch (error) {
    try {
      result = await $.post("/proxy/" + dataUrl, { method, token });
    } catch (error) {
      if (tableau.phase !== "interactive") {
        console.error(error);
        tableau.abortWithError(error);
      } else {
        _error(error);
      }
      return;
    }
  }

  if (!result || result.error) {
    if (tableau.phase !== "interactive") {
      console.error(result.error);
      tableau.abortWithError(result.error);
    } else {
      _error(result.error);
    }
    return;
  }
  savedCSVData = result;
  console.timeEnd("Fetching data");
  return savedCSVData;
}

// Sanitizes headers so they work in Tableau without duplicates
function _sanitizeKeys(fields) {
  console.time("Sanitizing keys");
  let headers = {};
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
  console.timeEnd("Sanitizing keys");
  return headers;
}

// Parses csv to array of arrays
function _parse(csv, delimiter, dynamicTyping) {
  console.time("Parsing csv");
  const lines = Papa.parse(csv, {
    delimiter,
    newline: "\n",
    dynamicTyping
  }).data;
  console.timeEnd("Parsing csv");
  return lines;
}

// Determines column data types based on first 100 rows
function _determineTypes(lines) {
  console.time("Determining data types");
  let fields = lines.shift();
  let testLines = lines.slice(0, 100);
  let headers = _sanitizeKeys(fields);
  let headerKeys = Object.keys(headers);
  let rows = [];

  let counts = testLines.map(line => line.length);
  let lineLength = counts.reduce((m, c) =>
    counts.filter(v => v === c).length > m ? c : m
  );

  for (let line of testLines) {
    if (line.length === lineLength) {
      for (let index in headerKeys) {
        let header = headers[headerKeys[index]];
        let value = line[index];

        if (
          value === "" ||
          value === '""' ||
          value === "null" ||
          value === null
        ) {
          header.null = header.null ? header.null + 1 : 1;
        } else if (
          value === "true" ||
          value === true ||
          value === "false" ||
          value === false
        ) {
          header.bool = header.bool ? header.bool + 1 : 1;
        } else if (typeof value === "object") {
          header.string = header.string ? header.string + 1 : 1;
        } else if (!isNaN(value)) {
          if (parseInt(value) == value) {
            header.int = header.int ? header.int + 1 : 1;
          } else {
            header.float = header.float ? header.float + 1 : 1;
          }
        } else {
          header.string = header.string ? header.string + 1 : 1;
        }
      }
    } else {
      console.log("Row ommited due to mismatched length.", line);
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

  console.timeEnd("Determining data types");
  return headers;
}

// Tries to clean up data to appropriately match data types
function _cleanData(lines) {
  console.time("Cleaning data");
  let fields = lines.shift();
  let headers = _sanitizeKeys(fields);
  let headerKeys = Object.keys(headers);
  let rows = [];

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
        } else if (value === "true" || value === true) {
          obj[headerKeys[field]] = true;
        } else if (value === "false" || value === false) {
          obj[headerKeys[field]] = false;
        } else if (typeof value === "object") {
          obj[headerKeys[field]] = value.toISOString();
        } else if (!isNaN(value)) {
          obj[headerKeys[field]] = value;
        } else {
          obj[headerKeys[field]] = value;
        }
      }
      rows.push(obj);
    } else {
      console.log("Row ommited due to mismatched length.", line);
    }
  }
  console.timeEnd("Cleaning data");
  return rows;
}

// Show/hide advanced options
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

// Changes mode
function _setMode(mode) {
  $("#typed,#fast,#loosetyped").each(function() {
    $(this).removeClass("is-active");
  });
  $(`#${mode}`).addClass("is-active");
}

// Submits when you push Enter
$("#url").keypress(function(event) {
  if (event.keyCode === 13) {
    _submitDataToTableau();
  }
});

// Allows you to enter a tab as the delimiter
$("#delimiter").keydown(function(event) {
  if (event.keyCode === 9) {
    event.preventDefault();
    $("#delimiter").val("\t");
  }
});
