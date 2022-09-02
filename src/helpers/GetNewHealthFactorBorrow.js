import { BigNumber } from 'bignumber.js';
import { valueToBigNumber, calculateHealthFactorFromBalancesBigUnits } from '@aave/math-utils';

export const GetNewHealthFactorBorrow = (
    amountt,
    formattedPriceInMarketReferenceCurrency,
    totalCreditInEth,
    totalCollateralMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold
) => {
    const amountIntEth = new BigNumber(amountt.amount).multipliedBy(
        formattedPriceInMarketReferenceCurrency
    );
    const totalCreditInEthBig = valueToBigNumber(totalCreditInEth)
    const totalCollateralMarketReferenceCurrencyTemp = valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(totalCreditInEthBig)
    const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyTemp,
        borrowBalanceMarketReferenceCurrency: valueToBigNumber(totalBorrowsMarketReferenceCurrency).plus(
            amountIntEth
        ),
        currentLiquidationThreshold: valueToBigNumber(currentLiquidationThreshold),
    });

    // console.log(newHealthFactor.toString(10), amountIntEth.toString(), totalCreditInEthBig.toString(), totalCollateralMarketReferenceCurrencyTemp.toString())
    return (newHealthFactor.toString())

}
