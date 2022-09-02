import { Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { Progress } from 'antd';
import { useSelector } from 'react-redux'
import { IoInfiniteSharp } from 'react-icons/io5'
import { Link } from 'react-router-dom'

import BorrowAssetTable from './AssetTables/BorrowAssetTable'
import BorrowedAssetTable from './AssetTables/BorrowedAssetTable'
import SuppliedAssetTable from './AssetTables/SuppliedAssetTable'
import SupplyAssetTable from './AssetTables/SupplyAssetTable'
import CurrencyFormater from "../helpers/CurrencyFormater"
import { CalculateNetAPY } from './CalculateNetAPY'

const suppliedtable = { c1: 'Assets', c2: 'Balance', c3: 'APY', c4: 'Collateral' }
const supplytable = { c1: 'Assets', c2: 'Wallet Balance', c3: 'APY', c4: 'Can be collateral' }
const borrowedtable = { c1: 'Assets', c2: 'Debt', c3: 'APY', c4: 'APY type' }
const borrowtable = { c1: 'Assets', c2: 'Available', c3: 'APY,Variable', c4: 'APY,Stable' }

export default function Markets(provider) {

    const [percent, setPercent] = useState(0)

    const user = useSelector((state) => state.account.address)
    const userSummary = useSelector((state) => state.reserve.userSummary)
    const totalUserCreditBalance = useSelector((state) => state.reserve.totalUserCreditBalance)
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)
    const marketReferencePriceInUsd = useSelector((state) => state.reserve.marketReferencePriceInUsd)

    const netAPY = CalculateNetAPY()
    const healthFactor = userAccountDatawithCreditData ? (parseFloat(userAccountDatawithCreditData.healthFactor)) : -1
    const currentLoanToValue = userAccountDatawithCreditData ? parseFloat(userAccountDatawithCreditData.ltv) / 10000 : 0
    const totalUserCreditBalanceValue = totalUserCreditBalance ? CurrencyFormater(totalUserCreditBalance, 2) : 0
    const availableBorrowswithCredit = userAccountDatawithCreditData ? userAccountDatawithCreditData.availableBorrowsETH : 0.0
    const totalDebtETH = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalDebtETH : 0.0
    const totalCreditInEth = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalCreditInEth : 0.0
    const totalCollateralETH = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalCollateralETH : 0.0

    const availableBorrowsUSD = userSummary ? parseFloat(userSummary.availableBorrowsUSD) : 0
    const totalCollateralUSD = userSummary ? parseFloat(userSummary.totalCollateralUSD) : 0
    const availableBorrowswithCreditinUSD = userAccountDatawithCreditData ? (userAccountDatawithCreditData.availableBorrowsETHinUSD) : 0.0
    const totalDebtETHinUSD = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalDebtETHinUSD : 0.0
    const totalCollateralETHinUSD = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalCollateralETHinUSD : 0.0
    const totalCreditInEthinUSD = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalCreditInEthinUSD : 0.0
    const borrowLimit = '$ ' + (userAccountDatawithCreditData ? CurrencyFormater(parseFloat(availableBorrowswithCreditinUSD), 2) : 0.0)

    useEffect(() => {
        updateBorrowLimit()
        return () => {
        };
    }, [userSummary])

    const updateBorrowLimit = () => {
        let totalBorrowable = (parseFloat(totalCollateralETHinUSD) + parseFloat(totalCreditInEthinUSD)) * parseFloat(currentLoanToValue)
        let Borrowed = (totalBorrowable - parseFloat(totalDebtETHinUSD))
        let percentTemp = ((Borrowed / totalBorrowable)) * 100
        percentTemp = parseFloat(100 - percentTemp)
        // console.log("percent: ", percentTemp, "totalSupplyUSD: ", totalBorrowable, "leftToBorrowUSD:", Borrowed, "totalDebtETH", totalDebtETHinUSD, "currentLoanToValue:", currentLoanToValue)
        setPercent(percentTemp);
    }

    return (
        <div className='markets' id='markets'>

            <div className='market-overview-container'>
                <div className='markets-overview'>

                    <Row className='markets-details'>
                        <Col>
                            <Link to="/credit"><p className='color-dull font-size-0_5rem-bolder'>Credit Balance</p></Link>
                            <Link to="/credit"><p className='color-white font-size-1_5rem-bolder'> ${CurrencyFormater(totalUserCreditBalance, 2)}</p></Link>
                        </Col>

                        <Col span={4}>
                            <p className="color-dull font-size-0_5rem-bolder">  Supply Balance</p>

                            <p className='color-white font-size-1_5rem-bolder'>{userSummary ? "$" + CurrencyFormater(userSummary.totalLiquidityUSD, 2) : "$0"} </p>
                        </Col>
                        <Col span={4}>
                            <div className="net-apy-wrapper">
                                <div className="net-apy">
                                    <svg className='svg' viewBox="0 0 140 140" width="100%">
                                        <path className='path1' d="M 70 70 L  70 0 A 70 70 0 0 1 70 0 Z" stroke="transparent" fill="#00d395"></path>
                                        <path className='path2' d="M 70 70 L  70 0 A 70 70 0 1 1 69.99956017702848 1.381744718642608e-9 Z" stroke="transparent" fill="#00d395"></path>
                                        <defs>
                                            <linearGradient id="MyGradient" x2="0.35" y2="1">
                                                <stop offset="15%" stopColor="#da00d9" />
                                                <stop offset="85%" stopColor="#2151fe" />

                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className='rotator-div'>

                                </div>
                                <div className="net-apy-description">

                                    <p className='color-dull font-size-0_5rem-bolder'>Net APY</p>
                                    <div className="color-white font-size-1_5rem-bolder">{netAPY ? netAPY : 0}%</div>

                                </div>

                            </div>


                        </Col>
                        <Col span={4}>
                            <p className="color-dull font-size-0_5rem-bolder"> Borrow Balance</p>

                            <p className='color-white font-size-1_5rem-bolder'>{userSummary ? "$" + CurrencyFormater(userSummary.totalBorrowsUSD, 2) : "$0"} </p>
                        </Col>
                        <Col>
                            <p className='color-dull font-size-0_5rem-bolder'>Health Factor</p>
                            <p className='color-green font-size-1_5rem-bolder'> {totalDebtETH > 0 ? CurrencyFormater(healthFactor, 2) : <IoInfiniteSharp size={24}></IoInfiniteSharp>} </p>
                        </Col>

                    </Row>

                    <Row style={{ padding: '50px 200px 40px 200px' }}>
                        <p className='color-dull font-size-1rem-bolder'>Borrow Limit</p>
                        <Progress type='line' strokeColor={"linear-gradient(150deg,#da00d9,#2151fe)"} percent={percent} format={() => borrowLimit} strokeWidth={3} />
                    </Row>

                </div>

            </div>




            <Row className='markets-asset-table-container' gutter={[32, 24]} style={{ padding: '0 40px 40px 40px', fontFamily: 'Inter', maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}>
                {/* <button onClick={onClick}>
                    Click me to deposit
                </button> */}
                <Col span={12}>
                    <SuppliedAssetTable titles={suppliedtable} provider={provider} />
                </Col>
                <Col span={12} >
                    <BorrowedAssetTable titles={borrowedtable} provider={provider} />
                </Col>
                <Col span={12} >
                    <SupplyAssetTable titles={supplytable} provider={provider} />
                </Col>
                <Col span={12} >
                    <BorrowAssetTable titles={borrowtable} provider={provider} />
                </Col>
            </Row>
        </div>
    )
}
