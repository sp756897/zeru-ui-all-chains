import { LendingPool } from '@aave/contract-helpers';
import deployed_contracts_address from "../deployed-contracts.json"

export const CollateralSwitchAction = async (user, reserve, usageAsCollateral, provider) => {

    const realProvider = provider.provider
    const lendingPoolAddress = deployed_contracts_address.LendingPool.mumbai.address

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