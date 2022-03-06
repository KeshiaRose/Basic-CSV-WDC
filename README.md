![Working!](https://img.shields.io/badge/Status-Working-brightgreen)

# Basic CSV Web Data Connector

This is a simple [Web Data Connector](https://tableau.github.io/webdataconnector/docs/) for CSVs hosted on the web.

## How to use

1. Start a new WDC connection in Tableau Desktop 2019.4 or higher and enter: https://basic-csv-wdc.herokuapp.com/
1. Enter your CSV URL.
1. Advanced options: Change the HTTP method, add a Bearer token, or change the delimiter.
1. Decide which mode to use (Loose Typed recommended).
1. Click **Get Data!**

## How to refresh

##### Tableau Server

If you want to use this WDC on your Tableau Server you will first need to [add it to your safelist](https://help.tableau.com/current/server/en-us/datasource_wdc.htm) with the following commands:

```
tsm data-access web-data-connectors add --name "CSV WDC" --url https://basic-csv-wdc.herokuapp.com:443
tsm pending-changes apply
```

Note that this will require your Tableau Server to restart!

##### Tableau Online

If you want to use this WDC on Tableau Online you will need to set it up using [Tableau Bridge](https://help.tableau.com/current/online/en-us/qs_refresh_local_data.htm)

## Deploy your own!

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/KeshiaRose/Basic-CSV-WDC)

[Remix it on glitch](https://glitch.com/edit/#!/remix/simple-csv-wdc)

## Questions?

[Open an issue!](https://github.com/KeshiaRose/Basic-CSV-WDC/issues/new)

#### Support

I gladly host this WDC for free but if you would like to chip in for hosting you can [buy me some cheese🧀](https://www.buymeacoffee.com/KeshiaRose)!
