import { Button, Card, Col, Input, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RiGasStationFill } from 'react-icons/ri'
import { Switch } from 'antd';
import TransactionFailed from '../../TransactionFailed';
import TransactionSuccess from '../../TransactionSuccess';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { IoInfiniteSharp } from 'react-icons/io5'
import { valueToBigNumber } from '@aave/math-utils';
import { ethers } from 'ethers';

import { LendingPool } from '@aave/contract-helpers';
import { submitTransaction } from "../../../actions/SubmitTransaction";
import deployed_contracts_address from "../../../deployed-contracts.json"
import { CollateralSwitchAction } from '../../../actions/CollateralSwitchAction';
import { loadReserveSummary, loadUserSummary, loadWalletSummary } from '../../../store/slices/reserveSlice';
import EstimateGas from '../../../actions/EstimateGas';
import { GetNewHealthFactorCollateralSwitch } from '../../../helpers/GetNewHealthFactorCollateralSwitch';
import CurrencyFormater from "../../../helpers/CurrencyFormater"

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
        }}
        spin
    />
);

export default function CollateralModal(props) {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isSuccess, setSuccess] = useState(false)
    const [disableSuccessOrFailureComp, setDisableSuccessOrFailureComp] = useState(true)
    const [checkIsDisabled, setCheckIsDisabled] = useState(!props.record.usageAsCollateralEnabled)
    const [gas, setGas] = useState()
    const [colModalOpen, setColModalOpen] = useState(false)
    const [afterHealthFactor, setAfterHealthFactor] = useState("")

    const dispatch = useDispatch()
    const user = useSelector((state) => state.account.address)
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

    const disableAsCollateral = "Disable " + props.record.asset + " as Collateral";
    const enableAsCollateral = "Enable " + props.record.asset + " as Collateral";
    const asset = props.record.asset;
    const reserve = props.record.reserve
    const provider = props.provider
    const isChecked = props.record.collateral
    const balance = props.record.balance
    const usageAsCollateralEnabledOnUser = props.record.collateral
    const totalCollateralMarketReferenceCurrency = props.record.totalCollateralMarketReferenceCurrency
    const underlyingBalanceMarketReferenceCurrency = props.record.underlyingBalanceMarketReferenceCurrency
    const totalBorrowsMarketReferenceCurrency = props.record.totalBorrowsMarketReferenceCurrency
    const currentLiquidationThreshold = props.record.currentLiquidationThreshold
    const healthFactor = CurrencyFormater(userAccountDatawithCreditData?.healthFactor, 2)
    const totalCreditInEth = userAccountDatawithCreditData ? ethers.utils.formatEther(userAccountDatawithCreditData.totalCreditInEth) : 0.0
    const realTotalCollateralMarketReferenceCurrency = valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(valueToBigNumber(totalCreditInEth))
    const formattedReserveLiquidationThreshold = props.record.formattedReserveLiquidationThreshold

    const onClick = async () => {
        let usageAsCollateral = isChecked ? false : true

        if (provider.provider) {
            setLoading(true)
            const txs = await CollateralSwitchAction(user, reserve, usageAsCollateral, provider)
            try {
                await submitTransaction(provider.provider, txs)
                    .then(async (data) => {
                        console.log(data)
                        if ((data) && (data.confirmations > 0)) {
                            setSuccess(true)
                            let disProps = { pro: provider.provider, addr: user }
                            dispatch(loadReserveSummary(provider.provider))
                            dispatch(loadUserSummary(disProps))
                            dispatch(loadWalletSummary(disProps))
                        }
                        setLoading(false)
                        setDisableSuccessOrFailureComp(false)

                    })
                    .catch((err) => {
                        console.log("error", err)
                        setDisableSuccessOrFailureComp(false)

                    })

            }
            catch (err) {
                console.log(err)
            }
        }
    }

    const showModal = () => {
        setVisible(true);
        setDisableSuccessOrFailureComp(true)
        setSuccess(false)
        setColModalOpen(true)
    };

    const handleCancel = () => {
        setGas(null)
        setVisible(false);
        setColModalOpen(false)

    };

    useEffect(() => {
        async function estGas() {
            console.log("colModalOpen: ", colModalOpen)
            let usageAsCollateral = isChecked ? false : true
            const txs = await CollateralSwitchAction(user, reserve, usageAsCollateral, provider)
            let gast = await EstimateGas(txs)
            gast = parseFloat(gast).toFixed(2)
            setGas(gast)
        }
        if (provider.provider && colModalOpen) {
            estGas()
            let newHealthFactor = GetNewHealthFactorCollateralSwitch(
                usageAsCollateralEnabledOnUser,
                totalCollateralMarketReferenceCurrency,
                underlyingBalanceMarketReferenceCurrency,
                totalBorrowsMarketReferenceCurrency,
                currentLiquidationThreshold,
                formattedReserveLiquidationThreshold,
                totalCreditInEth
            )
            setAfterHealthFactor(newHealthFactor)
        }
    }, [colModalOpen])


    return (
        <div>
            <Switch disabled={checkIsDisabled} checked={checkIsDisabled ? false : props.record.collateral} onChange={showModal} />
            <Modal
                centered
                width={420}
                visible={visible}
                title={isChecked ? disableAsCollateral : enableAsCollateral}
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
                                <Card>
                                    <Row className='padding'>
                                        <Col className='col-left'>
                                            Supply balance
                                        </Col>
                                        <Col className='col-right'>
                                            {balance} {asset}
                                        </Col>
                                    </Row>
                                    <Row className='padding'>
                                        <Col className='col-left'>
                                            Health Factor
                                        </Col>
                                        <Col className='col-right color-green flex-center'>
                                            {parseFloat(healthFactor) > 1e12 ? <IoInfiniteSharp size={18}></IoInfiniteSharp> : healthFactor}
                                            {afterHealthFactor ? afterHealthFactor == -1 ? <div className='flex-center'>→ <IoInfiniteSharp size={18}></IoInfiniteSharp> </div> : "→" + CurrencyFormater(parseFloat(afterHealthFactor), 2) : ""}                                        </Col>
                                    </Row>

                                </Card>
                            </div>

                        </div>

                    </div>
                    <div className='gas-div'><RiGasStationFill size='1rem' /> : {gas ? "$" + gas : ""}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                        <Button style={{ background: '#1c1f28', border: 'none', height: '40px', width: '100%' }}
                            key="link"
                            // href="https://google.com"
                            type="primary"
                            loading={loading}
                            onClick={onClick}
                        >

                            {isChecked ? disableAsCollateral : enableAsCollateral}
                        </Button>
                    </div>
                </div>
                    : ""}
                {disableSuccessOrFailureComp ? "" : (
                    isSuccess ? <TransactionSuccess func={handleCancel} /> :
                        <TransactionFailed func={handleCancel} />)
                }
            </Modal>
        </div>
    )
}
