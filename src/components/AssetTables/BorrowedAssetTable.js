import React from 'react'
import { Space, Table, Dropdown, Menu, Typography } from 'antd';
import { Link } from 'react-router-dom';
import RepayModal from './Modals/RepayModal';
import BorrowModal from './Modals/BorrowModal';
import { useSelector } from 'react-redux';
import SwapInterestMode from '../SwapInterestMode';
import BorrowApyModal from './Modals/BorrowApyModal';
import { DigitsFormat } from '../../helpers/DigitsFormat';

export default function BorrowedAssetTable(props) {

    const userSummary = useSelector((state) => state.reserve.userSummary);
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

    const columns = [
        {
            title: props.titles.c1,
            dataIndex: 'asset',
            key: 'asset',
            width: '25%',
            render: (text, record) => {
                const asset = text.toLowerCase();
                return (
                    <div className='align-asset-name-image'>
                        <img height={25} width={25} src={require(`../../images/icons/tokens/${asset}.svg`)} style={{ marginRight: '10px' }} />
                        <Link to="/details" state={{ asset: text, record: record }}>{text}</Link>
                    </div>

                );
            },
            align: 'left'
        },
        {
            title: props.titles.c2,
            dataIndex: 'balance',
            key: 'balance',
            align: 'center'
        },
        {
            title: props.titles.c3,
            dataIndex: 'apy',
            key: 'apy',
            align: 'center',
            width: '20%'
        },
        {
            title: props.titles.c4,
            key: 'collateral',
            dataIndex: 'collateral',
            align: 'center',
            render: (_, record) => <BorrowApyModal record={record} provider={props.provider} />
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <RepayModal record={record} provider={props.provider} />
                    <BorrowModal btn="default" record={record} provider={props.provider} />
                </Space>
            ),
            align: 'center'
        },
    ];
    const defaultTitle = () => <h2>Borrowed Assets</h2>;

    const borrowAssetTableList = []
    const data = userSummary ? userSummary.userReservesData.map((data, key) => {
        if (data.totalBorrows > 0) {
            const borrowType = data.stableBorrows <= 0 ? "Variable" : "Stable"
            let selectedAPY = data.stableBorrows <= 0 ? data.reserve.variableBorrowAPY : data.stableBorrowAPY
            let APY = parseFloat(selectedAPY).toFixed(2)
            if (APY < 0.01) {
                APY = "< 0.01"
            }
            let stableBorrowAPY = parseFloat(data.reserve.stableBorrowAPY).toFixed(2)
            let variableBorrowAPY = parseFloat(data.reserve.variableBorrowAPY).toFixed(2)
            if (stableBorrowAPY < 0.01) {
                stableBorrowAPY = "< 0.01"
            }

            if (variableBorrowAPY < 0.01) {
                variableBorrowAPY = "< 0.01"
            }
            let balance = parseFloat(data.totalBorrows)
            balance = DigitsFormat(balance)
            let totalBorrowsUSD = data.totalBorrowsUSD
            let BalanceUSD = data.totalBorrowsUSD
            let availableBorrowsUSD = parseFloat(userSummary?.availableBorrowsUSD).toFixed(2)
            let usageAsCollateralEnabledOnUser = data.usageAsCollateralEnabledOnUser
            let totalCollateralUSD = userSummary?.totalCollateralUSD
            let currentLiquidationThreshold = parseFloat(userAccountDatawithCreditData?.currentLiquidationThreshold) * 0.0001

            borrowAssetTableList.push(
                {
                    key: key,
                    asset: data.reserve.name,
                    balance: balance,
                    apy: APY,
                    collateral: borrowType,
                    totalBorrowsUSD: totalBorrowsUSD,
                    BalanceUSD: BalanceUSD,
                    reserve: data.reserve.underlyingAsset,
                    stableBorrowRateEnabled: data.reserve.stableBorrowRateEnabled,
                    stableBorrows: data.stableBorrows,
                    variableBorrows: data.variableBorrows,
                    availableBorrowsUSD: availableBorrowsUSD,
                    unborrowedLiquidity: data.reserve.unborrowedLiquidity,
                    borrowType: borrowType,
                    stableBorrowAPY: stableBorrowAPY,
                    variableBorrowAPY: variableBorrowAPY,
                    usageAsCollateralEnabledOnUser: usageAsCollateralEnabledOnUser,
                    totalCollateralUSD: totalCollateralUSD,

                    //Asset_details parameters
                    totalLiquidityUSD: data.reserve.totalLiquidityUSD,
                    availableLiquidityUSD: data.reserve.availableLiquidityUSD,
                    priceInUSD: data.reserve.priceInUSD,
                    totalLiquidityUSD: data.reserve.totalLiquidityUSD,
                    supplyAPY: data.reserve.supplyAPY,
                    usageAsCollateralEnabled: data.reserve.usageAsCollateralEnabled,
                    stableBorrowRateEnabled: data.reserve.stableBorrowRateEnabled,
                    totalDebtUSD: data.reserve.totalDebtUSD,
                    variableBorrowAPY: data.reserve.variableBorrowAPY,
                    stableBorrowAPY: data.reserve.stableBorrowAPY,
                    formattedBaseLTVasCollateral: data.reserve.formattedBaseLTVasCollateral,
                    formattedReserveLiquidationThreshold: data.reserve.formattedReserveLiquidationThreshold,
                    formattedReserveLiquidationBonus: data.reserve.formattedReserveLiquidationBonus,
                    formattedAvailableLiquidity: data.reserve.formattedAvailableLiquidity,
                    formattedPriceInMarketReferenceCurrency: data.reserve.formattedPriceInMarketReferenceCurrency,
                    totalCollateralMarketReferenceCurrency: userSummary?.totalCollateralMarketReferenceCurrency,
                    totalBorrowsMarketReferenceCurrency: userSummary?.totalBorrowsMarketReferenceCurrency,
                    currentLiquidationThreshold: currentLiquidationThreshold,

                }
            )

        }
    }) : ""

    return (
        <div className='borrowedAssetTable'>
            <Table title={defaultTitle} columns={columns} dataSource={borrowAssetTableList} pagination={false} />
        </div>
    )
}
