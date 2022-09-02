import React from 'react'
import { Button, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import BorrowModal from './Modals/BorrowModal';
import { useSelector } from 'react-redux';
import { getMaxAmountAvailableToBorrow } from '../../helpers/getMaxAmountAvailableToBorrow';
import { ethers } from 'ethers';
import { DigitsFormat } from '../../helpers/DigitsFormat';

export default function BorrowAssetTable(props) {

    const userSummary = useSelector((state) => state.reserve.userSummary);
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

    const columns = [
        {
            title: props.titles.c1,
            dataIndex: 'asset',
            key: 'asset',
            render: (text, record) => {
                const asset = text.toLowerCase();
                return (
                    <div className='align-asset-name-image'>
                        <img height={25} width={25} src={require(`../../images/icons/tokens/${asset}.svg`)} style={{ marginRight: '10px' }} />
                        <Link to="/details" state={{ asset: text, record: record }}>{text}</Link>
                    </div>

                );
            },
            align: 'left',
        },
        {
            title: props.titles.c2,
            dataIndex: 'balance',
            key: 'balance',
            align: 'right',
            width: '5%',
            className: 'column-title',
        },
        {
            title: props.titles.c3,
            dataIndex: 'apy',
            key: 'apy',
            align: 'center',
            width: '5%',
            className: 'column-title',
        },
        {
            title: props.titles.c4,
            key: 'collateral',
            dataIndex: 'collateral',
            align: 'center',
            width: '5%',

        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <BorrowModal btn="primary" record={record} provider={props.provider} />
                    <Button><Link to="/details" state={{ asset: "ETH" }}>details</Link></Button>
                </Space>
            ),
            align: 'center'
        },
    ];

    const defaultTitle = () => <h2>Borrow Assets</h2>;

    const borrowAssetTableList = []
    const data = userSummary ? userSummary.userReservesData.map((data, key) => {
        if (data.reserve.isActive && data.reserve.borrowingEnabled) {
            let stableBorrowAPY = parseFloat(data.reserve.stableBorrowAPY).toFixed(2)
            let variableBorrowAPY = parseFloat(data.reserve.variableBorrowAPY).toFixed(2)
            let availableBalance = parseFloat(userSummary.availableBorrowsUSD) / parseFloat(data.reserve.priceInUSD)
            const availableBorrowswithCredit = userAccountDatawithCreditData.availableBorrowsETH
            let currentLiquidationThreshold = parseFloat(userAccountDatawithCreditData?.currentLiquidationThreshold) * 0.0001

            const poolReserve = {
                formattedPriceInMarketReferenceCurrency: data.reserve.formattedPriceInMarketReferenceCurrency,
                formattedAvailableLiquidity: data.reserve.formattedAvailableLiquidity,
                availableLiquidityUSD: data.reserve.availableLiquidityUSD,
                totalDebtUSD: data.reserve.totalDebtUSD,
                borrowCapUSD: data.reserve.borrowCap

            }
            const userInfo = {
                availableBorrowsETH: ethers.utils.formatEther(availableBorrowswithCredit),
                availableBorrowsUSD: userAccountDatawithCreditData.availableBorrowsETHinUSD,
                totalBorrowsMarketReferenceCurrency: userSummary?.totalBorrowsMarketReferenceCurrency,
            }

            let availableBorrowsUSD = parseFloat(getMaxAmountAvailableToBorrow(poolReserve, userInfo, "Variable"))
            availableBorrowsUSD = DigitsFormat(availableBorrowsUSD)
            // console.log("availableBorrowsUSD:", availableBorrowsUSD)

            if (stableBorrowAPY < 0.01) {
                stableBorrowAPY = "< 0.01"
            }

            if (variableBorrowAPY < 0.01) {
                variableBorrowAPY = "< 0.01"
            }

            borrowAssetTableList.push(
                {
                    key: key,
                    asset: data.reserve.name,
                    balance: availableBorrowsUSD,
                    apy: variableBorrowAPY,
                    collateral: stableBorrowAPY,
                    reserve: data.reserve.underlyingAsset,
                    stableBorrowRateEnabled: data.reserve.stableBorrowRateEnabled,
                    availableBorrowsUSD: userAccountDatawithCreditData.availableBorrowsETHinUSD,
                    unborrowedLiquidity: data.reserve.unborrowedLiquidity,

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
                    borrowCap: data.reserve.borrowCap,
                    isInIsolationMode: userSummary?.isInIsolationMode,
                    isolatedReserve: userSummary?.isolatedReserve
                }
            )
        }
    }) : ""

    return (
        <div className='borrowAssetTable'>
            <Table title={defaultTitle} columns={columns} dataSource={borrowAssetTableList} pagination={false} />
        </div>
    )
}
