import { HeapProfiler } from "inspector";

// Type definitions for evtjs 5.x
// Project: https://www.everitoken.io
// Definitions by: Ceeji Cheng <https://github.com/ceeji>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.4

/* =================== USAGE ===================

    import * as EVT from "evtjs"
    
    const apiCaller = EVT({ ... })

 =============================================== */

/// <reference types="node" />
/**
 * Api client for everiToken public chain
 */
declare class ApiCaller {
    /**
     * Create a new instance of ApiCaller.
     */
    constructor(config: EvtConfig | EvtConfigItems);
    /**
     * Fetch timestamp from node server (maybe it's a cached value). You could use it for time synchronization
     */
    getNodeTimestamp(): Promise<number>;
    /**
     * Get basic information from server.
     * @param options Timeout option.
     */
    getInfo(options?: { timeout?: number }): Promise<NodeInfo>;
    /**
     * get domain list a user created, make sure you have history_plugin enabled on the chain node
     * @param publicKeys a array or a single value which represents public keys you want to query
     */
    getCreatedDomains(publicKeys: string | string[]): Promise<{ name: string }[]>;
    /**
     * Provide all the public keys its has and this API will response with all the symbol ids of the fungibles that account create.
     * @param publicKeys a array or a single value which represents public keys you want to query
     */
    getCreatedFungibles(publicKeys: string | string[]): Promise<{ ids: number[] }>;
    /**
     * Get required keys for suspended transactions
     * @param proposalName The proposal name you want to sign
     * @param availableKeys array of public keys you own
     */
    getRequiredKeysForSuspendedTransaction(proposalName: string, availableKeys: string[]): Promise<string[]>;
    /**
     * Get detail information of a suspended transaction
     * @param proposalName The proposal name you want to query
     */
    getSuspendedTransactionDetail(proposalName: string): Promise<SuspendedTransactionDetail>;
    /**
     * get a list of groups, each group in it must has a group key which is contained by provided public keys. Make sure you have history_plugin enabled on the chain node
     * @param publicKeys a array or a single value which represents public keys you want to query
     */
    getManagedGroups(publicKeys: string | string[]): Promise<{ name: string }[]>;
    /**
     * get owned token list for accounts. Make sure you have history_plugin enabled on the chain node
     * @param publicKeys a array or a single value which represents public keys you want to query
     * @param groupByDomain whether group the returned values by domain, only avaiable for chain version >= 3
     */
    getOwnedTokens(publicKeys: string[] | string, groupByDomain?: boolean): Promise<({ name: string; domain: string; }[])> | Promise<{ [key: string]: string[] }>;
    /**
     * get specific token's detail information.
     * @param domain the domain to query
     * @param name the name to query
     */
    getToken(domain: string, name: string): Promise<NonFungibleTokenDetail>;
    /**
     * batch get tokens from one domain, the max allowed to get in one request to get is 100.
     * @param domain the domain to query
     * @param skip the offset of request data
     * @param take the amount of data to get
     */
    getTokens(domain: string, skip: number, take: number): Promise<NonFungibleTokenDetail[]>;
    /**
     * Query actions by domain, key and action names. Make sure you have history_plugin enabled on the chain node
     * @param params
     */
    getActions(params: GetActionsParams): Promise<ActionDetail[]>;
    /**
     * get detail information about a transaction by its id.
     * @param id the id of the transaction.
     * @param blockNum (optional) the block num of the transaction. If not provided, the system will find it for you.
     * @param options (optional) addtional options. available field: usingHistoryPlugin - (default true) whether to use history plugin. If you want to query transactions on a node that doesn't have history plugin, please set it to false. But in this case you can't query old transactions.
     */
    getTransactionDetailById(id: string, blockNum?: string, options?: { usingHistoryPlugin?: boolean }): Promise<TransactionWrapper>;
    /**
     * query all the actions of one transaction by its id. Different from `getTransactionDetailById`, this function will return all the actions including actions generated by the chain, like `payCharge`.
     * @param id the id of the transaction.
     */
    getTransactionActions(id: string): Promise<ActionDetail2>;
    /**
     * query block information by num or id
     * @param blockNumOrId id or num of the block
     * @returns information
     */
    getBlockDetail(blockNumOrId: string): Promise<BlockDetail>;
    /**
     * get transaction status of an evtLink. Please note that you must check pending property of the return value to make sure the status will not change any more.
     * 
     * Note: please check the `linkId` property of the return value. If it is not the same one as your expectation, just drop it. It is possible if you use a same callback for two calls.
     * @param options 
     * @returns the status of an evtLink
     */
    getStatusOfEvtLink(options: {
        linkId: string;
        /**
         * Set whether to wait for the transaction to be final. If true, the function will return until the status of this evtLink to be final (aka pending = false), else it will return immediately. 
         */
        block?: boolean;
        throwException?: boolean;
    }): Promise<{
        /**
         * If true, the status of this EvtLink might change in the future.
         */
        pending: boolean;
        successful: boolean;
        exception?: Error;
        transactionId?: string;
        blockNum?: number
    }>;
    /**
     * Get a raw transaction but does NOT push it to the blockchain
     */
    generateUnsignedTransaction(config: PushTransactionConfig, ...actions: EvtAction[]): Promise<Transaction>;
    /**
     * Get estimated charge for a transaction. 100000 in return value represents 1 EVT.
     */
    getEstimatedChargeForTransaction(config: PushTransactionConfig, ...actions: EvtAction[]): Promise<{
        /**
         * Estimated Charge. 100000 represents 1 EVT.
         */
        charge: number;
    }>;
    /**
     * get detail information about a domain by its name. Make sure you have history_plugin enabled on the chain node
     * @param name the name of the domain
     */
    getDomainDetail(name): Promise<DomainDetail>;
    /**
     * Fetch all the transaction ids in one block
     * @param blockId the id of the block
     */
    getTransactionIdsInBlock(blockId: string): Promise<string[]>;
    /**
     * get balances of a user's all kinds of fungible tokens. Make sure you have history_plugin enabled on the chain node
     * @param address the public key of the user you want to query
     * @param symbolId the symbol you want to query, optional
     */
    getFungibleBalance(address: string, symbolId?: number): Promise<string[]>;
    /**
     * get detail information about a group by its name. Make sure you have history_plugin enabled on the chain node
     * @param name the name of the group
     */
    getGroupDetail(name: string): Promise<GroupDetail>;
    /**
     * Query fungible actions by address
     * @param symbolId the id of the symbol 
     * @param address the address (optional)
     * @param skip the count to be skipped, default to 0 (optional)
     * @param take the count to be taked, default to 10 (optional)
     */
    getFungibleActionsByAddress(symbolId: number, address?: string, skip?: number, take?: string): Promise<ActionDetail[]>;
    /**
     * get detail information about transactions which involves specific public keys. Make sure you have history_plugin enabled on the chain node
     * @param publicKeys a single value or a array of public keys to query (required)
     * @param skip the count to be skipped, default to 0 (optional)
     * @param take the count to be taked, default to 10 (optional)
     * @param direction the direction for sorting the result. Defaults to `desc`. Could only be one of "desc" or "asc". (optional)
     */
    getTransactionsDetailOfPublicKeys(publicKeys: string | string[], skip?: number, take?: number, direction?: "desc" | "asc"): Promise<TransactionWrapper[]>;
    /**
     * get detail information about a fungible symbol by its name.
     * @param id the id of the fungible symbol you want to query
     */
    getFungibleSymbolDetail(id: number): Promise<FungibleSymbolDetail>;
    /**
     * Get header state of head block.
     */
    getHeadBlockHeaderState(): Promise<HeadBlockHeaderState>;
    /**
     * push transaction to everiToken chain. If config.submitToNode is set to false, the return would be a signed transaction with config. If config.AbiJsonToBinLocally is set to true, the binargs would be calculated natively.
     * @param config config about the transaction
     * @param actions actions in the transaction
     */
    pushTransaction(config: PushTransactionConfig, ...actions: EvtAction[]): Promise<{ transactionId: string }> | Promise<{ body: PendingTransaction, config: PushTransactionConfig }>;
}

declare interface PushTransactionConfig {
    /**
     * (Default value: 100000000) The limitation of amount you want to pay for transaction fee (EVT, S#1). If actual fee exceeds the limitation provided, an error will occur.
     */
    maxCharge?: number;
    /**
     * (Default value: true) If submitToNode is set to false, the return would be a signed transaction with config. Only available for pushTransaction function.
     */
    submitToNode?: boolean;
    /**
     * (Default value: false) If true, evtjs will try to use local ABI serialization, which is safer and will reduce one round HTTP request.
     */
    AbiJsonToBinLocally?: boolean;
}

declare class EvtAction {
    /**
     * initialize a new EvtAction instance
     * @param actionName the name of the action. See action list at "Action" section of https://www.everitoken.io/developers/apis,_sdks_and_tools/abi_reference#actions .
     * @param abi abi structure of the action, please refer to ABI Reference: https://www.everitoken.io/developers/apis,_sdks_and_tools/abi_reference#actions .
     * @param domain the `domain` value of the action. In most cases you can ignore this parameter except for some special actions. If you want to know if one action is supported, you can call calculateDomainAndKey. For detial, see documentation of trx_json_to_digest at https://www.everitoken.io/developers/apis,_sdks_and_tools/api_reference#post-/v1/chain/trx_json_to_digest
     * @param key the `key` value of the action.  In most cases you can ignore this parameter except for some special actions. If you want to know if one action is supported, you can call calculateDomainAndKey. For detial, see documentation of trx_json_to_digest at https://www.everitoken.io/developers/apis,_sdks_and_tools/api_reference#post-/v1/chain/trx_json_to_digest
     */
    constructor(actionName: string, abi: object, domain?: string, key?: string);
    /**
     * Automatically calculate domain and key and assign them into this.domain, this.key. If action is not supported, an error will be thrown.
     */
    calculateDomainAndKey(): Promise<void>;
    /**
     * the name of the action. See action list at "Action" section of https://www.everitoken.io/developers/apis,_sdks_and_tools/abi_reference#actions.
     */
    actionName: string;
    /**
     * abi structure of the action, please refer to ABI Reference: https://www.everitoken.io/developers/apis,_sdks_and_tools/abi_reference#actions .
     */
    abi: object;
    /**
     * the `domain` value of the action. In most cases it can be calculated automatically. Just call calculateDomainAndKey.
     * For detial, see documentation of trx_json_to_digest at https://www.everitoken.io/developers/apis,_sdks_and_tools/api_reference#post-/v1/chain/trx_json_to_digest
     */
    domain?: string;
    /**
     * the `key` value of the action. In most cases it can be calculated automatically. Just call calculateDomainAndKey.
     * For detial, see documentation of trx_json_to_digest at https://www.everitoken.io/developers/apis,_sdks_and_tools/api_reference#post-/v1/chain/trx_json_to_digest
     */
    key?: string;
}

declare interface HeadBlockHeaderState {
    id: string;
    block_num: number;
    header: BlockchainHeader;
    dpos_proposed_irreversible_blocknum: number;
    dpos_irreversible_blocknum: number;
    bft_irreversible_blocknum: number;
    pending_schedule_lib_num: number;
    pending_schedule_hash: string;
    pending_schedule: Schedule;
    active_schedule: Schedule;
    blockroot_merkle: BlockrootMerkle;
    producer_to_last_produced?: [string, number];
    producer_to_last_implied_irb?: [string, number];
    block_signing_key: string;
    confirm_count?: any[];
    confirmations?: any[];
}
declare interface BlockchainHeader {
    timestamp: string;
    producer: string;
    confirmed: number;
    previous: string;
    transaction_mroot: string;
    action_mroot: string;
    schedule_version: number;
    header_extensions?: any[];
    producer_signature: string;
}
declare interface Schedule {
    version: number;
    producers?: ProducerInfo[];
}
declare interface ProducerInfo {
    producer_name: string;
    block_signing_key: string;
}
declare interface BlockrootMerkle {
    _active_nodes?: (string)[];
    _node_count: number;
}

declare interface FungibleSymbolDetail {
    name: string;
    sym_name: string;
    sym: string;
    creator: string;
    create_time: string;
    issue: Authorization;
    manage: Authorization;
    total_supply: string;
    current_supply: string;
    metas?: Metadata[];
    address: string;
}

declare interface GroupDetail {
    name: string;
    key: string;
    root: GroupRoot;
}

declare interface GroupRoot {
    threshold: number;
    weight: number;
    nodes: (GroupMember)[];
}
declare interface GroupMember {
    threshold: number;
    weight: number;
    nodes?: (GroupMember)[];
    key?: string | null;
}

declare interface DomainDetail {
    name: string;
    creator: string;
    issue_time: string;
    /**
     * The authorization for issuing tokens in a domain
     */
    issue: Authorization;
    /**
     * The authorization for transferring tokens in a domain
     */
    transfer: Authorization;
    /**
     * The authorization for change permission and metadata of a domain
     */
    manage: Authorization;
    address: string;
}

declare interface Authorization {
    name: string;
    /**
     * If total weight of signed authorizers is greater than or eqaul to threshold, the operation will be permitted.
     */
    threshold: number;
    authorizers?: AuthorizersEntity[];
}

declare interface AuthorizersEntity {
    ref: AccountOrGroupReference;
    weight: number;
}

/**
 * A reference to an account or a group.
 * @example [A] EVT6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
 * @example [G] .owner
 */
declare type AccountOrGroupReference = string;

declare interface BlockDetail {
    timestamp: string;
    producer: string;
    confirmed: number;
    previous: string;
    transaction_mroot: string;
    action_mroot: string;
    schedule_version: number;
    new_producers?: any[];
    header_extensions: any[];
    producer_signature: string;
    transactions: (BlockDetailTransactionsEntity)[];
    block_extensions?: any[] | null;
    id: string;
    block_num: number;
    ref_block_prefix: number;
}
declare interface BlockDetailTransactionsEntity {
    status: string;
    type: string;
    trx: TransactionWrapper;
}

declare interface ActionDetail2 {
    trx_id: string;
    name: string;
    domain: string;
    key: string;
    data: ABIData;
    timestamp: string;
}

declare interface GetActionsParams {
    domain: string;
    key?: string;
    names?: (string)[];
    dire?: "asc" | "desc";
    skip?: number;
    take?: number;
}

declare interface ActionDetail {
    name: string;
    domain: string;
    key: string;
    trx_id: string;
    created_at: string;
    data: ABIData;
}

declare interface NonFungibleTokenDetail {
    domain: string;
    name: string;
    owner?: (string)[];
    metas?: (Metadata)[];
}

declare interface Metadata {
    key: string;
    value: string;
    creator: string;
}

declare interface SuspendedTransactionDetail {
    name: string;
    proposer: string;
    status: string;
    trx: Transaction;
    signed_keys?: (string)[];
    signatures?: (string)[];
}

declare interface TransactionWrapper {
    id: string;
    signatures: (string)[];
    compression: string;
    packed_trx: string;
    transaction: Transaction;
}

declare interface Transaction {
    expiration: string;
    ref_block_num: number;
    ref_block_prefix: number;
    actions?: (ActionsEntity)[];
    transaction_extensions?: any[] | null;
    max_charge?: number;
    payer?: string;
}

declare interface PendingTransaction {
    expiration: string;
    transaction: Transaction;
    signatures: (string)[];
    compression: string;
}

declare interface ActionsEntity {
    name: string;
    domain: string;
    key: string;
    data: ABIData;
    hex_data: string;
}

declare type ABIData = any;

declare interface NodeInfo {
    server_version: string;
    chain_id: string;
    evt_api_version: string;
    head_block_num: number;
    last_irreversible_block_num: number;
    last_irreversible_block_id: string;
    head_block_id: string;
    head_block_time: string;
    head_block_producer: string;
    enabled_plugins?: (string)[];
    server_version_string: string;
}

/**
 * Store config for ApiCaller, provide a default config which points to TestNet
 */
declare class EvtConfig implements EvtConfigItems {
    constructor(config?: EvtConfig | EvtConfigItems);
    /**
     * Get TestNet Endpoint of everiToken
     */
    getTestNetEndpoint(): EvtNetworkEndpoint;
    /**
     * Get LocalNet Endpoint of everiToken
     */
    getLocalNetEndpoint(): EvtNetworkEndpoint;
    /**
     * Set or get the endpoint of the server
     */
    endpoint?: EvtNetworkEndpoint;
    /**
     * Timeout in milliseconds for each network request
     */
    networkTimeout?: number;
    /**
     * An async function to process signing, could be used when you need offline signing
     */
    signProvider?: (signParams: SignParams) => Promise<string[]>;
    /**
     * Provide private key. It could be a function to return a key or a key array or a promise which will resolve with a key or a key array, it could also be a key or key array directly. If you provide `signProvidr`, this field will be ignored.
     */
    keyProvider?: string | string[] | Promise<string> | Promise<string[]>;
    /**
     * Optional hook to capture all the http requests to the node. If set, no http request will be launched automatically, all the requests will be transferred to your hook and take the return value as response.
     */
    httpRequestHook?: HttpRequestHook;
}

declare interface EvtConfigItems {
    /**
     * Set or get the endpoint of the server
     */
    endpoint?: EvtNetworkEndpoint;
    /**
     * Timeout in milliseconds for each network request
     */
    networkTimeout?: number;
    /**
     * An async function to process signing, could be used when you need offline signing
     */
    signProvider?: (signParams: SignParams) => Promise<string[]>;
    /**
     * Optional hook to capture all the http requests to the node. If set, no http request will be launched automatically, all the requests will be transferred to your hook and take the return value as response.
     */
    httpRequestHook?: HttpRequestHook;
    /**
     * Provide private key. It could be a function to return a key or a key array or a promise which will resolve with a key or a key array, it could also be a key or key array directly. If you provide `signProvidr`, this field will be ignored.
     */
    keyProvider?: string | string[] | Promise<string> | Promise<string[]>;
}

declare type HttpRequestHook = (url: string, options: HttpRequestOptions) => Promise<{ json: () => Promise<any>; }>;

declare interface HttpRequestOptions {
    method: string;
    body: string;
    headers: {
        [key: string]: string;
    },
    networkTimeout: number;
}

declare interface SignParams {
    signHash: (dataSha256: string | Buffer, privateKey: string, encoding: "hex" | "utf8" | "base64") => Promise<string>;
    buf: Buffer;
    transaction: any; // TODO
    privateKeys: string[];
}

declare interface EvtNetworkEndpoint {
    host: string;
    port: number;
    protocol: "http" | "https";
}

declare interface EntryPoint {
    (config: EvtConfigItems | EvtConfig): ApiCaller;
    /**
     * A class representing an action of everiToken. 
     */
    EvtAction: typeof EvtAction;
    /**
     * A class representing APICaller's config.
     */
    EvtConfig: typeof EvtConfig;
    /**
     * API Client of everiToken public chain.
     */
    APICaller: typeof ApiCaller;
    EvtKey: EvtKey;
    EvtLink: EvtLink;
    Helper: Helper;
}

declare interface Helper {
    /**
     * Util methods to process generated address
     */
    GeneratedAddress: GeneratedAddress
}

declare interface GeneratedAddress {
    /**
     * Convert generated address into object
     * @param str 
     */
    toJSON(str: string): {prefix: string, key: string, nonce: number};
    /**
     * Generate generated address into string
     * @param str 
     */
    fromJSON(option: {prefix: string, key: string, nonce: number}): string;
    /**
     * Convert generated address into string
     * @param str 
     */
    toBin(str: string): Buffer;
    /**
     * Generate generated-address from buffer
     * @param bin 
     * @param encoding Must be one of "buffer" | "hex" | "base64"
     */
    fromBin(bin: string | Buffer, encoding: "buffer" | "hex" | "base64"): string;
}

declare interface EvtLink {
    /**
     * parse EvtLink's text
     * @param text 
     * @param options 
     */
    parseEvtLink(text: string, options?: {
        /**
         * Whether recover public keys from evtLink. if true, the speed will be slower.
         */
        recoverPublicKeys?: boolean;
    }): Promise<ParsedEvtLink>;
    /**
     * parse EvtLink's text without promise
     * @param text 
     * @param options 
     */
    parseEvtLinkSync(text: string, options?: {
        /**
         * Whether recover public keys from evtLink. if true, the speed will be slower.
         */
        recoverPublicKeys?: boolean;
    }): ParsedEvtLink;
    /**
     * Validate an everiPass without pushing transactions (read-only mode). It is not safe if someone check everiPass and transfer it to others in a very short time (like < 2 seconds).
     * @param options 
     */
    validateEveriPassUnsafe(options: {
        /**
         * parsed evtLink using `parseEvtLinkSync` or `parseEvtLink`. If set, `evtLink` property is unnecessary.
         */
        parsedEvtLink?: ParsedEvtLink;
        /**
         * Original EvtLink. If set, `parsedEvtLink` property is unnecessary.
         */
        evtLink?: string;
    }): Promise<{ valid: boolean; domain: string; name: string; }>;
    /**
     * Get a cryptography-strong unique link id that is mostly unique.
     */
    getUniqueLinkId(): Promise<string>;
    /**
     * get everiPass's text from specific private key and token name
     */
    getEvtLinkForEveriPass(options: everiPassParams): Promise<{ rawText: string; }>;
    /**
      * get everiPay's text from specific private key and token symbol
      */
    getEvtLinkForEveriPay(options: everiPayParams): Promise<{ rawText: string; }>;
    /**
    * get evt link for payee code, which is used for receving fungible tokens
    */
    getEvtLinkForPayeeCode(options: PayeeCodeParams): Promise<{ rawText: string; }>;
    /**
     * get qr code image from EvtLink
     */
    getEVTLinkQrImage(qrType: "everiPass" | "everiPay" | "payeeCode", qrParams: everiPassParams | everiPayParams | PayeeCodeParams, imgParams: {
        /**
         * Whether to reload the image automitcally every several seconds. In most cases you should set it to true.
         */
        autoReload?: boolean;
        /**
         * If true, the QR Code will be draw to specific Canvas HtmlElement
         */
        canvas: HTMLCanvasElement;
    }, callback: (err: Error, params: GetEVTLinkQrImageCallbackParams) => void): {
        /**
         * When you finish using the QRCode, make sure to use `clearIntervalId(intervalId)` to clear the callback event.
         */
        intervalId: number;
        /**
         * The timespan to refresh the qr code.
         */
        autoReloadInterval: number;
    };
}

declare interface GetEVTLinkQrImageCallbackParams {
    /**
     * Get raw text (only when canvas is set)
     */
    rawText?: string;
    /**
     * Get DataUrl for the image as per RFC2397 (https://tools.ietf.org/html/rfc2397). You could use this value to set src attribute of img element. Only set avaiable when `params.canvas == null`.
     */
    dataUrl?: string;
    /**
     * Elapsed time rendering the qr code.
     */
    timeConsumed: number;
    /**
     * When you finish using the QRCode, make sure to use `clearIntervalId(intervalId)` to clear the callback event.
     */
    intervalId: number;
}

declare interface PayeeCodeParams {
    /**
     * The reciver's address.
     */
    address: string;
    /**
     * (Optional) Accepted fungible symbol id. If not set, all the fungible symbols could be used.
     */
    fungibleId: number;
    /**
     * (Optional) Amonut. Amount must be a decimal string with proper precision (like asset type doing)
     */
    amount?: string;
}

declare interface everiPassParams {
    domainName: string;
    tokenName: string;
    /**
     * If set to true, the token will be destroyed after use.
     */
    autoDestroying: boolean;
    /**
     * The memory information will be recorded onto the chain. For current Mainnet it is not supported.
     */
    memo?: string;
}

declare interface everiPayParams {
    /**
     * The symbol id for payment.
     */
    symbol: number;
    /**
     * Unique link id. You can get it from `getUniqueLinkId` method. Note for every same transaction you must use same linkId. For different transactions you must use different linkId.
     */
    linkId: string;
    /**
     * (Optional) Max amount for this payment.
     */
    maxAmount?: number;
    /**
     * (Optional) Fixed amount for this payment. If set, any other amount will cause an error. 
     */
    fixedAmount?: number;
    /**
     * (Optional) The memory information will be recorded onto the chain. For current Mainnet it is not supported.
     */
    memo?: string;
}

declare interface ParsedEvtLink {
    flag: number;
    segments: EvtLinkSegment[];
    publicKeys?: string[];
    signatures: string[];
}

declare interface EvtLinkSegment {
    /**
     * As per https://www.everitoken.io/developers/deep_dive/evtlink,_everipay,_everipass#segments-stream
     */
    typeKey: number;
    value: string | number | Buffer;
    bufferLength: number;
}

declare interface EvtKey {
    /**
     * Conver private key into public key.
     * @param privateKey Private key.
     */
    privateToPublic(privateKey: string): string;
    /**
     * Generates a private key for everiToken public chain and returns a `Promise`.
     */
    randomPrivateKey(): Promise<string>;
    /**
     * Generates a private key for evt from a Buffer
     * @param bufferHex Buffer in hex string.
     */
    privateKeyFromBuffer(bufferHex: string): string;
    /**
     * Convert private key into buffer hex.
     * @param privateKey
     */
    privateKeyToBufferHex(privateKey: string): string;
    /**
     * Generates a public key for evt from a compressed Buffer format.
     */
    publicKeyFromCompressedBuffer(bufferHex: string): string;
    /**
     * Generates a private key for evt in specific seed. Note: The same seed produces the same private key every time. At least 128 random bits should be used to produce a good private key.
     * @param seed The seed string
     */
    seedPrivateKey(seed: string): string;
    /**
     * Check if a public key is valid.
     * @param publicKey 
     */
    isValidPublicKey(publicKey: string): boolean;
    /**
     * Check if an address is valid. An address could be either a public key or generatd address like 'EVT00000000000000000000000000000000000000000000000000'.
     * @param publicKey 
     */
    isValidAddress(publicKey: string): boolean;
    /**
     * Sign data using specific private key.
     * @param buf The buffer for signing.
     * @param privateKey 
     * @param encoding If buffer is string, specify the encoding, must be one of 'hex' | 'utf8' | 'base64'.
     */
    sign(buf: string | Buffer, privateKey: string, encoding?: 'hex' | 'utf8' | 'base64'): string;
    /**
     * Sign hashed data (via sha256) using specific private key.
     * @param bufHashed The buffer for signing, must be 32 bytes.
     * @param privateKey 
     * @param encoding If buffer is string, specify the encoding, must be one of 'hex' | 'utf8' | 'base64'.
     */
    signHash(bufHashed: string | Buffer, privateKey: string, encoding?: 'hex' | 'utf8' | 'base64'): string;
    /**
     * return 32-byte safe random bytes as hex.
     */
    random32BytesAsHex(): string;
    /**
     * return 32-byte safe random bytes.
     */
    random32BytesAsHex(): Buffer;
    /**
     * return a promise that resolves a safe random string to be used in name128 format.
     */
    randomName128(): Promise<string>;
    /**
     * Check if a private key is valid.
     */
    isValidPrivateKey(privateKey): boolean;
    /**
     * return the address representing a null address.
     */
    getNullAddress(): string;
}

export declare var EVT: EntryPoint;

export default EVT;
