import { ethers } from 'ethers';

export function normalizedToUsd(
    value,
    marketReferencePriceInUsd,
) {
    let valueTemp = (value).toString()
    // valueTemp = ethers.utils.formatEther(valueTemp)
    valueTemp = ethers.utils.formatEther(valueTemp)
    let marketReferencePriceInUsdTemp = (marketReferencePriceInUsd).toString()
    marketReferencePriceInUsdTemp = ethers.utils.formatUnits(marketReferencePriceInUsdTemp, 8)
    console.log("value:", valueTemp, "marketReferencePriceInUsd:", marketReferencePriceInUsdTemp)

    let temp = valueTemp * marketReferencePriceInUsdTemp
    temp = temp.toString()
    return temp
}

