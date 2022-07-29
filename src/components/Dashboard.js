import { Avatar, Button, Col, Divider, message, Row, Space } from 'antd'
import React from 'react'
import arrow from '../images/arrow.png'
import { MdContentCopy } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CurrencyFormater from "../helpers/CurrencyFormater"
import { CalculateNetAPY } from './CalculateNetAPY'
import { CalculateSuppyandBorrowAPY } from './CalculateSuppyandBorrowAPY'
import { CalculateSuppyandBorrowInterest } from './CalculateSuppyandBorrowInterest'
import { normalizedToUsd } from '../helpers/NormalizeToUSD'
import { ethers } from 'ethers'
import Blockies from 'react-blockies'


export default function Dashboard(props) {

  const userSummary = useSelector((state) => state.reserve.userSummary)
  const totalUserCreditBalance = useSelector((state) => state.reserve.totalUserCreditBalance)
  const user = useSelector((state) => state.account.address)
  const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

  const netAPY = CalculateNetAPY();
  const suppyAndBorrowAPY = CalculateSuppyandBorrowAPY()
  const suppyAndBorrowInterest = CalculateSuppyandBorrowInterest()
  const totalDebtETH = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalDebtETH : 0.0

  const healthFactor = userAccountDatawithCreditData ? CurrencyFormater(parseFloat(userAccountDatawithCreditData.healthFactor), 2) : -1
  const currentLoanToValue = userAccountDatawithCreditData ? userAccountDatawithCreditData.ltv : 0
  const totalUserCreditBalanceTemp = totalUserCreditBalance ? CurrencyFormater(parseFloat(totalUserCreditBalance), 2) : 0
  const totalLiquidityUSD = userSummary ? "$" + CurrencyFormater(userSummary.totalLiquidityUSD, 2) : "$0"
  const totalBorrowsUSD = userSummary ? "$" + CurrencyFormater(userSummary.totalBorrowsUSD, 2) : "$0"
  const NetSupplyBalanceTemp = parseFloat(userSummary?.totalLiquidityUSD) + parseFloat(totalUserCreditBalance)
  const NetSupplyBalance = NetSupplyBalanceTemp ? CurrencyFormater(parseFloat(NetSupplyBalanceTemp), 2) : 0
  const positiveProportionTemp = suppyAndBorrowInterest?.positiveProportion
  const negativeProportionTemp = suppyAndBorrowInterest?.negativeProportion
  const TotalBorrowBalanceTemp = parseFloat(userSummary?.totalBorrowsUSD) + parseFloat(negativeProportionTemp)
  const TotalBorrowBalance = TotalBorrowBalanceTemp ? CurrencyFormater(parseFloat(TotalBorrowBalanceTemp), 2) : 0
  const TotalSupplyBalanceTemp = parseFloat(userSummary?.totalLiquidityUSD) + parseFloat(positiveProportionTemp)
  const TotalSupplyBalance = TotalSupplyBalanceTemp ? CurrencyFormater(parseFloat(TotalSupplyBalanceTemp), 2) : 0
  const borrowableCredit = CurrencyFormater(parseFloat(totalUserCreditBalance * currentLoanToValue * 0.0001), 2)
  console.log(currentLoanToValue, totalUserCreditBalance)

  const copysuccess = () => {
    message.success('Address Copied');
  };

  let wrapperFunction = () => {
    navigator.clipboard.writeText(user);
    copysuccess();
  }

  return (
    <div className='dashboard'>
      <div className='account-overview-container'>
        <Row className='account-overview' style={{ maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Row className='width100'>
            <img id='arrow' src={arrow} />
          </Row>
          <Row className='account-overview'>
            <Col className='userimg'>
              <Blockies
                seed={user}
                size={10}
                scale={12}
                color="#1ae"
                bgColor="#ffe"
                spotColor="#abc"
                className="identicon"
              />
            </Col>
            <Col className='user-detail'>
              <Row className='flex-end'>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Wallet Address
                  </p>
                </Col>
                <Col>
                  <p className='font-size-0_5rem-bolder color-dull'>
                    Current Network :
                    <span className='font-size-0_5rem-bolder color-white '>
                      {props.network}
                    </span>
                  </p>
                </Col>
              </Row>

              <p className='font-size-1_5rem color-white '>

                {user}
                <a onClick={wrapperFunction}>
                  <MdContentCopy color='#547586' size='0.8em' />
                </a>

              </p>
              <br />
              <br />
              <Row className='flex-even'>
                <Col>
                  <Link to="/credit">
                    <p className='color-dull font-size-0_5rem-bolder'>
                      Credit Balance
                    </p>
                  </Link>
                  <Link to="/credit">
                    <p className='color-white  font-size-1_5rem-bolder'>
                      ${totalUserCreditBalanceTemp}
                    </p>
                  </Link>
                </Col>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Borrowable credit
                  </p>
                  <p className='color-white  font-size-1_5rem-bolder'>
                    ${borrowableCredit}
                  </p>
                </Col>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>

                    Health Factor
                  </p>
                  <p className='color-green font-size-1_5rem-bolder'>
                    {totalDebtETH > 0 ? healthFactor : 0}
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>

        </Row>
      </div>

      <div className='account-details-container' style={{ maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Row className='account-details'>
          <p className='color-black font-size-1_5rem-bolder'>
            Overview
          </p>
          <Row className='flex-end width100'>
            <Col span={6} className='flex-center width100'>
              <p className='color-black font-size-0_5rem-bolder'>
                Supply details
              </p>
            </Col>
            <Col className='width100' span={18}>
              <Row className='flex-even'>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Supplied
                  </p>
                  <p className='color-black  font-size-1_5rem-bolder'>
                    {totalLiquidityUSD}
                  </p>
                </Col>
                <p className='font-size-2rem color-dull'>
                  +
                </p>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Supply Interest
                  </p>
                  <p className='color-black  font-size-1_5rem-bolder'>
                    ${CurrencyFormater(suppyAndBorrowInterest?.positiveProportion, 2)}
                  </p>
                </Col>
                <p className='font-size-2rem color-dull'>
                  =
                </p>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Total Supply
                  </p>
                  <p className='color-black  font-size-1_5rem-bolder'>
                    {TotalSupplyBalance}
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          <Row className='flex-end width100'>
            <Col span={6} className='flex-center width100'>
              <p className='color-black font-size-0_5rem-bolder'>
                Net Supply details
              </p>
            </Col>
            <Col className='width100' span={18}>
              <Row className='flex-even'>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Total Supplied
                  </p>
                  <p className='color-black  font-size-1_5rem-bolder'>
                    {totalLiquidityUSD}
                  </p>
                </Col>
                <p className='font-size-2rem color-dull'>
                  +
                </p>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Credit Balance
                  </p>
                  <p className='color-black  font-size-1_5rem-bolder'>
                    ${totalUserCreditBalanceTemp}
                  </p>
                </Col>
                <p className='font-size-2rem color-dull'>
                  =
                </p>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>
                    Net Supply
                  </p>
                  <p className='color-black  font-size-1_5rem-bolder'>
                    ${NetSupplyBalance}
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          <Row className='flex-end width100'>
            <Col span={6} className='flex-center width100'>
              <p className='color-black font-size-0_5rem-bolder'>Borrow details</p>
            </Col>
            <Col className='width100' span={18}>
              <Row className='flex-even'>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>Total Borrowed</p>
                  <p className='color-black  font-size-1_5rem-bolder'> {totalBorrowsUSD} </p>
                </Col>
                <p className='font-size-2rem color-dull'>+</p>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>Borrow Interest</p>
                  <p className='color-black  font-size-1_5rem-bolder'> ${CurrencyFormater(suppyAndBorrowInterest?.negativeProportion, 2)}</p>
                </Col>
                <p className='font-size-2rem color-dull'>=</p>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>Total Borrowed</p>
                  <p className='color-black  font-size-1_5rem-bolder'> {TotalBorrowBalance} </p>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          <Row className='flex-end width100'>
            <Col span={6} className='flex-center width100'>
              <p className='color-black font-size-0_5rem-bolder'>APY details</p>
            </Col>
            <Col className='width100' span={18}>
              <Row className='flex-even'>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>Supply APY</p>
                  <p className='color-black  font-size-1_5rem-bolder'> {suppyAndBorrowAPY?.suppyAPY}% </p>
                </Col>

                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>Borrow APY</p>
                  <p className='color-black  font-size-1_5rem-bolder'> {suppyAndBorrowAPY ? suppyAndBorrowAPY.borrowAPY : 0}%</p>
                </Col>
                <Col>
                  <p className='color-dull font-size-0_5rem-bolder'>Net APY</p>
                  <p className='color-black  font-size-1_5rem-bolder'> {netAPY ? netAPY : 0}% </p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Row>
      </div>

    </div>
  )
}
