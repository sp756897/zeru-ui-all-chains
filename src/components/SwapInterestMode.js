import React, { useState } from 'react'
import { Space, Table, Dropdown, Menu, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export default function SwapInterestMode(props) {

    const [visible, setVisible] = useState(false);

    const menu = (
        <Menu
            selectable
            defaultSelectedKeys={['variable']}
            items={[
                {
                    key: 'variable',
                    label: 'Variable',
                },
                {
                    key: 'stable',
                    label: 'Stable',
                },
            ]}
        />
    );

    const showModal = () => {
        setVisible(true);
    };

    return (
        <Dropdown overlay={menu} trigger={['click']} onClick={showModal}>
            <Typography.Link>
                <Space>
                    <DownOutlined />
                </Space>
            </Typography.Link>
        </Dropdown>
    )
}
