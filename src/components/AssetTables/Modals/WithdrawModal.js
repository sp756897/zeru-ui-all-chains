import { Button, Switch, Card, Col, Input, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import TransactionSuccess from '../../TransactionSuccess';
import TransactionFailed from '../../TransactionFailed';
import { useDispatch } from 'react-redux';
import { RiGasStationFill } from 'react-icons/ri'
import { IoInfiniteSharp } from 'react-icons/io5'

import { loadReserveSummary, loadUserSummary, loadWalletSummary } from '../../../store/slices/reserveSlice';
import { onWithdraw } from '../../../actions/Withdraw';
import { submitTransaction } from "../../../actions/SubmitTransaction";
import EstimateGas from '../../../actions/EstimateGas';
import { valueToBigNumber, calculateHealthFactorFromBalancesBigUnits } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { parse } from '@ethersproject/transactions';
import CurrencyFormater from "../../../helpers/CurrencyFormater"
import { ethers } from 'ethers';
import { DigitsFormat } from '../../../helpers/DigitsFormat';
import { GetNewHealthFactorWithdraw } from '../../../helpers/GetNewHealthFactorWithdraw';

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 18,
        }}
        spin
    />
);

export default function WithdrawModal(props) {
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
    const [afterHealthFactor, setAfterHealthFactor] = useState()
    const [withdrawMax, setWithdrawMax] = useState('');
    const [maxSelected, setMaxSelected] = useState('');

    const dispatch = useDispatch();
    const user = useSelector((state) => state.account.address)
    const walletBalance = useSelector((state) => state.reserve.userWalletBalancesDictionary)
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

    const asset = props.record.asset
    const reserve = props.record.reserve
    const balance = (walletBalance ? (walletBalance[reserve]) : 0.00)
    const provider = props.provider
    const priceInUSD = parseFloat(props.record.priceInUSD)

    let supplyt = "Withdraw ";
    const title = supplyt.concat(asset);
    const underlyingBalance = valueToBigNumber(props.record.balancePrecise || '0');
    const unborrowedLiquidity = valueToBigNumber(props.record.unborrowedLiquidity);
    let maxAmountToWithdraw = BigNumber.min(underlyingBalance, unborrowedLiquidity);
    let maxCollateralToWithdrawInETH = valueToBigNumber('0');
    const reserveLiquidationThreshold = props.record.formattedReserveLiquidationThreshold
    const totalBorrowsMarketReferenceCurrency = props.record.totalBorrowsMarketReferenceCurrency
    const totalCollateralMarketReferenceCurrency = props.record.totalCollateralMarketReferenceCurrency
    const currentLiquidationThreshold = props.record.currentLiquidationThreshold
    const healthFactor = CurrencyFormater(userAccountDatawithCreditData?.healthFactor, 2)
    const totalCreditInEth = userAccountDatawithCreditData ? ethers.utils.formatEther(userAccountDatawithCreditData.totalCreditInEth) : 0.0
    const collateral = props.record.collateral
    const usageAsCollateralEnabled = props.record.usageAsCollateralEnabled
    const formattedPriceInMarketReferenceCurrency = props.record.formattedPriceInMarketReferenceCurrency
    const realTotalCollateralMarketReferenceCurrency = valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(valueToBigNumber(totalCreditInEth))

    if (props.record?.collateral && props.record?.usageAsCollateralEnabled && props.record?.totalBorrowsMarketReferenceCurrency !== '0') {
        const excessHF = valueToBigNumber(props.record.healthFactor).minus('1.01');
        if (excessHF.gt('0')) {
            maxCollateralToWithdrawInETH = excessHF.multipliedBy(props.record.totalBorrowsMarketReferenceCurrency).div(reserveLiquidationThreshold);
        }
        maxAmountToWithdraw = BigNumber.min(maxAmountToWithdraw, maxCollateralToWithdrawInETH.dividedBy(props.record.formattedPriceInMarketReferenceCurrency)
        );
    }

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

            var amountt = {
                amount: withdrawMax
            }

            var realAmount = maxSelected ? amountt : amount
            console.log("realAmount:", realAmount)

            const txs = await onWithdraw(provider, realAmount, reserve, user)
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
    };

    const handleCancel = () => {
        setAmount(null)
        setGas(null)
        setVisible(false);
    };

    const maxClick = async () => {

        setMaxSelected(true)
        console.log("maxAmountToWithdraw: ", maxAmountToWithdraw.toString(), "underlyingBalance: ", underlyingBalance.toString())
        if (maxAmountToWithdraw.eq(underlyingBalance)) {
            setWithdrawMax('-1');
        } else {
            setWithdrawMax(maxAmountToWithdraw.toString(10));
        }

        console.log("withdrawMax: ", withdrawMax)

        let amountt = {
            amount: maxAmountToWithdraw
        }

        setAmount({ amount: maxAmountToWithdraw })

        if (amountt) {

            let newHealthFactor = GetNewHealthFactorWithdraw(
                amountt,
                totalCollateralMarketReferenceCurrency,
                currentLiquidationThreshold,
                healthFactor,
                collateral,
                usageAsCollateralEnabled,
                formattedPriceInMarketReferenceCurrency,
                totalCreditInEth,
                reserveLiquidationThreshold,
                totalBorrowsMarketReferenceCurrency
            )
            setAfterHealthFactor(newHealthFactor)

            let supply = "Withdraw ";
            let supplyAsset = supply.concat(asset);
            setSupplybuttontext(supplyAsset)
            setdisableappsupp(false)

        }
        else {
            setdisableappsupp(true)
            setSupplybuttontext("Enter Amount")
        }
    }


    const onChange = async (e) => {
        setMaxSelected(false)

        let amountt = {
            amount: e.target.value
        }

        setAmount({
            amount: e.target.value
        })

        if (parseFloat(e.target.value) < parseFloat(maxAmountToWithdraw)) {
            if (amountt) {

                let newHealthFactor = GetNewHealthFactorWithdraw(
                    amountt,
                    totalCollateralMarketReferenceCurrency,
                    currentLiquidationThreshold,
                    healthFactor,
                    collateral,
                    usageAsCollateralEnabled,
                    formattedPriceInMarketReferenceCurrency,
                    totalCreditInEth,
                    reserveLiquidationThreshold,
                    totalBorrowsMarketReferenceCurrency
                )
                setAfterHealthFactor(newHealthFactor)

                let supply = "Withdraw ";
                let supplyAsset = supply.concat(asset);
                setSupplybuttontext(supplyAsset)
                setdisableappsupp(false)

            }
            else {
                setdisableappsupp(true)
                setSupplybuttontext("Enter Amount")
            }
        }

        else if (e.target.value) {
            maxClick()
        }
    }


    useEffect(() => {
        async function estGas() {

            if (provider.provider && amount && amount.amount > 0) {
                const txs = await onWithdraw(provider, amount, reserve, user)
                let gast = await EstimateGas(txs)
                gast = parseFloat(gast).toFixed(2)
                setGas(gast)
            }
        }
        if (provider.provider && amount) {
            estGas()
            console.log("withdrawMax: ", withdrawMax)
            console.log("maxSelected: ", maxSelected)
        }
    }, [amount])

    return (
        <div>
            <Button type="primary" onClick={showModal}>
                Withdraw
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
                                        <p className="color-little-bold-cement">Balance : {DigitsFormat(maxAmountToWithdraw)}</p>
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
                                            Remaining Supply
                                        </Col>
                                        <Col className='col-right'>
                                            {parseFloat((maxAmountToWithdraw.toString()) - (amount ? amount.amount : 0)).toFixed(2)} {asset}
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
                        {<Button disabled={(disableappsupp)} style={{ border: 'none', height: '40px', width: '100%' }}
                            key="link"
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
