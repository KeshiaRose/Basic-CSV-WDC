![Working!](https://img.shields.io/badge/Status-Working-brightgreen)

# Basic CSV Web Data Connector

This is a simple [Web Data Connector](https://tableau.github.io/webdataconnector/docs/) for CSVs hosted on the web.

## How to use

1. Start a new WDC connection in Tableau Desktop 2019.4 or higher and enter: https://basic-csv-wdc.herokuapp.com/
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

I pay $7/month to host this WDC but I gladly offer it to you for free. If you would like to support this WDC you can [buy me some cheese🧀](https://www.buymeacoffee.com/KeshiaRose)!
