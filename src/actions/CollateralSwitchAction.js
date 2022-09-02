import { LendingPool } from '@aave/contract-helpers';
import deployed_contracts_address from "../deployed-contracts.json"

import { ChainIdsToNetwork } from '../helpers/ChainIds'

export const CollateralSwitchAction = async (user, reserve, usageAsCollateral, provider) => {

    const realProvider = provider.provider
    let chainIdTemp = await realProvider.getNetwork()
    console.log("chainIdTemp: ", chainIdTemp)
    let chainId = chainIdTemp.chainId

    const chainName = ChainIdsToNetwork(chainId)
    const lendingPoolAddress = deployed_contracts_address.LendingPool[chainName].address

    const lendingPool = new LendingPool(realProvider, {
        LENDING_POOL: lendingPoolAddress,
    });

    const txs = await lendingPool.setUsageAsCollateral(
        {
            user,
            reserve: reserve,
            usageAsCollateral: usageAsCollateral,
        },
    );

    console.log(txs)

    return txs
}