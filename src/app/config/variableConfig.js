const variables = {

    // return response related variables here 
    Success: 200,
    Created: 201,
    NoContent: 204,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    ValidationError: 422,
    MethodNotAllowed: 405,
    InternalServerError: 500,
    UnknownError: 520,
    badGateway: 502,
    serviceUnavailabe: 503,

    //user related variables here
    Registration: 1,
    AdminId: 1,
    Blocked: 1,
    Unblocked: 0,

    //web3 transaction realted variables here
    DaiContractAddress: "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814",
    MaticContractAddress: "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814",
    smartContractAddress: "0x3CC5D3A63c85e789437e98C2F0b0dDb92F841bee",
    AdminWalletAddress: "0x1C913bf1F34daA8b51D397f7b29DF375EEa917A1",
    PendingTransaction: 0,
    CompleteTransaction: 1,
    RejectedTransaction: 2,

    //stake type
    DaiStaking: 1,
    MaticStaking: 2,
    SelfStaking: 1,
    AffiliateStaking: 2,
    PendingStaking: 0,
    CompletedStaking: 1,

    //pools realted variables
    PendingPool: 0,
    CompletedPool: 1,

    //wallet types
    StakingIncomeWallet: 1,
    LoyalityIncomeWallet: 2,

    //wallet reports types
    StakingIncome: 1,
    LoyalityIncome: 2,
};

export default variables;