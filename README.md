# EVTJS

General purpose API Binding for the everiToken blockchain. Supports `node` and `browser`.

## Install
Using `npm`:
```
npm run install
```

You can also download our release package and reference it to use in browser.

## Usage

```
const apiCaller = EVT({
            endpoint: network
        });

        var response = await apiCaller.getInfo();