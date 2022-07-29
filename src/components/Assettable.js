import React from 'react'
import { Space, Table, Tag } from 'antd';


export default function Assettable(props) {
    const columns = [
        {
          title: props.titles.asset,
          dataIndex: 'asset',
          key: 'asset',
          render: (text) => <a>{text}</a>,
        },
        {
          title: "Balance",
          dataIndex: 'balance',
          key: 'balance',
        },
        {
          title: 'APY',
          dataIndex: 'apy',
          key: 'apy',
        },
        {
          title: 'Collateral',
          key: 'collateral',
          dataIndex: 'collateral',
        },
        {
          title: '',
          key: 'action',
          render: (_, record) => (
            <Space size="middle">
              <a>Supply</a>
              <a>Details</a>
            </Space>
          ),
        },
      ];
      const data = [
        {
          key: '1',
          asset: 'ETH',
          balance: 0,
          apy: '12%',
          collateral: 'yes',
        },
        {
            key: '2',
            asset: 'ETH',
            balance: 0,
            apy: '46%',
            collateral: 'yes',
        },
        {
            key: '3',
            asset: 'ETH',
            balance: 0,
            apy: '23%',
            collateral: 'yes',
        },
      ];
  return (
    <div>
        <Table columns={columns} dataSource={data} />
    </div>
  )
}
