import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import deployed_contracts_address from "../../deployed-contracts.json"
import UiPoolDataProvider_abi from "../../artifacts/contracts/misc/UiPoolDataProviderV2.sol/UiPoolDataProviderV2.json"
import walletBalanceProvider_abi from "../../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
import creditToken_abi from "../../artifacts/contracts/protocol/tokenization/CreditTokenNew.sol/CreditTokenNew.json"
import LendingPool_abi from '../../artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json';

import { UiPoolDataProvider, WalletBalanceProvider } from "@aave/contract-helpers"
import { formatReserves, formatUserSummary } from '@aave/math-utils';
import dayjs from 'dayjs';
import { normalizedToUsd } from '../../helpers/NormalizeToUSD';
import { CreditBalance } from '../../components/CreditBalance';
import { DigitsFormat } from "../../helpers/DigitsFormat"

const lendingPoolAddressProvider = deployed_contracts_address.LendingPoolAddressesProvider.mumbai.address
const lendingPool_address = deployed_contracts_address.LendingPool.mumbai.address
const uipoolDataProvider_address = deployed_contracts_address.UiPoolDataProvider.mumbai.address
const walletBalanceProviderAddress = deployed_contracts_address.WalletBalanceProvider.mumbai.address

let reserve_data = null
let UiPoolDataProvider_contract = null
let chainId = null
let lendingPool_contract = null

const ammSymbolMap = {
    '0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5': 'UNIDAIUSDC',
    '0x004375dff511095cc5a197a54140a24efef3a416': 'UNIWBTCUSDC',
    '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11': 'UNIDAIWETH',
    '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc': 'UNIUSDCWETH',
    '0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f': 'UNIAAVEWETH',
    '0xb6909b960dbbe7392d405429eb2b3649752b4838': 'UNIBATWETH',
    '0x3da1313ae46132a397d90d95b1424a9a7e3e0fce': 'UNICRVWETH',
    '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974': 'UNILINKWETH',
    '0xc2adda861f89bbb333c90c492cb837741916a225': 'UNIMKRWETH',
    '0x8bd1661da98ebdd3bd080f0be4e6d9be8ce9858c': 'UNIRENWETH',
    '0x43ae24960e5534731fc831386c07755a2dc33d47': 'UNISNXWETH',
    '0xd3d2e2692501a5c9ca623199d38826e513033a17': 'UNIUNIWETH',
    '0xbb2b8038a1640196fbe3e38816f3e67cba72d940': 'UNIWBTCWETH',
    '0x2fdbadf3c4d5a8666bc06645b8358ab803996e28': 'UNIYFIWETH',
    '0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5': 'BPTWBTCWETH',
    '0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4': 'BPTBALWETH',
};

const zip = (a, b, decimal) => {
    var listOfuserWalletBalances = {}
    var decimals = 18;
    a.map((adata, key) => {
        decimals = decimal && (a.length - 1) != key ? decimal.userReservesData[key].reserve.decimals : 18
        let bal = (ethers.utils.formatUnits(b[key], decimals)).toString()
        listOfuserWalletBalances[adata.toLowerCase()] = bal
    })
    return listOfuserWalletBalances
}

const getReservesHumanized = (reservesRaw, poolBaseCurrencyRaw, chainId, lendingPoolAddressProvider) => {

    const reservesData = reservesRaw.map(
        reserveRaw => ({
            id: `${chainId}-${reserveRaw.underlyingAsset}-${lendingPoolAddressProvider}`.toLowerCase(),
            underlyingAsset: reserveRaw.underlyingAsset.toLowerCase(),
            name: reserveRaw.symbol,
            symbol: ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
                ? ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
                : reserveRaw.symbol,
            decimals: reserveRaw.decimals.toNumber(),
            baseLTVasCollateral: reserveRaw.baseLTVasCollateral.toString(),
            reserveLiquidationThreshold:
                reserveRaw.reserveLiquidationThreshold.toString(),
            reserveLiquidationBonus: reserveRaw.reserveLiquidationBonus.toString(),
            reserveFactor: reserveRaw.reserveFactor.toString(),
            usageAsCollateralEnabled: reserveRaw.usageAsCollateralEnabled,
            borrowingEnabled: reserveRaw.borrowingEnabled,
            stableBorrowRateEnabled: reserveRaw.stableBorrowRateEnabled,
            isActive: reserveRaw.isActive,
            isFrozen: reserveRaw.isFrozen,
            liquidityIndex: reserveRaw.liquidityIndex.toString(),
            variableBorrowIndex: reserveRaw.variableBorrowIndex.toString(),
            liquidityRate: reserveRaw.liquidityRate.toString(),
            variableBorrowRate: reserveRaw.variableBorrowRate.toString(),
            stableBorrowRate: reserveRaw.stableBorrowRate.toString(),
            lastUpdateTimestamp: reserveRaw.lastUpdateTimestamp,
            aTokenAddress: reserveRaw.aTokenAddress.toString(),
            stableDebtTokenAddress: reserveRaw.stableDebtTokenAddress.toString(),
            variableDebtTokenAddress:
                reserveRaw.variableDebtTokenAddress.toString(),
            creditTokensAddress:
                reserveRaw.creditTokensAddress.toString(),
            interestRateStrategyAddress:
                reserveRaw.interestRateStrategyAddress.toString(),
            availableLiquidity: reserveRaw.availableLiquidity.toString(),
            totalPrincipalStableDebt:
                reserveRaw.totalPrincipalStableDebt.toString(),
            averageStableRate: reserveRaw.averageStableRate.toString(),
            stableDebtLastUpdateTimestamp:
                reserveRaw.stableDebtLastUpdateTimestamp.toNumber(),
            totalScaledVariableDebt: reserveRaw.totalScaledVariableDebt.toString(),
            priceInMarketReferenceCurrency:
                reserveRaw.priceInMarketReferenceCurrency.toString(),
            variableRateSlope1: reserveRaw.variableRateSlope1.toString(),
            variableRateSlope2: reserveRaw.variableRateSlope2.toString(),
            stableRateSlope1: reserveRaw.stableRateSlope1.toString(),
            stableRateSlope2: reserveRaw.stableRateSlope2.toString(),
            // priceInMarketReferenceCurrency: 500000000,
            eModeCategoryId: 0,
            borrowCap: '10000000000000000000000000000000000000000000000000000000000000',
            supplyCap: '10000000000000000000000000000000000000000000000000000000000000',
            debtCeiling: '10000000000000000000000000000000000000000000000000000000000000',
            debtCeilingDecimals: 18,
            isolationModeTotalDebt: '1000000000000000000000000',
            eModeLtv: 0,
            eModeLiquidationThreshold: 0,
            eModeLiquidationBonus: 0,

        }),
    );

    const baseCurrencyData = {
        // this is to get the decimals from the unit so 1e18 = string length of 19 - 1 to get the number of 0
        marketReferenceCurrencyDecimals:
            poolBaseCurrencyRaw.marketReferenceCurrencyUnit.toString().length - 1,
        marketReferenceCurrencyPriceInUsd:
            poolBaseCurrencyRaw.marketReferenceCurrencyPriceInUsd.toString(),
        networkBaseTokenPriceInUsd:
            poolBaseCurrencyRaw.networkBaseTokenPriceInUsd.toString(),
        networkBaseTokenPriceDecimals:
            poolBaseCurrencyRaw.networkBaseTokenPriceDecimals,
    };

    return {
        reservesData,
        baseCurrencyData,
    };
}

export const loadReserveSummary = createAsyncThunk("account/loadReserveSummary", async (pro) => {
    let chainIdTemp = await pro.getNetwork()
    chainId = chainIdTemp.chainId
    UiPoolDataProvider_contract = new ethers.Contract(
        uipoolDataProvider_address,
        UiPoolDataProvider_abi.abi,
        pro
    )

    const getReservesDataTemp = await UiPoolDataProvider_contract.getReservesData(lendingPoolAddressProvider)
    const reserve = getReservesDataTemp[0]
    const base = getReservesDataTemp[1]
    console.log('reserve', getReservesDataTemp)

    const { reservesData, baseCurrencyData } = getReservesHumanized(reserve, base, chainId, lendingPoolAddressProvider);

    const currentTimestamp = dayjs().unix();
    let formattedPoolReserves = formatReserves({
        reserves: reservesData,
        currentTimestamp: currentTimestamp,
        marketReferenceCurrencyDecimals:
            baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });

    console.log("formattedPoolReserves:", formattedPoolReserves)
    return ({ reserveData: formattedPoolReserves })
})

export const loadUserSummary = createAsyncThunk("account/loadUserSummary", async (props) => {
    const { pro, addr } = props
    let chainIdTemp = await pro.getNetwork()
    chainId = chainIdTemp.chainId

    lendingPool_contract = new ethers.Contract(
        lendingPool_address,
        LendingPool_abi.abi,
        pro
    )

    UiPoolDataProvider_contract = new ethers.Contract(
        uipoolDataProvider_address,
        UiPoolDataProvider_abi.abi,
        pro
    )

    const getReservesDataTemp = await UiPoolDataProvider_contract.getReservesData(lendingPoolAddressProvider)
    const reserve = getReservesDataTemp[0]
    const base = getReservesDataTemp[1]

    const { reservesData, baseCurrencyData } = getReservesHumanized(reserve, base, chainId, lendingPoolAddressProvider);
    console.log("marketReferenceCurrencyPriceInUsd:", baseCurrencyData.marketReferenceCurrencyPriceInUsd.toString())
    console.log("networkBaseTokenPriceInUsd:", baseCurrencyData.networkBaseTokenPriceInUsd.toString())


    const currentTimestamp = dayjs().unix();
    let formattedPoolReserves = formatReserves({
        reserves: reservesData,
        currentTimestamp: currentTimestamp,
        marketReferenceCurrencyDecimals:
            baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });

    const userAccountData = await lendingPool_contract.getUserAccountData(addr)

    const userAccountDatawithCreditData = {
        availableBorrowsETH: userAccountData.availableBorrowsETH.toString(),
        currentLiquidationThreshold: userAccountData.currentLiquidationThreshold.toString(),
        healthFactor: ethers.utils.formatEther(userAccountData.healthFactor.toString()),
        ltv: userAccountData.ltv.toString(),
        totalCollateralETH: userAccountData.totalCollateralETH.toString(),
        totalCreditInEth: userAccountData.totalCreditInEth.toString(),
        totalDebtETH: userAccountData.totalDebtETH.toString(),
        availableBorrowsETHinUSD: normalizedToUsd((userAccountData.availableBorrowsETH), (baseCurrencyData.marketReferenceCurrencyPriceInUsd)),
        totalCollateralETHinUSD: normalizedToUsd((userAccountData.totalCollateralETH), (baseCurrencyData.marketReferenceCurrencyPriceInUsd)),
        totalDebtETHinUSD: normalizedToUsd((userAccountData.totalDebtETH), (baseCurrencyData.marketReferenceCurrencyPriceInUsd)),
        totalCreditInEthinUSD: normalizedToUsd((userAccountData.totalCreditInEth), (baseCurrencyData.marketReferenceCurrencyPriceInUsd)),
    }

    console.log("userAccountDatawithCreditData: ", userAccountDatawithCreditData)
    let userCreditBalanceZipped = {}
    let totalUserCreditBalance = 0.0
    let data = formattedPoolReserves ? await formattedPoolReserves.map(async (data, key) => {
        let creditTokensAddress = data.creditTokensAddress
        let CreditBalanceContract = CreditBalance(creditTokensAddress, pro)
        let creditBalanceValue = CreditBalanceContract ? await CreditBalanceContract.balanceOf(addr) : 0.0
        creditBalanceValue = parseFloat(ethers.utils.formatEther(creditBalanceValue))
        totalUserCreditBalance += creditBalanceValue * parseFloat(data.priceInUSD)
        creditBalanceValue = DigitsFormat(creditBalanceValue)
        userCreditBalanceZipped[data.underlyingAsset.toLowerCase()] = creditBalanceValue

    }) : ""

    console.log("userCreditBalanceZipped:", userCreditBalanceZipped)


    reserve_data = new UiPoolDataProvider({
        uiPoolDataProviderAddress: uipoolDataProvider_address,
        provider: pro,
        chainId: chainId
    })

    const { userReserves, userEmodeCategoryId } = await reserve_data.getUserReservesHumanized({
        lendingPoolAddressProvider,
        user: addr,
    });

    const userSummarytemp = formatUserSummary({
        currentTimestamp,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
            baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves: userReserves,
        formattedReserves: formattedPoolReserves,
        userEmodeCategoryId: userEmodeCategoryId,
    });

    console.log("userSummarytemp:", userSummarytemp)

    const userWalletProviderContract = new ethers.Contract(
        walletBalanceProviderAddress,
        walletBalanceProvider_abi.abi,
        pro
    )
    const userWalletBalances = await userWalletProviderContract.getUserWalletBalances(lendingPoolAddressProvider, addr)
    const userWalletBalancesReserves = userWalletBalances[0]
    const userWalletBalancesBalance = userWalletBalances[1]
    const userWalletBalancesZipped = zip(userWalletBalancesReserves, userWalletBalancesBalance, userSummarytemp)
    console.log("userWalletBalancesZipped: ", userWalletBalancesZipped, userWalletBalancesBalance.toString)

    let marketReferencePriceInUsdTemp = (baseCurrencyData.marketReferenceCurrencyPriceInUsd).toString()
    marketReferencePriceInUsdTemp = ethers.utils.formatUnits(marketReferencePriceInUsdTemp, 8)
    //const marketReferencePriceInUsdTemp = ethers.utils.formatUnits(baseCurrencyData.networkBaseTokenPriceInUsd, 8)
    console.log("decimals:", baseCurrencyData.networkBaseTokenPriceDecimals, "marketReferencePriceInUsdTemp:", marketReferencePriceInUsdTemp)
    return ({
        userSummary: userSummarytemp, userCreditBalance: userCreditBalanceZipped,
        totalUserCreditBalance: totalUserCreditBalance, userAccountDatawithCreditData: userAccountDatawithCreditData,
        marketReferencePriceInUsd: marketReferencePriceInUsdTemp,
        userWalletBalancesDictionary: userWalletBalancesZipped
    })

})


export const loadWalletSummary = createAsyncThunk("account/loadWalletSummary", async (props) => {
    return
})

const initialState = {
    reserveData: null,
    userSummary: null,
    userWalletBalancesDictionary: null,
    userCreditBalance: null,
    totalUserCreditBalance: null,
    userAccountDatawithCreditData: null,
    marketReferencePriceInUsd: null,
    loading: true
}

export const reserveSlice = createSlice({
    name: 'reserve',
    initialState,
    reducers: {
        setReserve: (state, action) => {
            state.reserveData = action.payload.reserveData
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadReserveSummary.pending, state => {
                state.loading = true;
            })
            .addCase(loadReserveSummary.fulfilled, (state, action) => {
                state.reserveData = action.payload.reserveData;
                state.loading = false;
            })
            .addCase(loadReserveSummary.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            /////////////////////////////////////////////////////////////////////////////////////////////////

            .addCase(loadUserSummary.pending, state => {
                state.loading = true;
            })
            .addCase(loadUserSummary.fulfilled, (state, action) => {
                state.userSummary = action.payload.userSummary;
                state.userCreditBalance = action.payload.userCreditBalance;
                state.totalUserCreditBalance = action.payload.totalUserCreditBalance
                state.userAccountDatawithCreditData = action.payload.userAccountDatawithCreditData
                state.marketReferencePriceInUsd = action.payload.marketReferencePriceInUsd
                state.userWalletBalancesDictionary = action.payload.userWalletBalancesDictionary;
                state.loading = false;
            })
            .addCase(loadUserSummary.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            /////////////////////////////////////////////////////////////////////////////////////////////////

            .addCase(loadWalletSummary.pending, state => {
                state.loading = true;
            })
            .addCase(loadWalletSummary.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(loadWalletSummary.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
    }
})

// Action creators are generated for each case reducer function
export const { setReserve } = reserveSlice.actions

export default reserveSlice.reducer