import { LendingPool } from '@aave/contract-helpers';
import deployed_contracts_address from "../deployed-contracts.json"
import { submitTransaction } from "./SubmitTransaction";

import { ChainIdsToNetwork } from '../helpers/ChainIds'

export const onWithdraw = async (provider, amount, reserve, user) => {

    const realProvider = provider.provider
    let chainIdTemp = await realProvider.getNetwork()
    console.log("chainIdTemp: ", chainIdTemp)
    let chainId = chainIdTemp.chainId

    const chainName = ChainIdsToNetwork(chainId)
    const lendingPoolAddress = deployed_contracts_address.LendingPool[chainName].address
    const wethGatewayAddress = deployed_contracts_address.WETHGateway[chainName].address
    const realAmount = amount.amount

    const lendingPool = new LendingPool(realProvider, {
        LENDING_POOL: lendingPoolAddress,
        WETH_GATEWAY: wethGatewayAddress,
    });

    console.log("realAmount", realAmount)

    const txs = await lendingPool.withdraw({
        user,
        reserve,
        amount: realAmount,
    });

    console.log("txs:", txs)

    return txs
}

/*
- @param `user` The ethereum address that will receive the aTokens 
- @param `reserve` The ethereum address of the reserve asset 
- @param `amount` The amount of aToken being redeemed 
- @param @optional `aTokenAddress` The ethereum address of the aToken. Only needed if the reserve is ETH mock address 
- @param @optional `onBehalfOf` The amount of aToken being redeemed. It will default to the user address
*/