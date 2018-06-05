# EVTJS

General purpose API Binding for the everiToken blockchain. Supports `node` and `browser`.

## Install
Using `npm`:

```shell
npm run install
```

You can also download our release package and reference it to use in browser.

## Usage
```js
// set network endpoint
const network = {
    host: 'testnet1.everitoken.io', // For everiToken Aurora 1.0
    port: 8888,                     // defaults to 8888
    protocol: 'https'               // the TestNet of everiToken uses SSL
};

// get EVT instance
const apiCaller = EVT({
    endpoint: network,
    keyProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxx' // wit string of private key (can generate from everiSigner), yuo can also pass a function that return that string (or event Promise<string> for a async function)
});

// call API
var response = await apiCaller.getInfo();
// or
apiCaller.getInfo()
.then(res => {
    // TODO
})
.catch(e) {
    // TODO
}
```

## Usage

For detail, see unit test in `index.test.js`.

### getInfo

get basic information from block chain.

```js
let info = await apiCaller.getInfo();
```

Sample value of `info`:

```json
{
    "server_version": "3813c635",
    "chain_id": "bb248d6319e51ad38502cc8ef8fe607eb5ad2cd0be2bdc0e6e30a506761b8636",
    "evt_api_version": "1.2.0",
    "head_block_num": 145469,
    "last_irreversible_block_num": 145468,
    "last_irreversible_block_id": "0002383c51a24696917c8e6ba24557a138510d7f73196d0b11d447fd7f4b6eb7",
    "head_block_id": "0002383d5378cb6ba3d261c2df459e2413a211e8211a11a22cd614b18a293bb5",
    "head_block_time": "2018-06-05T04:56:29",
    "head_block_producer": "evt",
    "recent_slots": "",
    "participation_rate": "0.00000000000000000"
}
```

Some important values is as follow:

- `evt_api_version`: This is important and _must be verified before any other call_ . 
  
  Format: [ major.minor.modification ]. When `major` is changed then you could not use the chain's API. It is not compatible with you.

- `head_block_*` and `last_irreversible_block_*`: Represents information for last block / last irreversible block. This is used by other calls automatically by the library.

