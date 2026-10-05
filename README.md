![Working!](https://img.shields.io/badge/Status-Working-brightgreen)

[![Deploy to Railyard](https://app.railyard.run/deploy/badge)](https://app.railyard.run/deploy?repo=https://github.com/KeshiaRose/Basic-CSV-WDC) [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/KeshiaRose/Basic-CSV-WDC)

# Basic CSV Web Data Connector

This is a simple [Web Data Connector](https://tableau.github.io/webdataconnector/docs/) for CSVs hosted on the web.

## How to use

1. Start a new WDC connection in Tableau Desktop 2019.4 or higher and enter: https://basic-csv-wdc.onrender.com/
1. Enter your CSV URL.
1. Advanced options: Change the HTTP method, delimiter, encoding, or add a Bearer token.
1. Decide which mode to use (Loose Typed recommended).
1. Click **Get Data!**

## Advanced options

This WDC allows some additional customizations that can be found by clicking on "Advanced +".

**Method**: The default method to fetch the CSV file is GET but you can change this to POST if needed.

**Bearer token**: If your CSV is protected with a bearer token you may add it and it will be included with the request to fetch your CSV.

**Custom delimiter**: If your text file is separated by something other than a comma you can set your own custom delimiter.

**Encoding**: If your CSV file uses a specific encoding other than utf-8 you may set it here. You can find a list of supported encodings [here](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/encoding).

## How to refresh

##### Tableau Server

If you want to use this WDC on your Tableau Server you will first need to [add it to your safelist](https://help.tableau.com/current/server/en-us/datasource_wdc.htm) with the following commands:

```
tsm data-access web-data-connectors add --name "CSV WDC" --url https://basic-csv-wdc.onrender.com:443
tsm pending-changes apply
```

Note that this will require your Tableau Server to restart!

##### Tableau Online

If you want to use this WDC on Tableau Online you will need to set it up using [Tableau Bridge](https://help.tableau.com/current/online/en-us/qs_refresh_local_data.htm)

## How to deploy your own

I suggest deploying your own version of this WDC so you can have a dedicated application for your own use. Here are a few options for spinning up your own:

[![Deploy to Railyard](https://app.railyard.run/deploy/badge)](https://app.railyard.run/deploy?repo=https://github.com/KeshiaRose/Basic-CSV-WDC) [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/KeshiaRose/Basic-CSV-WDC)

Or you could host it locally by doing the following:

1. Install [Node.js](https://nodejs.org).
1. [Clone](https://github.com/KeshiaRose/Basic-CSV-WDC) or download and unzip this repository.
1. Open the command line within the `Basic-CSV-WDC` master folder and run `npm install` to install the node modules.
1. Then run `npm start` to start the web server or use something like [pm2](https://pm2.keymetrics.io/) for a production environment.

## Questions?

[Open an issue!](https://github.com/KeshiaRose/Basic-CSV-WDC/issues/new)

#### Support

If you would like to show some support for this free WDC you can [buy me some cheese🧀](https://www.buymeacoffee.com/KeshiaRose)!
