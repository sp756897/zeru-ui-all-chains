import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from "@aave/math-utils"
import { BigNumber } from 'bignumber.js';

export const GetNewHealthFactorWithdraw = (
    amountt,
    totalCollateralMarketReferenceCurrency,
    currentLiquidationThreshold,
    healthFactor,
    collateral,
    usageAsCollateralEnabled,
    formattedPriceInMarketReferenceCurrency,
    totalCreditInEth,
    reserveLiquidationThreshold,
    totalBorrowsMarketReferenceCurrency
) => {
    // health factor calculations
    let totalCollateralInETHAfterWithdraw = valueToBigNumber(
        totalCollateralMarketReferenceCurrency
    );
    let liquidationThresholdAfterWithdraw = valueToBigNumber(currentLiquidationThreshold);
    let healthFactorAfterWithdrawTemp = valueToBigNumber(healthFactor);

    if (collateral && usageAsCollateralEnabled) {

        const amountToWithdrawInEth = valueToBigNumber(amountt.amount).multipliedBy(
            valueToBigNumber(formattedPriceInMarketReferenceCurrency)
        );

        const totalCreditInEthBig = valueToBigNumber(totalCreditInEth)
        totalCollateralInETHAfterWithdraw =
            totalCollateralInETHAfterWithdraw.minus(amountToWithdrawInEth).plus(totalCreditInEthBig);

        const totalCollateralMarketReferenceCurrencyTemp = valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(totalCreditInEthBig)

        liquidationThresholdAfterWithdraw = valueToBigNumber(
            totalCollateralMarketReferenceCurrencyTemp
        )
            .multipliedBy(valueToBigNumber(currentLiquidationThreshold))
            .minus(valueToBigNumber(amountToWithdrawInEth)
                .multipliedBy(valueToBigNumber(reserveLiquidationThreshold)))
            .div(totalCollateralInETHAfterWithdraw)
            .toFixed(4, BigNumber.ROUND_DOWN);

        healthFactorAfterWithdrawTemp = calculateHealthFactorFromBalancesBigUnits({
            collateralBalanceMarketReferenceCurrency: totalCollateralInETHAfterWithdraw,
            borrowBalanceMarketReferenceCurrency: valueToBigNumber(totalBorrowsMarketReferenceCurrency),
            currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
        });
        console.log(totalCollateralInETHAfterWithdraw.toString(), totalBorrowsMarketReferenceCurrency, liquidationThresholdAfterWithdraw.toString())
        console.log("healthFactorAfterWithdrawTemp: ", healthFactorAfterWithdrawTemp.toString())
        return (healthFactorAfterWithdrawTemp.toString())
    }
}
