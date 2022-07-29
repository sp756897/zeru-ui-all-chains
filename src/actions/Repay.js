import { LendingPool, InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import deployed_contracts_address from "../deployed-contracts.json"
import { submitTransaction } from "./SubmitTransaction";

export const onRepay = async (provider, amount, reserve, user, interestRateMode) => {

    const realProvider = provider.provider
    const lendingPoolAddress = deployed_contracts_address.LendingPool.mumbai.address
    const wethGatewayAddress = deployed_contracts_address.WETHGateway.mumbai.address
    const realAmount = amount.amount

    const lendingPool = new LendingPool(realProvider, {
        LENDING_POOL: lendingPoolAddress,
        WETH_GATEWAY: wethGatewayAddress,
    });

    console.log("interestRateMode:", interestRateMode, "realAmount: ", realAmount, user, reserve)

    const txs = await lendingPool.repay({
        user,
        reserve,
        amount: realAmount,
        interestRateMode: interestRateMode,
    });

    console.log(txs)

    return txs
}