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

export default function SupplyModal(props) {
    const [loading, setLoading] = useState(false);
    const [loadingApprove, setLoadingApprove] = useState(false);
    const [visible, setVisible] = useState(false);
    const [amount, setAmount] = useState()
    const [gas, setGas] = useState()
    const [approved, setApproved] = useState(false)
    const [supplybuttontext, setSupplybuttontext] = useState("Enter Amount")
    const [disableappsupp, setdisableappsupp] = useState(true)
    const [disableapprove, setdisableapprove] = useState(true)
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

    let supplyt = "Supply ";
    const title = supplyt.concat(asset);
    let approvedt = true
    const [maxUserAmountToBorrow, setMaxUserAmountToBorrow] = useState(getMaxAmountAvailableToSupply(balance, record, reserve))

    const showModal = () => {
        setVisible(true)
        setdisableappsupp(true)
        setSupplybuttontext("Enter Amount")
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
        setAmount(null)
        setGas(null)
        setAfterHealthFactor(null)
        setVisible(false);
    };

    const maxClick = async () => {
        let maxUserAmountToBorrowTemp = getMaxAmountAvailableToSupply(balance, record, reserve)
        setMaxUserAmountToBorrow(maxUserAmountToBorrowTemp)

        let amountt = {
            amount: maxUserAmountToBorrowTemp
        }

        setAmount({ amount: maxUserAmountToBorrowTemp })

        if (amountt) {
            let newHealthFactor = GetNewHealthFactorSupply(
                user,
                amountt,
                formattedPriceInMarketReferenceCurrency,
                totalCreditInEth,
                totalCollateralMarketReferenceCurrency,
                currentLiquidationThreshold,
                formattedReserveLiquidationThreshold,
                totalBorrowsMarketReferenceCurrency,
                collateralization,
                usageAsCollateralEnabledOnUser,
                underlyingBalanceMarketReferenceCurrency
            )

            setAfterHealthFactor(newHealthFactor)

            let supply = "Supply ";
            let supplyAsset = supply.concat(asset);
            setSupplybuttontext(supplyAsset)

            if (amountt && amountt.amount > 0 && provider.provider) {
                approvedt = await isApproved(provider, reserve, user, amountt)
            }

            if (approvedt) {
                setdisableappsupp(false)
            }

            setApproved(approvedt)
            setdisableapprove(false)
        }
        else {
            setdisableapprove(true)
            setdisableappsupp(true)
            setSupplybuttontext("Enter Amount")
        }
    }


    const onChange = async (e) => {

        let maxUserAmountToBorrowTemp = getMaxAmountAvailableToSupply(balance, record, reserve)
        setMaxUserAmountToBorrow(maxUserAmountToBorrowTemp)

        let amountt = {
            amount: e.target.value
        }

        setAmount({
            amount: e.target.value
        })

        if (parseFloat(e.target.value) < parseFloat(maxUserAmountToBorrow) || parseFloat(maxUserAmountToBorrow) == 0.00) {
            console.log("in change")

            if (e.target.value) {

                let newHealthFactor = GetNewHealthFactorSupply(
                    user,
                    amountt,
                    formattedPriceInMarketReferenceCurrency,
                    totalCreditInEth,
                    totalCollateralMarketReferenceCurrency,
                    currentLiquidationThreshold,
                    formattedReserveLiquidationThreshold,
                    totalBorrowsMarketReferenceCurrency,
                    collateralization,
                    usageAsCollateralEnabledOnUser,
                    underlyingBalanceMarketReferenceCurrency
                )

                setAfterHealthFactor(newHealthFactor)

                let supply = "Supply ";
                let supplyAsset = supply.concat(asset);
                setSupplybuttontext(supplyAsset)

                if (amountt && amountt.amount > 0 && provider.provider) {
                    approvedt = await isApproved(provider, reserve, user, amountt)
                }

                if (approvedt) {
                    setdisableappsupp(false)
                }

                setApproved(approvedt)
                setdisableapprove(false)
            }
            else {
                setdisableapprove(true)
                setdisableappsupp(true)
                setSupplybuttontext("Enter Amount")
            }
        }

        else if (e.target.value) {
            maxClick()
        }
    }

    const Approve = async () => {
        setLoadingApprove(true);

        const txs = await onApprove(provider, reserve, user)
        try {
            await submitTransaction(provider.provider, txs)
                .then((data) => {
                    setLoadingApprove(false)
                    setApproved(true)
                    setdisableapprove(true)
                    setdisableappsupp(false)

                })
                .catch((err) => {
                    console.log("err:", err)
                })
        }
        catch (err) {
            console.log(err)
        }

    }

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
                Supply
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
                            <p className='color-cement'>Amount</p>
                            <Row className='modal-input-flex-div'>

                                <Row className='align-input'>
                                    <Col className='col-left' >
                                        <Input className='input' placeholder='0.00' bordered={false} onChange={onChange} value={amount ? amount.amount : ""} inputMode='numeric' />
                                    </Col>
                                    <Col className='col-right input-asset-name'>
                                        <h3 style={{ textAlign: 'right' }}>{asset}</h3>
                                    </Col>
                                </Row>
                                <Row style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Col className='col-left'>
                                        <p className='modal-p-below-input color-light-cement'>${amount && amount.amount !== "" ? DigitsFormat((parseFloat(amount.amount) * priceInUSD)) : 0.0}</p>
                                    </Col>
                                    <Col className='col-right flex-last'>
                                        <p className="color-little-bold-cement">Balance : {DigitsFormat(balance)}</p>
                                        <Button className='modal-below-input-div' size='small' type="text" onClick={maxClick}>MAX</Button>
                                    </Col>
                                </Row>
                            </Row>

                        </div>
                        <div className='transaction-overview'>
                            <p className='color-cement'>Transaction Overview</p>
                            <div className='modal-transaction-overview-card'>
                                <Card >
                                    <Row className='padding'>
                                        <Col className='col-left'>
                                            Supply APY
                                        </Col>
                                        <Col className='col-right'>
                                            {suppyAPY}%
                                        </Col>
                                    </Row>
                                    <Row className='padding'>
                                        <Col className='col-left'>
                                            Collateralization
                                        </Col>
                                        <Col className='col-right'>
                                            {collateralization ? "Enabled" : "Not Enabled"}
                                        </Col>
                                    </Row>
                                    <Row className='padding'>
                                        <Col className='col-left'>
                                            Health Factor
                                        </Col>
                                        <Col className='col-right color-green flex-center'>
                                            {parseFloat(healthFactor) > 1e12 ? <IoInfiniteSharp size={18}></IoInfiniteSharp> : healthFactor}
                                            {amount ? amount.amount !== "" ? afterHealthFactor ? afterHealthFactor == -1 ?
                                                <div className='flex-center'>→ <IoInfiniteSharp size={18}></IoInfiniteSharp> </div> : "→" + CurrencyFormater(parseFloat(afterHealthFactor), 2) : "" : "" : ""}
                                        </Col>
                                    </Row>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className='gas-div flex-start'><RiGasStationFill size={20} style={{ marginBottom: '-5px' }} /> - $ {gas ? gas : ''}</div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                        {((approved) || (disableapprove)) ? "" : <Button disabled={(disableapprove)} style={{ background: '#1c1f28', border: 'none', height: '40px', width: '100%' }}
                            key="submit" type="primary" loading={loadingApprove} onClick={Approve}>
                            Approve to continue
                        </Button>}
                        {<Button disabled={(disableappsupp)} style={{ border: 'none', height: '40px', width: '100%' }}
                            key="link"
                            // href="https://google.com"
                            type="primary"
                            loading={loading}
                            onClick={handleOk}
                        >
                            {supplybuttontext}
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
