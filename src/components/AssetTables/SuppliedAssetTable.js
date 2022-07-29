import React from 'react'
import { Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import WithdrawModal from './Modals/WithdrawModal';
import SupplyModal from './Modals/SupplyModal';
import { useSelector } from 'react-redux';
import Checkswitch from '../Checkswitch';
import CollateralModal from './Modals/CollateralModal';
import { Skeleton } from 'antd';
import { DigitsFormat } from '../../helpers/DigitsFormat';

import { ethers } from 'ethers';
import { LendingPool } from '@aave/contract-helpers';
import { submitTransaction } from "../../actions/SubmitTransaction";

export default function SuppliedAssetTable(props) {

    const userSummary = useSelector((state) => state.reserve.userSummary);
    const user = useSelector((state) => state.account.address)
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

    const columns = [
        {
            title: props.titles.c1,
            dataIndex: 'asset',
            key: 'asset',
            render: (text, record) => {
                const asset = text.toLowerCase();
                return (
                    <div >
                        {userSummary ?
                            <div className='align-asset-name-image'>
                                <img height={25} width={25} src={require(`../../images/icons/tokens/${asset}.svg`)} style={{ marginRight: '10px' }} />


                                <Link to="/details" state={{ asset: text, record: record }}>{text}</Link>
                            </div> : <Skeleton active paragraph={{ rows: 0 }} style={{ width: '100px' }} />}


                    </div>

                );
            },
            align: 'left'
        },
        {
            title: props.titles.c2,
            dataIndex: 'balance',
            key: 'balance',
            align: 'right'
        },
        {
            title: props.titles.c3,
            dataIndex: 'apy',
            key: 'apy',
            align: 'center'
        },
        {
            title: props.titles.c4,
            key: 'collateral',
            dataIndex: 'collateral',
            align: 'center',
            render: (text, record) => (
                <CollateralModal record={record} provider={props.provider} />
            ),
        },
        {
            title: '',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <WithdrawModal record={record} provider={props.provider} />
                    <SupplyModal btn="default" record={record} provider={props.provider} />
                </Space>
            ),
            align: 'center'
        },
    ];

    const defaultTitle = () => <h2>Supplied Assets</h2>;

    const supplyAssetTableList = []
    const data = userSummary ? userSummary.userReservesData.map((data, key) => {
        if (data.underlyingBalance > 0) {
            let isUsedAsCollateral = data.usageAsCollateralEnabledOnUser
            let balance = data.underlyingBalance
            balance = DigitsFormat(balance)
            let balancePrecise = parseFloat(data.underlyingBalance)
            let balanceUSD = parseFloat(data.underlyingBalanceUSD).toFixed(2)
            let supplyAPY = parseFloat(data.reserve.supplyAPY).toFixed(2)
            let currentLiquidationThreshold = parseFloat(userAccountDatawithCreditData?.currentLiquidationThreshold) * 0.0001

            if (supplyAPY < 0.01) {
                supplyAPY = "< 0.01"
            }
            supplyAssetTableList.push(
                {
                    key: key,
                    asset: data.reserve.name,
                    balance: balance,
                    balancePrecise: balancePrecise,
                    apy: supplyAPY,
                    collateral: isUsedAsCollateral,
                    reserve: data.reserve.underlyingAsset,
                    balanceUSD: balanceUSD,
                    unborrowedLiquidity: data.reserve.unborrowedLiquidity,
                    healthFactor: userAccountDatawithCreditData?.healthFactor,
                    totalBorrowsMarketReferenceCurrency: userSummary?.totalBorrowsMarketReferenceCurrency,
                    underlyingBalanceMarketReferenceCurrency: data.underlyingBalanceMarketReferenceCurrency,
                    usageAsCollateralEnabledOnUser: data.usageAsCollateralEnabledOnUser,


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
                    formattedPriceInMarketReferenceCurrency: data.reserve.formattedPriceInMarketReferenceCurrency,
                    record: data.reserve,

                    //Transaction Overview
                    collateralization: data.reserve.usageAsCollateralEnabled,
                    totalCollateralMarketReferenceCurrency: userSummary?.totalCollateralMarketReferenceCurrency,
                    totalBorrowsMarketReferenceCurrency: userSummary?.totalBorrowsMarketReferenceCurrency,
                    currentLiquidationThreshold: currentLiquidationThreshold,
                    formattedPriceInMarketReferenceCurrency: data.reserve.formattedPriceInMarketReferenceCurrency,
                    formattedReserveLiquidationThreshold: data.reserve.formattedReserveLiquidationThreshold,

                }
            )
        }
    }) : ""

    return (
        <div className='suppliedAssetTable'>
            <Table title={defaultTitle} columns={columns} dataSource={supplyAssetTableList} pagination={false} />
        </div>
    )
}
