
import { LendingPool, InterestRate } from '@aave/contract-helpers';
import deployed_contracts_address from "../deployed-contracts.json"
import { submitTransaction } from "./SubmitTransaction";

import { ChainIdsToNetwork } from '../helpers/ChainIds'

export const onSwapInterestMode = async (provider, reserve, user, interestRateMode) => {

    const realProvider = provider.provider
    let chainIdTemp = await realProvider.getNetwork()
    console.log("chainIdTemp: ", chainIdTemp)
    let chainId = chainIdTemp.chainId

    const chainName = ChainIdsToNetwork(chainId)
    const lendingPoolAddress = deployed_contracts_address.LendingPool[chainName].address

    const lendingPool = new LendingPool(realProvider, {
        LENDING_POOL: lendingPoolAddress,
    });

    console.log("swapinterestmode", "interestRateMode:", interestRateMode, "user", user, "reserve", reserve)

    const txs = await lendingPool.swapBorrowRateMode({
        user,
        reserve,
        interestRateMode: interestRateMode,
    });

    console.log(txs)

    return txs
}


