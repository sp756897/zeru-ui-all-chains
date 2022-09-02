import React from 'react'
import { Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { CreditBalance } from './CreditBalance';
import CurrencyFormater from "../helpers/CurrencyFormater"
import { DigitsFormat } from '../helpers/DigitsFormat';

export default function CreditAssetTable(props) {
  const userSummary = useSelector((state) => state.reserve.userSummary)
  const user = useSelector((state) => state.account.address)
  const creditBalance = useSelector((state) => state.reserve.userCreditBalance)


  const columns = [
    {
      title: "Asset",
      dataIndex: 'asset',
      key: 'asset',
      render: (text, record) => {
        const asset = record.asset.toLowerCase();
        return (
          <div className='align-asset-name-image'>
            <img height={25} width={25} src={require(`../images/icons/tokens/${asset}.svg`)} style={{ marginRight: '10px' }} />
            {text}
          </div>

        );
      },
    },
    {
      title: "Credit Balance",
      dataIndex: 'credit',
      key: 'credit',
      align: 'center'
    },
    {
      title: "Balance in USD",
      dataIndex: 'balanceInUSD',
      key: 'balanceInUSD',
      align: 'center'
    },
  ];
  const creditTable = []

  const data = userSummary ? userSummary.userReservesData.map(async (data, key) => {

    let reserve = data.reserve.underlyingAsset
    let creditBalanceValue = creditBalance ? creditBalance[reserve] : 0.00

    // console.log("Balance Credit: ", creditBalance)

    if (data.reserve.isActive && creditBalanceValue > 0) {
      let asset = data.reserve.name
      let creditTokensAddress = data.reserve.creditTokensAddress
      let creditBalanceValueInUSD = creditBalanceValue * data.reserve.priceInUSD
      creditBalanceValueInUSD = "$" + DigitsFormat(creditBalanceValueInUSD)

      creditTable.push(
        {
          key: key,
          asset: asset,
          credit: creditBalanceValue,
          reserve: reserve,
          balanceInUSD: creditBalanceValueInUSD
        }
      )
    }
  }) : ""


  return (
    <div>
      <Table title={props.title} pagination={false} columns={columns} dataSource={creditTable} />
    </div>
  )
}
