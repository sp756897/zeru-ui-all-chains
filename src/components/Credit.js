import { Col, Row } from 'antd'
import { Typography } from 'antd';
import React from 'react'
import CreditAssetTable from './CreditAssetTable';
import bitcoin from '../images/bitcoin.png'
import eth from '../images/eth.png'
import { useSelector } from 'react-redux';
import CurrencyFormater from "../helpers/CurrencyFormater"

const { Title } = Typography;

export default function Credit(provider) {

  const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

  const defaultTitle = () => <h2>Credit Assets</h2>;
  const totalCreditInEthinUSD = userAccountDatawithCreditData ? userAccountDatawithCreditData.totalCreditInEthinUSD : 0.0
  const currentLoanToValue = userAccountDatawithCreditData ? userAccountDatawithCreditData.ltv : 0.0


  return (
    <div className='creditdiv'>
      <Row className='credit-overview'>
        <img id='eth' src={eth} />
        <Col>
          <p className="color-dull font-size-0_5rem-bolder">Available Credit</p>

          <p className='color-white font-size-1_5rem-bolder'>$ {CurrencyFormater(totalCreditInEthinUSD, 2)}</p>
        </Col>
        <Col>
          <p className="color-dull font-size-0_5rem-bolder">Borrowable Credit</p>

          <p className='color-white font-size-1_5rem-bolder'>$ {CurrencyFormater(totalCreditInEthinUSD * currentLoanToValue * 0.0001, 2)}</p>
        </Col>
        <img id='bitcoin' src={bitcoin} />

      </Row>
      <Row className='credit-table-row' style={{ maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Col span={12} style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          <CreditAssetTable title={defaultTitle} provider={provider} />
        </Col>

      </Row>
    </div>
  )
}
