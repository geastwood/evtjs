# EVTJS

General purpose API Binding for the everiToken blockchain. Supports `node` and `browser`.

## Install
Using `npm`:

```shell
npm run install
```

You can also download our release package and reference it to use in browser.

## Basic Usage
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

### EvtKey: randomPrivateKey

`EvtKey` is a class for everiToken's key management. You can get a random private key by `EVT.EvtKey.randomPrivateKey`:

```js
// randomPrivateKey returns a promise so we should use await or 'then' 
let key = await EVT.EvtKey.randomPrivateKey();

// now key is the private key, that is , a wit.
```

And then you can convert it to a public key by `privateToPublic`:

```js
let publicKey = EVT.EvtKey.privateToPublic(key);
```

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

Some important return values are as follow:

- `evt_api_version`: This is important and _must be verified before any other call_ . 
  
  Format: [ major.minor.modification ]. When `major` is changed then you could not use the chain's API. It is not compatible with you.

- `head_block_*` and `last_irreversible_block_*`: Represents information for last block / last irreversible block. This is used by other calls automatically by the library.

### getAccount

Get basic information of a account including balance.

```js
let info = await apiCaller.getAccount(accountName);
```

Sample value of `info`:

```json
{"name":"xxxx","creator":"evt","create_time":"2018-06-04T13:39:31","balance":"1.0000 EVT","frozen_balance":"0.0000 EVT","owner":["EVTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"]}
```

Not that the balance in TestNet is fake. And frozen_balance is not available now and is fixed to `zero`.

Balance is returned by a string which contains a `' EVT'` postfix. And the number is always corrected to four decimal places (ex. 1.000 EVT).

### getOwnedTokens

Get the list of tokens which is owned by the signer's public key (that is, the value of keyProvider).

```js
let info = await apiCaller.getOwnedTokens();
```

Sample value of `info`:

```json
[
    {
        "name": "T39823",
        "domain": "test"
    }
]
```

### pushTransaction

Push a `transaction` to the chain. A `transaction` is composed of some `actions`. Generally a `action` is a interface to a writable API. Almost all the writable API are wrapped in transactions.

You are able to push a transaction by:

```
apiCaller.pushTransaction(trx);
```

`trx` is a object with structure as follow:

```js
{
    transaction: { // required
        actions: [ // required
            { // at least one action object
                action: <string> // required, action name
                args: { // required, action's argument
                    // the detail format of arguments will be shown below
                }
            }
        ]
    }
}
```

Here is a complete example:

```js
await apiCaller.pushTransaction({
    transaction: {
        actions: [
            {
                "action": "newaccount",
                "args": {
                    "name": 'test',
                    "owner": [ 'EVT7moLiPstoZdn1MA7phJWzugg4rLS7ZLaTEzie1FUrco87e1qs2' ]
                }
            }
        ]
    }
});
```

The structure of `args` in the action varies between actions. Below are some examples about how to fill out `args`. The structure of `args` is defined in everiToken's ABI. For detail, you may refer to [ABI reference](https://github.com/everitoken/evt/blob/master/docs/ABI-References.md) of everiToken. You should navigate to the link to get the list of actions.

## Action Examples

These snippets are valid `action` for a transaction for pushing.

### Create Account
```js
{
    "action": "newaccount",
    "args": {
        "name": 'xxxx',
        "owner": [ 'publicKeyOfOwner' ]
    }
}
```

### Create Domain
```js
{
    "action": "newdomain",
    "args": {
        "name": newDomainName,
        "issuer": "publicKeyOfIssuer",
        "issue": {
            "name": "issue",
            "threshold": 1,
            "authorizers": [{
                "ref": "[A] EVT7dwvuZfiNdTbo3aamP8jgq8RD4kzauNkyiQVjxLtAhDHJm9joQ",
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
                "ref": "[A] EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                "weight": 1
            }]
        }
    }
}
```
