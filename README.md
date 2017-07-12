# openraildata-darwin
===========
[![GitHub issues](https://img.shields.io/github/issues/CarbonCollins/openraildata-darwin.svg)](https://github.com/CarbonCollins/openraildata-darwin/issues)
[![npm](https://img.shields.io/npm/v/openraildata-darwin.svg)](https://www.npmjs.com/package/openraildata-darwin)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/CarbonCollins/openraildata-darwin/master/LICENSE)
[![David](https://img.shields.io/david/CarbonCollins/openraildata-darwin.svg)]()
[![David](https://img.shields.io/david/dev/CarbonCollins/openraildata-darwin.svg)]()
[![sheilds](https://img.shields.io/badge/status-WIP-yellow.svg)](https://img.shields.io/badge/status-WIP-yellow.svg)

# usage

To use the openraildata-darwin package you first need an account on [National Rails data feeds](https://datafeeds.nationalrail.co.uk/). Once you have an account you can run the examples below:

## installation
1. install [npm](https://nodejs.org "npm homepage")
2. `npm install openraildata-darwin --save`

## table of contents
- [getting started](#getting-started)
- [package docs](#package-docs)
- [dev notes](#dev-notes)


## getting started

this package connects with the National Rails DARWIN PushPort server to access real time train alerts and messaging on the UK rail network. All connection and message processing is managed by this package and the results are outputed into JS Object format in the form of an event.

an example for using this package to get train status messages from DARWIN PushPort:

```
const Darwin = require('openraildata-darwin');

const client = new Darwin();

client.on('trainStatus', (status) => {
  console.log(status);
});

client.connect(queueName);
```

## package docs

[Darwin docs](./docs/darwin.md)

## dev notes

Hi :D

this package is being coded while im experimenting so feel free to use it however it may change at any moment. I'm publishing it as i go so not all features will be there.

I'm generaly only working on this while im sat on the train too and from my day job so this may take a while