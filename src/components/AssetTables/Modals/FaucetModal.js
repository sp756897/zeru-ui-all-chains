import { Button, Card, Col, Input, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import TransactionSuccess from '../../TransactionSuccess';
import TransactionFailed from '../../TransactionFailed';
import { useDispatch } from 'react-redux';
import { RiGasStationFill } from 'react-icons/ri'
import CurrencyFormater from "../../../helpers/CurrencyFormater"
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from "@aave/math-utils"
import { BigNumber } from 'bignumber.js';
import { IoInfiniteSharp } from 'react-icons/io5'
import { DigitsFormat } from '../../../helpers/DigitsFormat';
import { ethers } from 'ethers';

import { onSupply } from '../../../actions/Supply';
import { submitTransaction } from "../../../actions/SubmitTransaction";
import EstimateGas from '../../../actions/EstimateGas';
import { onApprove } from '../../../actions/Approve';
import { isApproved } from '../../../actions/IsApproved';
import { loadReserveSummary, loadUserSummary, loadWalletSummary } from '../../../store/slices/reserveSlice';
import { getMaxAmountAvailableToSupply } from '../../../helpers/getMaxAmountAvailableToSupply';
import { GetNewHealthFactorSupply } from '../../../helpers/GetNewHealthFactorSupply';

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 15,
        }}
        spin
    />
);

export default function FaucetModal(props) {
    const [loading, setLoading] = useState(false);
    const [loadingApprove, setLoadingApprove] = useState(false);
    const [visible, setVisible] = useState(false);
    const [amount, setAmount] = useState('10,000')
    const [gas, setGas] = useState()
    const [supplybuttontext, setSupplybuttontext] = useState("get Faucet")
    const [isSuccess, setSuccess] = useState(false)
    const [disableSuccessOrFailureComp, setDisableSuccessOrFailureComp] = useState(true)
    const [isGas, setIsgas] = useState(true)
    const [afterHealthFactor, setAfterHealthFactor] = useState("")

    const dispatch = useDispatch();
    const user = useSelector((state) => state.account.address)
    const walletBalance = useSelector((state) => state.reserve.userWalletBalancesDictionary)
    const userSummary = useSelector((state) => state.reserve.userSummary)
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)
    const marketReferencePriceInUsd = useSelector((state) => state.reserve.marketReferencePriceInUsd)


    const asset = props.record.asset
    const reserve = props.record.reserve
    const balance = (walletBalance ? (walletBalance[reserve]) : 0.00)
    const provider = props.provider
    const priceInUSD = parseFloat(props.record.priceInUSD)
    const record = props.record.record
    const suppyAPY = props.record.apy
    const collateralization = props.record.collateralization
    const healthFactor = CurrencyFormater(userAccountDatawithCreditData?.healthFactor, 2)
    const totalBorrowsMarketReferenceCurrency = props.record.totalBorrowsMarketReferenceCurrency
    const totalCollateralMarketReferenceCurrency = props.record.totalCollateralMarketReferenceCurrency
    const currentLiquidationThreshold = props.record.currentLiquidationThreshold
    const formattedReserveLiquidationThreshold = props.record.formattedReserveLiquidationThreshold
    const totalCreditInEth = userAccountDatawithCreditData ? ethers.utils.formatEther(userAccountDatawithCreditData.totalCreditInEth) : 0.0
    const formattedPriceInMarketReferenceCurrency = props.record.formattedPriceInMarketReferenceCurrency
    const usageAsCollateralEnabledOnUser = props.record.usageAsCollateralEnabledOnUser
    const realTotalCollateralMarketReferenceCurrency = valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(valueToBigNumber(totalCreditInEth))
    const underlyingBalanceMarketReferenceCurrency = props.record.underlyingBalanceMarketReferenceCurrency

    let supplyt = "Faucet ";
    const title = supplyt.concat(asset);
    let approvedt = true
    const [maxUserAmountToBorrow, setMaxUserAmountToBorrow] = useState(getMaxAmountAvailableToSupply(balance, record, reserve))

    const showModal = () => {
        setVisible(true)
        setSupplybuttontext("get Faucet")
        setDisableSuccessOrFailureComp(true)
        setSuccess(false)
    };

    const handleOk = async () => {
        if (provider.provider && amount.amount != "") {
            setLoading(true);

            const txs = await onSupply(provider, amount, reserve, user)
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
                    })

            }
            catch (err) {
                console.log("false:", err)
                setDisableSuccessOrFailureComp(false)
            }
        }
    }

    const handleCancel = () => {
        setGas(null)
        setAfterHealthFactor(null)
        setVisible(false);
    };


    useEffect(() => {
        async function estGas() {
            if (provider.provider && amount && amount.amount > 0) {
                setIsgas(false)
                const txs = await onSupply(provider, amount, reserve, user)
                let gast = await EstimateGas(txs, marketReferencePriceInUsd)
                gast = parseFloat(gast).toFixed(2)
                setGas(gast)
            }
        }
        if (provider.provider && amount && amount.amount > 0) {
            estGas()
            setIsgas(true)
        }
    }, [amount])

    return (
        <div>
            <Button type={props.btn} onClick={showModal}>
                Faucet
            </Button>
            <Modal
                centered
                width={420}
                visible={visible}
                title={title}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    ,
                ]}
            >
                {disableSuccessOrFailureComp ? <div>

                    <div className='modalbody'>

                        <div className='input-div'>
                            <p className='color-cement'>Transaction overview</p>
                            <Row className='modal-input-flex-div'>
                                <Row className='align-input padding-more'>
                                    <Col className='col-left' >
                                        <p className='color-cement'>Amount</p>
                                    </Col>
                                    <Col className='col-right input-asset-name'>
                                        <h3 style={{ textAlign: 'right' }}>{amount} {asset}</h3>
                                    </Col>
                                </Row>
                            </Row>

                        </div>

                    </div>

                    <div className='gas-div flex-start'><RiGasStationFill size={20} style={{ marginBottom: '-5px' }} /> - $ {gas ? gas : ''}</div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>

                        {<Button style={{ border: 'none', height: '40px', width: '100%' }}
                            key="link"
                            // href="https://google.com"
                            type="primary"
                            loading={loading}
                            onClick={handleOk}
                        >
                            get Faucet
                        </Button>}
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