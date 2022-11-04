import React from 'react'
import { Button, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import SupplyModal from './Modals/SupplyModal';
import { useSelector } from 'react-redux';
import { ethers } from "ethers"
import { DigitsFormat } from '../../helpers/DigitsFormat';
import { BsBoxArrowUpRight } from 'react-icons/bs'

import { ChainIdsToNetwork } from '../../helpers/ChainIds';

export default function SupplyAssetTable(props) {

    const userWalletBalancesDictionary = useSelector((state) => state.reserve.userWalletBalancesDictionary);
    const userSummary = useSelector((state) => state.reserve.userSummary);
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)
    const titles = props.titles;
    // console.log('titles:',titles)
    const provider = props.provider;
    // console.log('provider:',provider)

    const columns = [
        {
            title: props.titles.c1,
            dataIndex: 'asset',
            key: 'asset',
            width: '20%',
            render: (text, record) => {
                const asset = text.toLowerCase();
                return (
                    <div className='align-asset-name-image'>
                        <img height={25} width={25} src={require(`../../images/icons/tokens/${asset}.svg`)} style={{ marginRight: '10px' }} />
                        <Link to="/details" state={{ asset: text, record: record }}>{text}</Link>
                    </div>

                );
            }
            ,
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
            align: 'center',
            width: '15%'
        },
        {
            title: props.titles.c4,
            key: 'collateral',
            dataIndex: 'collateral',
            align: 'center'
        },
        {
            title: '',
            key: 'action',
            render: (text, record) => (
                <Space size="middle" >
                    <SupplyModal btn="primary" record={record} provider={props.provider} />
                    <Button><Link to="/details" state={{ asset: 'ETH', record: record }}>details</Link></Button>
                </Space>
            ),
            align: 'center'
        },
    ];

    const defaultTitle = () => {
        // console.log("provider: ", provider)
        // const realProvider = provider.provider
        // let chainIdTemp = await realProvider.getNetwork()
        // console.log("chainIdTemp: ", chainIdTemp)
        // let chainId = chainIdTemp.chainId
        // const chainName = ChainIdsToNetwork(chainId)

        return (
            <div>
                <h2>Supply Assets</h2>
                {
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Link to="/faucet" state={{ titles: titles, provider: provider }} >Faucet <BsBoxArrowUpRight size={12} /></Link>
                    </div>}
            </div>
        )
    }

    const supplyAssetTableList = []
    const data = userSummary ? userSummary.userReservesData.map((data, key) => {

        if (data.reserve.isActive) {
            let isCollateral = data.reserve.usageAsCollateralEnabled ? "Yes" : "No"
            let supplyAPY = parseFloat(data.reserve.supplyAPY).toFixed(2)
            if (supplyAPY < 0.01) {
                supplyAPY = "< 0.01"
            }
            let asset = data.reserve.underlyingAsset
            let currentLiquidationThreshold = parseFloat(userAccountDatawithCreditData?.currentLiquidationThreshold) * 0.0001
            let balanceValue = userWalletBalancesDictionary ? userWalletBalancesDictionary[asset] : 0
            balanceValue = DigitsFormat(balanceValue)

            supplyAssetTableList.push(
                {
                    key: key,
                    asset: data.reserve.name,
                    balance: balanceValue,
                    apy: supplyAPY,
                    collateral: isCollateral,
                    reserve: data.reserve.underlyingAsset,
                    unborrowedLiquidity: data.reserve.unborrowedLiquidity,
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
                    record: data.reserve,

                    //Transaction Overview
                    collateralization: data.reserve.usageAsCollateralEnabled,
                    healthFactor: userAccountDatawithCreditData?.healthFactor,
                    totalCollateralMarketReferenceCurrency: userSummary?.totalCollateralMarketReferenceCurrency,
                    totalBorrowsMarketReferenceCurrency: userSummary?.totalBorrowsMarketReferenceCurrency,
                    currentLiquidationThreshold: currentLiquidationThreshold,
                    formattedPriceInMarketReferenceCurrency: data.reserve.formattedPriceInMarketReferenceCurrency,
                    formattedReserveLiquidationThreshold: data.reserve.formattedReserveLiquidationThreshold,
                    underlyingBalanceMarketReferenceCurrency: data.underlyingBalanceMarketReferenceCurrency,

                }
            )
        }
    }) : ""

    return (
        <div className='supplyAssetTable'>
            <Table title={defaultTitle} columns={columns} dataSource={supplyAssetTableList} pagination={false} />
        </div>
    )
}
