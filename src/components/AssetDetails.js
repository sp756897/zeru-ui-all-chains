import { Row, Col, Card, Button, Divider } from 'antd'
import React from 'react'
import { useLocation } from 'react-router-dom'
import '../styles/AssetDetails.css'
import { Link } from 'react-router-dom'
import CurrencyFormater from "../helpers/CurrencyFormater"
import ScrollToTopOnMount from './ScrollToTopOnMount'

export default function AssetDetails() {
  const location = useLocation()
  const { record } = location.state
  const assetImg = record.asset.toLowerCase();

  const asset = record.asset
  const totalLiquidityUSD = CurrencyFormater(record.totalLiquidityUSD, 2)
  const availableLiquidityUSD = CurrencyFormater(record.availableLiquidityUSD, 2)
  const priceInUSD = CurrencyFormater(record.priceInUSD, 2)
  const formattedBaseLTVasCollateral = (record.formattedBaseLTVasCollateral * 100).toFixed(2)
  const formattedReserveLiquidationThreshold = (record.formattedReserveLiquidationThreshold * 100).toFixed(2)
  const formattedReserveLiquidationBonus = (record.formattedReserveLiquidationBonus * 100).toFixed(2)
  const totalDebtUSD = CurrencyFormater(record.totalDebtUSD, 2)
  const supplyAPYTemp = parseFloat(record.supplyAPY)
  const supplyAPY = supplyAPYTemp > 0.01 ? supplyAPYTemp.toFixed(2) : "< 0.01"
  const variableBorrowAPYTemp = parseFloat(record.variableBorrowAPY)
  const stableBorrowAPYTemp = parseFloat(record.stableBorrowAPY)
  const variableBorrowAPY = variableBorrowAPYTemp > 0.01 ? variableBorrowAPYTemp.toFixed(2) : "< 0.01"
  const stableBorrowAPY = stableBorrowAPYTemp > 0.01 ? stableBorrowAPYTemp.toFixed(2) : "< 0.01"
  const usageAsCollateralEnabled = record.usageAsCollateralEnabled ? "Yes" : "No"

  return (
    <div className='assetdetails'>
      <ScrollToTopOnMount/>
      <Row className='overallview' >
        <Button type='primary' style={{ alignItems: "start" }}><Link to="/" >Go Back</Link></Button>
        <Col span={4}>
          <Row>

            <Col className='col-right center'>
              <img src={require(`../images/icons/tokens/${assetImg}.svg`)} height={55} width={55} />
            </Col>
            <Col className='col-left center font-size-2rem' >
              {asset}

            </Col>
          </Row>

        </Col>

        <Col span={4} >
          <p className="color-dull font-size-1rem">Reserve Size</p>

          <p className='color-white font-size-2rem'>$ {totalLiquidityUSD}</p>
        </Col>
        <Col span={4}>
          <p className="color-dull font-size-1rem"> Available Liquidity</p>


          <p className='color-white font-size-2rem'>$ {availableLiquidityUSD}</p>

        </Col>
        <Col span={4}>
          <p className="color-dull font-size-1rem"> Oracle price</p>

          <p className='color-white font-size-2rem'>$ {priceInUSD}</p>


        </Col>
      </Row>
      <Row className='asset-more-details'>
        <Card className='card-style-asset-details' >
          <Row className='supplyrow'>

            <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
              <div>
                <p className='font-size-1_5rem-bolder'>Supply Info</p>
              </div>
              <div>
                <p className='color-cement font-size-1rem-bolder'>Total Supplied</p>
                <p className='font-size-2rem'>$ {totalLiquidityUSD}</p>
              </div>
              <div>
                <p className='color-cement font-size-1rem-bolder'>APY</p>
                <p className='font-size-2rem'>{supplyAPY} %</p>
              </div>
            </Row>
            <Divider />
            <Row className='collateralusage' >
              <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%', textAlign: 'left' }}>
                <div><p className='font-size-1_5rem-bolder'>Collateral usage</p></div>
                <div><p className='color-cement font-size-1rem-bolder'>can be collateral?</p>
                  <p className='color-green font-size-1rem-bolder'>{usageAsCollateralEnabled}</p>
                </div>
                <div></div>
              </Row>

              <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%', textAlign: 'left' }}>
                <Card className='shadows'>
                  <p className='color-dull font-size-1rem-bolder'>MAX LTV</p>
                  <p className='color-black font-size-2rem'>{formattedBaseLTVasCollateral}%</p>
                </Card>
                <Card className='shadows'>
                  <p className='color-dull font-size-1rem-bolder'>liquidation threshold</p>
                  <p className='color-black font-size-2rem'> {formattedReserveLiquidationThreshold}%</p>
                </Card>
                <Card className='shadows'>
                  <p className='color-dull font-size-1rem-bolder'>Liquidation penalty</p>
                  <p className='color-black font-size-2rem'>{formattedReserveLiquidationBonus}%</p>

                </Card>
              </Row>
            </Row>
          </Row>

          <Divider />
          <Row className='borrowinfo' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%', textAlign: 'left' }}>
            <div>
              <p className='font-size-1_5rem-bolder'>Borrow Info</p>
            </div>
            <div>
              <p className='color-cement font-size-1rem-bolder'>Total Borrowed</p>
              <p className='font-size-2rem'>$ {totalDebtUSD}</p>
            </div>
            <div>
              <p className='color-cement font-size-1rem-bolder'>APY variable</p>
              <p className='font-size-2rem'>{variableBorrowAPY}%</p>
            </div>
            <div>
              <p className='color-cement font-size-1rem-bolder'>APY stable</p>
              <p className='font-size-2rem'> {stableBorrowAPY}%</p>
            </div>

          </Row>
        </Card>
      </Row>

    </div>
  )
}
