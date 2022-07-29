import React from 'react'
import { Button, Card, Col, Input, Modal, Row } from 'antd';
import { Space, Table, Dropdown, Menu, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import TransactionSuccess from '../../TransactionSuccess';
import TransactionFailed from '../../TransactionFailed';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { Select } from 'antd';
import { RiGasStationFill } from 'react-icons/ri'
import { useDispatch } from 'react-redux';

import { onSwapInterestMode } from "../../../actions/SwapInterestMode"
import { submitTransaction } from '../../../actions/SubmitTransaction';
import { loadReserveSummary, loadUserSummary, loadWalletSummary } from '../../../store/slices/reserveSlice';

const { Option } = Select;

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
        }}
        spin
    />
);

export default function BorrowApyModal(props) {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState(parseFloat(props.record.stableBorrows) <= 0 ? "Variable" : "Stable")
    const [selectedKey, setSelectedKey] = useState()
    const [goingToSelect, setGoingToSelect] = useState()
    const [isSuccess, setSuccess] = useState(false)
    const [disableSuccessOrFailureComp, setDisableSuccessOrFailureComp] = useState(true)
    const [gas, setGas] = useState()


    const user = useSelector((state) => state.account.address)
    const dispatch = useDispatch()

    const changeApyType = "Switch APY type";
    const switchRate = `Switch to ${selected} Rate`;
    const variableKey = "Variable"
    const stableKey = "Stable"

    const reserve = props.record.reserve
    const borrowType = props.record.borrowType
    const provider = props.provider
    const stableBorrowAPY = props.record.stableBorrowAPY
    const variableBorrowAPY = props.record.variableBorrowAPY


    const showModal = (key, event) => {
        if (event.value != borrowType) {
            setVisible(true);
            setSuccess(false)
            setDisableSuccessOrFailureComp(true)
            setSelectedKey(key)
            setGoingToSelect(event.value)
            console.log("event:", event, "borrowType:", borrowType)
            console.log("key:", key, "borrowType:", borrowType)

        }
    };

    const handleOk = async () => {
        if (provider.provider) {
            setLoading(true);

            const txs = await onSwapInterestMode(provider, reserve, user, borrowType)
            try {
                await submitTransaction(provider.provider, txs)
                    .then(async (data) => {
                        console.log(data)
                        if ((data) && (data.confirmations > 0)) {
                            setSuccess(true)
                            let disProps = { pro: provider.provider, addr: user }
                            await dispatch(loadReserveSummary(provider.provider))
                            await dispatch(loadUserSummary(disProps))
                            await dispatch(loadWalletSummary(disProps))
                            setSelected(selectedKey)
                        }
                        setLoading(false)
                        setDisableSuccessOrFailureComp(false)

                    })
                    .catch((err) => {
                        console.log("error", err)
                    })

            }
            catch (err) {
                console.log("false:", err)
                setDisableSuccessOrFailureComp(false)
            }
        }
    };

    const handleCancel = () => {
        setGas(null)
        setVisible(false);
    };


    const menu = (
        <Menu
            selectable
            defaultSelectedKeys={selected}
            value={selected}
            items={[
                {
                    key: 'Variable',
                    label: <a onClick={() => showModal(variableKey)} type='text'>Variable</a>,
                },
                {
                    key: 'Stable',
                    label: <a onClick={() => showModal(stableKey)} type='text'>Stable</a>,
                },
            ]}
        />
    );


    return (
        <div>
            <Select
                defaultValue={selected}
                bordered={false}
                onSelect={(value, event) => showModal(value, event)}
                value={selected}
            >
                <Option value="Variable" >Variable</Option>
                <Option value="Stable" >Stable</Option>
            </Select>

            <Modal
                centered
                width={420}
                visible={visible}
                title={changeApyType}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    ,
                ]}
            >
                {disableSuccessOrFailureComp ? <div>
                    <div className='modalbody'>

                        <div className='transaction-overview'>
                            <p className='color-cement'>Transaction Overview</p>
                            <div className='modal-transaction-overview-card'>
                                <Card >
                                    <Row className='padding'>
                                        <Col className='col-left'>
                                            New APY
                                        </Col>
                                        <Col className='col-right'>
                                            {selected} {selected == "Stable" ? parseFloat(stableBorrowAPY).toFixed(2) : parseFloat(variableBorrowAPY).toFixed(2)}%
                                        </Col>
                                    </Row>

                                </Card>
                            </div>

                        </div>

                    </div>

                    <div className='gas-div'><RiGasStationFill size='1rem' /> : $ 0.80 </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                        <Button style={{ background: '#1c1f28', border: 'none', height: '40px', width: '100%' }}
                            key="link"
                            // href="https://google.com"
                            type="primary"
                            loading={loading}
                            onClick={handleOk}
                        >

                            {switchRate}
                        </Button>
                    </div>
                </div> : ""}

                {disableSuccessOrFailureComp ? "" : (
                    isSuccess ? <TransactionSuccess func={handleCancel} /> :
                        <TransactionFailed func={handleCancel} />)
                }

            </Modal>
        </div>
    )
}
