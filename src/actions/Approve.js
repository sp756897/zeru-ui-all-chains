import { ERC20Service } from '@aave/contract-helpers';
import deployed_contracts_address from "../deployed-contracts.json"
import { submitTransaction } from "./SubmitTransaction";
import { BigNumber } from 'ethers';

import { ChainIdsToNetwork } from '../helpers/ChainIds'

export const onApprove = async (provider, reserve, user) => {

    const realProvider = provider.provider
    let chainIdTemp = await realProvider.getNetwork()
    console.log("chainIdTemp: ", chainIdTemp)
    let chainId = chainIdTemp.chainId

    const chainName = ChainIdsToNetwork(chainId)
    const lendingPoolAddress = deployed_contracts_address.LendingPool[chainName].address
    const MaxUint256 = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    const DEFAULT_APPROVE_AMOUNT = MaxUint256.toString();

    const erc20Service = new ERC20Service(realProvider);

    console.log(user, reserve, lendingPoolAddress, DEFAULT_APPROVE_AMOUNT)

    const tx = erc20Service.approve({
        user,
        token: reserve,
        spender: lendingPoolAddress,
        amount: DEFAULT_APPROVE_AMOUNT,
    });

    console.log(tx)
    const txs = []

    txs.push(tx)


    await submitTransaction(realProvider, txs)
}

