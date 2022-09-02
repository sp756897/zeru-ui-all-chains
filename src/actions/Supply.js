import { LendingPool } from '@aave/contract-helpers';
import deployed_contracts_address from "../deployed-contracts.json"
import { submitTransaction } from "./SubmitTransaction";

import { ChainIdsToNetwork } from '../helpers/ChainIds'

export const onSupply = async (provider, amount, reserve, user) => {

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

    const txs = await lendingPool.deposit({
        user,
        reserve,
        amount: realAmount
    });

    console.log(txs)

    return txs
}