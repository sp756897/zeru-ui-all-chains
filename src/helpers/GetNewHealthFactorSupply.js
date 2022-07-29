import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from "@aave/math-utils"
import { BigNumber } from 'bignumber.js';

export const GetNewHealthFactorSupply = (
    user,
    amountt,
    formattedPriceInMarketReferenceCurrency,
    totalCreditInEth,
    totalCollateralMarketReferenceCurrency,
    currentLiquidationThreshold,
    formattedReserveLiquidationThreshold,
    totalBorrowsMarketReferenceCurrency,
    usageAsCollateral,
    usageAsCollateralEnabledOnUser,
    underlyingBalanceMarketReferenceCurrency

) => {
    if ((usageAsCollateral && usageAsCollateralEnabledOnUser) || (underlyingBalanceMarketReferenceCurrency == 0)) {

        const amountIntEth = new BigNumber(amountt.amount).multipliedBy(
            formattedPriceInMarketReferenceCurrency
        );
        const totalCreditInEthBig = valueToBigNumber(totalCreditInEth)
        const totalCollateralMarketReferenceCurrencyAfter = user
            ? valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(amountIntEth).plus(totalCreditInEthBig)
            : '-1';
        console.log("totalCollateralMarketReferenceCurrencyAfter: ", totalCollateralMarketReferenceCurrencyAfter.toString())

        const totalCollateralMarketReferenceCurrencyTemp = valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(totalCreditInEthBig)
        const liquidationThresholdAfter = user
            ? valueToBigNumber(totalCollateralMarketReferenceCurrencyTemp)
                .multipliedBy(currentLiquidationThreshold)
                .plus(amountIntEth.multipliedBy(formattedReserveLiquidationThreshold))
                .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
            : '-1';
        console.log("liquidationThresholdAfter: ", liquidationThresholdAfter.toString())

        let newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
            collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyAfter,
            borrowBalanceMarketReferenceCurrency: valueToBigNumber(totalBorrowsMarketReferenceCurrency),
            currentLiquidationThreshold: liquidationThresholdAfter
        })

        console.log("newHealthFactor: ", newHealthFactor.toString())

        return newHealthFactor
    }

}
