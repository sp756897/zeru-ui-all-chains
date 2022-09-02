import { useSelector } from "react-redux";

export const CalculateNetAPY = () => {

  const userSummary = useSelector((state) => state.reserve.userSummary);

  if (userSummary) {
    const proportions = userSummary ? userSummary.userReservesData.reduce(
      (acc, value) => {
        const reserve = value.reserve

        if (reserve) {
          if (value.underlyingBalanceUSD !== '0') {
            acc.positiveProportion = acc.positiveProportion + (
              (reserve.supplyAPY) * (value.underlyingBalanceUSD)
            );
            if (reserve.aIncentivesData) {
              reserve.aIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion + (
                  (incentive.incentiveAPR) * (value.underlyingBalanceUSD)
                );
              });
            }
          }
          if (value.variableBorrowsUSD !== '0') {
            acc.negativeProportion = acc.negativeProportion + (
              (reserve.variableBorrowAPY) * (value.variableBorrowsUSD)
            );
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion + (
                  (incentive.incentiveAPR) * (value.variableBorrowsUSD)
                );
              });
            }
          }
          if (value.stableBorrowsUSD !== '0') {
            acc.negativeProportion = acc.negativeProportion + (
              (value.stableBorrowAPY) * (value.stableBorrowsUSD)
            );
            if (reserve.sIncentivesData) {
              reserve.sIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion + (
                  (incentive.incentiveAPR) * (value.stableBorrowsUSD)
                );
              });
            }
          }
        } else {
          throw new Error('no possible to calculate net apy');
        }
        return acc;
      },
      {
        positiveProportion: 0.00,
        negativeProportion: 0.00,
      }
    ) : ""

    let earnedAPY = (proportions.positiveProportion / ((userSummary.totalLiquidityUSD)))
    let debtAPY = (proportions.negativeProportion / ((userSummary.totalBorrowsUSD)))
    //earnedAPY = earnedAPY ? "" : 0.00
    //debtAPY = debtAPY ? "" : 0.00

    // console.log("earnedAPY: ", earnedAPY, "debtAPY: ", debtAPY, "totalLiquidityUSD: ", userSummary.totalLiquidityUSD, "netWorthUSD: ", userSummary.netWorthUSD, "totalBorrowsUSD: ", userSummary.totalBorrowsUSD)
    // console.log("earnedAPYCalc: ", (earnedAPY || 0) *
    //   ((userSummary.totalLiquidityUSD) / (userSummary.netWorthUSD !== '0' ? userSummary.netWorthUSD : '1'))
    //   , "debtAPY", (debtAPY || 0) *
    // ((userSummary.totalBorrowsUSD) / (userSummary.netWorthUSD !== '0' ? userSummary.netWorthUSD : '1')))


    // console.log("earnedAPY2: ", earnedAPY)
    const netAPY =
      Math.abs((earnedAPY || 0) *
        ((userSummary.totalLiquidityUSD) / (userSummary.netWorthUSD !== '0' ? userSummary.netWorthUSD : '1')))
      -
      Math.abs((debtAPY || 0) *
        ((userSummary.totalBorrowsUSD) / (userSummary.netWorthUSD !== '0' ? userSummary.netWorthUSD : '1')));
    // console.log("netapy:", netAPY)
    return netAPY.toFixed(2)
  }
}