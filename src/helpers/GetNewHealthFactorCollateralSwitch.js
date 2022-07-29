import { BigNumber } from 'bignumber.js';
import { valueToBigNumber, calculateHealthFactorFromBalancesBigUnits } from '@aave/math-utils';

export const GetNewHealthFactorCollateralSwitch = (
    usageAsCollateralEnabledOnUser,
    totalCollateralMarketReferenceCurrency,
    underlyingBalanceMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold,
    reserveLiquidationThreshold,
    totalCreditInEth

) => {
    // health factor Calcs
    console.log("usageAsCollateralEnabledOnUser:", usageAsCollateralEnabledOnUser,
        "totalCollateralMarketReferenceCurrency:", totalCollateralMarketReferenceCurrency.toString(),
        "underlyingBalanceMarketReferenceCurrency:", underlyingBalanceMarketReferenceCurrency,
        "totalBorrowsMarketReferenceCurrency:", totalBorrowsMarketReferenceCurrency,
        "currentLiquidationThreshold:", currentLiquidationThreshold,
        "totalCreditInETH:", totalCreditInEth)
    var liquidationThresholdAfterWithdraw;
    const usageAsCollateralModeAfterSwitch = !usageAsCollateralEnabledOnUser;
    const totalCollateralMarketReferenceCurrencyInBig = valueToBigNumber(totalCollateralMarketReferenceCurrency);
    const currenttotalCollateralMarketReferenceCurrency = totalCollateralMarketReferenceCurrencyInBig.plus(valueToBigNumber(totalCreditInEth))

    const totalCollateralAfterSwitchETH = currenttotalCollateralMarketReferenceCurrency[
        usageAsCollateralModeAfterSwitch ? 'plus' : 'minus'
    ](underlyingBalanceMarketReferenceCurrency);

    console.log("currenttotalCollateralMarketReferenceCurrency:", currenttotalCollateralMarketReferenceCurrency.toString(),
        "totalCollateralAfterSwitchETH:", totalCollateralAfterSwitchETH.toString())

    if (usageAsCollateralModeAfterSwitch) {
        liquidationThresholdAfterWithdraw = valueToBigNumber(
            currenttotalCollateralMarketReferenceCurrency
        )
            .multipliedBy(valueToBigNumber(currentLiquidationThreshold))
            .plus(valueToBigNumber(underlyingBalanceMarketReferenceCurrency)
                .multipliedBy(valueToBigNumber(reserveLiquidationThreshold)))
            .div(totalCollateralAfterSwitchETH)
            .toFixed(4, BigNumber.ROUND_DOWN);
    }
    else {
        liquidationThresholdAfterWithdraw = valueToBigNumber(
            currenttotalCollateralMarketReferenceCurrency
        )
            .multipliedBy(valueToBigNumber(currentLiquidationThreshold))
            .minus(valueToBigNumber(underlyingBalanceMarketReferenceCurrency)
                .multipliedBy(valueToBigNumber(reserveLiquidationThreshold)))
            .div(totalCollateralAfterSwitchETH)
            .toFixed(4, BigNumber.ROUND_DOWN);
    }

    const healthFactorAfterSwitch = calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency: totalCollateralAfterSwitchETH,
        borrowBalanceMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency,
        currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
    });
    console.log("healthFactorAfterSwitch: ", healthFactorAfterSwitch.toString())
    return healthFactorAfterSwitch
}
