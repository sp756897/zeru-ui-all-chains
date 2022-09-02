import { ERC20Service } from '@aave/contract-helpers'
import deployed_contracts_address from "../deployed-contracts.json"

import { ChainIdsToNetwork } from '../helpers/ChainIds'

export const isApproved = async (provider, reserve, user, amount) => {

    const realProvider = provider.provider
    let chainIdTemp = await realProvider.getNetwork()
    console.log("chainIdTemp: ", chainIdTemp)
    let chainId = chainIdTemp.chainId

    const chainName = ChainIdsToNetwork(chainId)
    const lendingPoolAddress = deployed_contracts_address.LendingPool[chainName].address
    const realAmount = amount.amount

    const erc20Service = new ERC20Service(realProvider);

    const approved = await erc20Service.isApproved({
        token: reserve,
        user,
        spender: lendingPoolAddress,
        amount: realAmount,
    });

    return approved
}

