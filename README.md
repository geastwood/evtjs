# EVTJS

General purpose API Binding for the everiToken blockchain. Supports `node` and `browser`.

## Install
For NodeJS, use `npm`:

```bash
npm install evtjs --save
```

Or use `yarn`:

```bash
yarn add evtjs
```

For browser, you may download the source code and compile it for browsers in the root directory:

```js
npm run build_browser
```

Then you'll find produced `evt.js` in `dist` folder.

You can also download our release package and reference it to use the library in browser.

## Basic Usage
```js
// set network endpoint
const network = {
    host: 'testnet1.everitoken.io', // For everiToken Aurora 2.0
    port: 8888,                     // defaults to 8888
    protocol: 'https'               // the TestNet of everiToken uses SSL
};

// get APICaller instance
const apiCaller = EVT({
    // keyProvider should be string of private key (aka. wit, can generate from everiSigner)
    // you can also pass a function that return that string (or even Promise<string> for a async function)
    endpoint: network,
    keyProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxx' 
});

// call API
var response = await apiCaller.getInfo();

// or if `await` is supported in current environment
apiCaller.getInfo()
    .then(res => {
        // TODO
    })
    .catch((e) => {
        // TODO
    });

```

## EvtKey Usage

`EvtKey` is a class for everiToken's key management. 

### randomPrivateKey

You can get a random private key by `EVT.EvtKey.randomPrivateKey`:

```js
// randomPrivateKey returns a promise so we should use await or 'then' 
let key = await EVT.EvtKey.randomPrivateKey();

// now key is the private key, that is , a wit.
```

And then you can convert it to a public key by `privateToPublic`:

```js
let publicKey = EVT.EvtKey.privateToPublic(key);
```

### seedPrivateKey

Get a private key from a specific `seed`. The `seed` is a string. For private key's safety, the `seed` must be random enough and must have at least 32 bytes' length.

```js
let privateKey = EVT.EvtKey.seedPrivateKey('AVeryVeryVeryLongRandomSeedHere');
```

### isValidPrivateKey / isValidPublicKey

You can also use `isValidPrivateKey` or `isValidPublicKey` to check a key.

```js
    assert(EVT.EvtKey.isValidPrivateKey('5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D'), 'should be a valid private');
    assert(EVT.EvtKey.isValidPublicKey('EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND'), 'should be a valid public');
```

## APICaller Usage

### Initialization

Before calling APICaller, you must initialize a instance of APICaller and pass a `keyProvider` for it. You can use `EvtKey` to generate a valid one.

A APICaller object could be created like this:

```js
// get APICaller instance
var apiCaller = EVT(args);
```

#### Parameters

- `args`: a object, the following fields are required:
  - `keyProvider`: keyProvider should be string representing private key, or a function which returns the private key or a `Promise` that will resolves with the private key for a async function
  - `endpoint`: a object to specify the endpoint of the node to be connected

Here are several example of `keyProvider`:

```js
// keyProvider is the private key
let keyProvider = '5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D';

// keyProvider is a function
let keyProvider = function() {
    return '5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D';
}

// keyProvider is a async function
let keyProvider = function() {
    return new Promise((res, rej) => {
        res('5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D');
    });
}
```

A example of `endpoint`:

```js
// endpoint is a object
// example: 
let endpoint = {
    host: 'testnet1.everitoken.io', // For everiToken Aurora 2.0
    port: 8888,                     // defaults to 8888
    protocol: 'https'               // the TestNet of everiToken uses SSL
};
```

### getInfo()

get basic information from block chain.

```js
let info = await apiCaller.getInfo();
```

#### Example Response

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

Some important return values are as follow:

- `evt_api_version`: This is important and _must be verified before any other call_ . 
  
  Format: [ major.minor.modification ]. When `major` is changed then you could not use the chain's API. It is not compatible with you.

- `head_block_*` and `last_irreversible_block_*`: Represents information for last block / last irreversible block. This is used by other calls automatically by the library.

### getOwnedTokens(publicKeys)

Get the list of tokens which is owned by `publicKeys`.

> Make sure you have history_plugin enabled on connected node

#### Parameters

- `publicKey`: a array or a single value which represents public keys you want to query

#### Response

The response is a array representing the list of tokens belonging to public keys provided. Each token is identified by the `name` and the `domain` it belongs to.

A example:

```json
[
    {
        "name": "T39823",
        "domain": "test"
    }
]
```

### getManagedGroups(publicKeys)

Get the list of groups which is managed by `publicKeys`.

> Make sure you have history_plugin enabled on connected node

#### Parameters

- `publicKey`: a array or a single value which represents public keys you want to query

#### Response

The response is a array representing the list of groups managed by public keys provided. Each group is identified by the `name`.

A example:

```json
[
    {
        "name": "testgroup"
    }
]
```

### pushTransaction(...actions)

Push a `transaction` to the chain. A `transaction` is composed of some `actions`. Generally a `action` is a interface to a writable API. Almost all the writable API are wrapped in transactions.

`...` is the syntax for `Rest Parameters` in JavaScript's `ES6`. It means you could pass as many parameters as you want to the function, and JavaScript will automatically convert them into a array. So you may use `pushTransaction` like this:

```js
apiCaller.pushTransaction(
    EVT.EvtAction(....), // the first action
    EVT.EvtAction(....), // the second action
    EVT.EvtAction(....), // the third action
    EVT.EvtAction(....), // other actions
    ....                 // as more as you want
);
```

#### Parameters

Each `action` is either a `EvtAction` instance or a `abi` structure. `EvtAction` is preferred.

A EvtAction can be created like this:

```js
new EVT.EvtAction(actionName, abiStructure, [domain], [key])
```

- `actionName`: Required, the name of the action you want to execute. 
- `abiStructure`: Required, the abi structure of this action. 
- `domain` & `key`: See below.

You can find all the actions and ABI structure in everiToken [here](https://github.com/everitoken/evt/blob/master/docs/API-References.md#post-v1chaintrx_json_to_digest) and [here](https://github.com/everitoken/evt/blob/master/docs/ABI-References.md);

For each action you should provide `domain` and `key` which are two special values. Each action has its own requirement for these two values. You can see here for detail: https://github.com/everitoken/evt/blob/master/docs/API-References.md#post-v1chaintrx_json_to_digest

For the following actions, you may ignore the `domain` and `key` parameter of the constructor of `EvtAction` (will be filled in automatically):
- `newdomain`
- `updatedomain`
- `newgroup`
- `updategroup`
- `issuetoken`
- `transfer`
- `destroytoken`

Here is a example to use `pushTransaction` as well as `domain` and `key`.

```js
// this is a example about how to create a fungible token
let symbol = "ABC";
// the value of domain and key should be decided by referring to https://github.com/everitoken/evt/blob/master/docs/API-References.md#post-v1chaintrx_json_to_digest

let domain = "fungible";
let key = symbol;

// pass EvtAction instance as a action
await apiCaller.pushTransaction(
    new EVT.EvtAction("newfungible", {
        sym: "5," + symbol,
        creator: publicKey,
        issue: { name: "issue", threshold: 1, authorizers: [ { ref: "[A] " + publicKey, weight: 1  } ] }, 
        manage: { name: "manage", threshold: 1, authorizers: [ { ref: "[A] " + publicKey, weight: 1  } ] }, 
        total_supply: "100000.00000 " + symbol
    }, "fungible", symbol)
);
```

The structure of `args` in the action varies between actions. Below are some examples about how to fill out `args`. The structure of `args` is defined in everiToken's ABI. For detail, you may refer to [ABI reference](https://github.com/everitoken/evt/blob/master/docs/ABI-References.md) of everiToken. You should navigate to the link to get the list of actions.

## Action Examples

### Create Domain
```js
await apiCaller.pushTransaction(
    new EVT.EvtAction("newdomain", {
        "name": testingTmpData.newDomainName,
        "creator": publicKey,
        "issue": {
            "name": "issue",
            "threshold": 1,
            "authorizers": [{
                "ref": "[A] " + publicKey,
                "weight": 1
            }]
        },
        "transfer": {
            "name": "transfer",
            "threshold": 1,
            "authorizers": [{
                "ref": "[G] OWNER",
                "weight": 1
            }]
        },
        "manage": {
            "name": "manage",
            "threshold": 1,
            "authorizers": [{
                "ref": "[A] " + publicKey,
                "weight": 1
            }]
        }
    })
);
```

### Issue Tokens (NFT)

```js
await apiCaller.pushTransaction({
    "action": "issuetoken",
    "args": {
        "domain": testingTmpData.newDomainName,
        "names": [
            testingTmpData.addedTokenNamePrefix + "1",
            testingTmpData.addedTokenNamePrefix + "2",
            testingTmpData.addedTokenNamePrefix + "3"
        ],
        "owner": [
            Key.privateToPublic(wif)
        ]
    }
});
```
