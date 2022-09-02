import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber, USD_DECIMALS } from "@aave/math-utils"
import { BigNumber } from 'bignumber.js';

export const GetNewHealthFactorRepay = (
    amountt,
    totalBorrowsMarketReferenceCurrency,
    formattedPriceInMarketReferenceCurrency,
    usageAsCollateralEnabledOnUser,
    totalCollateralMarketReferenceCurrency,
    currentLiquidationThreshold,
    totalCreditInEth

) => {
    // debt remaining after repay
    const amountIntEth = new BigNumber(amountt.amount).multipliedBy(
        formattedPriceInMarketReferenceCurrency
    );
    const borrowBalanceMarketReferenceCurrencyAfter = valueToBigNumber(totalBorrowsMarketReferenceCurrency || '0')
        .minus(amountIntEth)

    const totalCreditInEthInBig = valueToBigNumber(totalCreditInEth)

    const collateralBalanceMarketReferenceCurrencyAfter = usageAsCollateralEnabledOnUser ?
        valueToBigNumber(totalCollateralMarketReferenceCurrency || '0')
            .plus(totalCreditInEthInBig)
            .minus(valueToBigNumber(formattedPriceInMarketReferenceCurrency).multipliedBy(amountIntEth))
        : totalCollateralMarketReferenceCurrency || '0'
    // health factor calculations
    // we use usd values instead of MarketreferenceCurrency so it has same precision
    const newHF = calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency: collateralBalanceMarketReferenceCurrencyAfter,
        borrowBalanceMarketReferenceCurrency: borrowBalanceMarketReferenceCurrencyAfter,
        currentLiquidationThreshold: valueToBigNumber(currentLiquidationThreshold)
    })

    // console.log("newHF: ", newHF.toString())
    return newHF.toString()

}

