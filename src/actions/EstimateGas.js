import { ethers } from "ethers"

export default async function EstimateGas(txs, marketReferencePriceInUsd) {
    console.log(marketReferencePriceInUsd)
    let totalGas = 0
    const marketReferencePriceInUsdValue = marketReferencePriceInUsd ? marketReferencePriceInUsd : 1000.00

    for (var tx in txs) {
        let gas = await txs[tx].gas()
        let gasPrice = gas["gasPrice"]
        let gasLimit = gas["gasLimit"]
        totalGas += parseFloat(gasPrice) * parseFloat(gasLimit)
    }

    let totalGasString = (totalGas).toString()
    let totalGasFloat = parseFloat(ethers.utils.formatEther(totalGasString))
    console.log("totalGasFloat: ", totalGasFloat)
    let totalGasUSD = (totalGasFloat) * marketReferencePriceInUsdValue
    console.log("marketReferencePriceInUsdValue: ", marketReferencePriceInUsdValue, "totalGasUSD: ", totalGasUSD)
    return totalGasUSD;
}
