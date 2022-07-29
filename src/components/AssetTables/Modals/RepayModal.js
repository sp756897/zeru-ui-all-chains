import { Button, Card, Col, Input, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { onRepay } from '../../../actions/Repay';
import TransactionSuccess from '../../TransactionSuccess';
import TransactionFailed from '../../TransactionFailed';
import { LoadingOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import CurrencyFormater from "../../../helpers/CurrencyFormater"
import { RiGasStationFill } from 'react-icons/ri'
import { IoInfiniteSharp } from 'react-icons/io5'

import { submitTransaction } from "../../../actions/SubmitTransaction";
import EstimateGas from '../../../actions/EstimateGas';
import { onApprove } from '../../../actions/Approve';
import { isApproved } from '../../../actions/IsApproved';
import { loadReserveSummary, loadUserSummary, loadWalletSummary } from '../../../store/slices/reserveSlice';
import { valueToBigNumber } from '@aave/math-utils';
import { ethers } from "ethers"
import { DigitsFormat } from '../../../helpers/DigitsFormat';
import { GetNewHealthFactorRepay } from '../../../helpers/GetNewHealthFactorRepay';

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
        }}
        spin
    />
);

export default function RepayModal(props) {
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
    const [maxSelected, setMaxSelected] = useState('');
    const [repayMax, setRepayMax] = useState('');
    const [afterHealthFactor, setAfterHealthFactor] = useState()

    const dispatch = useDispatch();
    const user = useSelector((state) => state.account.address)
    const walletBalance = useSelector((state) => state.reserve.userWalletBalancesDictionary)
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

    const asset = props.record.asset
    const reserve = props.record.reserve
    const balance = (walletBalance ? (walletBalance[reserve]) : 0.00)
    const provider = props.provider
    const priceInUSD = parseFloat(props.record.priceInUSD)
    const totalBorrowsMarketReferenceCurrency = props.record.totalBorrowsMarketReferenceCurrency
    const totalCollateralMarketReferenceCurrency = props.record.totalCollateralMarketReferenceCurrency
    const currentLiquidationThreshold = props.record.currentLiquidationThreshold
    const healthFactor = CurrencyFormater(userAccountDatawithCreditData?.healthFactor, 2)
    const totalCreditInEth = userAccountDatawithCreditData ? ethers.utils.formatEther(userAccountDatawithCreditData.totalCreditInEth) : 0.0
    const totalCreditInEthinUSD = userAccountDatawithCreditData ? (userAccountDatawithCreditData.totalCreditInEthinUSD) : 0.0

    const borrowType = props.record?.borrowType
    const stableBorrows = props.record?.stableBorrows
    const variableBorrows = props.record?.variableBorrows
    const debt = borrowType == "Stable" ? stableBorrows : variableBorrows;
    const safeAmountToRepayAll = (debt) * ('1.0025');
    const maxAmountToRepay = balance > debt ? debt : balance
    const totalBorrowsUSD = props.record.totalBorrowsUSD
    const usageAsCollateralEnabledOnUser = props.record.usageAsCollateralEnabledOnUser
    const totalCollateralUSD = props.record.totalCollateralUSD
    const formattedPriceInMarketReferenceCurrency = props.record.formattedPriceInMarketReferenceCurrency

    let supplyt = "Repay ";
    const title = supplyt.concat(asset);
    let approvedt = true
    const maxAmount = safeAmountToRepayAll < (balance) ? safeAmountToRepayAll.toString(10) : maxAmountToRepay.toString(10)


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
                amount: repayMax
            }

            var realAmount = maxSelected ? amountt : amount
            console.log("realAmount:", realAmount)

            const txs = await onRepay(provider, realAmount, reserve, user, borrowType)
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
        let amountt = {
            amount: maxAmount
        }

        setAmount({ amount: maxAmount })

        let maxAmountToRepay = valueToBigNumber(balance).gt(valueToBigNumber(debt)) ? debt : balance

        console.log("maxAmountToRepay: ", maxAmountToRepay, debt)

        //TODO
        if (false) {
            setRepayMax('-1');
        }
        else {
            setRepayMax(
                valueToBigNumber(safeAmountToRepayAll).lt(valueToBigNumber(balance))
                    ? safeAmountToRepayAll.toString(10)
                    : maxAmountToRepay.toString(10)
            );
        };

        if (amountt) {

            let newHealthFactor = GetNewHealthFactorRepay(
                amountt,
                totalBorrowsMarketReferenceCurrency,
                formattedPriceInMarketReferenceCurrency,
                usageAsCollateralEnabledOnUser,
                totalCollateralMarketReferenceCurrency,
                currentLiquidationThreshold,
                totalCreditInEth,
            )
            setAfterHealthFactor(newHealthFactor)
            console.log("NewHFRepay: ", newHealthFactor)

            let supply = "Repay ";
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
        setMaxSelected(false)
        let amountt = {
            amount: e.target.value
        }

        setAmount({
            amount: e.target.value
        })

        if (parseFloat(e.target.value) < parseFloat(maxAmount)) {

            if (e.target.value) {

                let newHealthFactor = GetNewHealthFactorRepay(
                    amountt,
                    totalBorrowsMarketReferenceCurrency,
                    formattedPriceInMarketReferenceCurrency,
                    usageAsCollateralEnabledOnUser,
                    totalCollateralMarketReferenceCurrency,
                    currentLiquidationThreshold,
                    totalCreditInEth,
                )
                setAfterHealthFactor(newHealthFactor)

                let supply = "Repay ";
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

    useEffect(() => {
        async function estGas() {

            if (provider.provider && amount && amount.amount > 0) {
                const txs = await onRepay(provider, amount, reserve, user, borrowType)
                let gast = await EstimateGas(txs)
                gast = parseFloat(gast).toFixed(2)
                setGas(gast)
            }
        }
        if (provider.provider && amount) {
            estGas()
        }
    }, [amount])

    return (
        <div>
            <Button type='primary' onClick={showModal}>
                Repay
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
                                            Remaining Debt
                                        </Col>
                                        <Col className='col-right'>
                                            {parseFloat(debt).toFixed(2)} {asset} → {parseFloat(debt ? debt - (amount ? amount.amount : 0) : 0) < 0 ? parseFloat(debt ? debt - (amount ? amount.amount : 0) + ((debt) * ('0.0025')) : 0).toFixed(2) : parseFloat(debt ? debt - (amount ? amount.amount : 0) : 0).toFixed(2)} {asset}
                                        </Col>
                                    </Row>
                                    <Row className='padding'>
                                        <Col className='col-left'>
                                            Health Factor
                                        </Col>
                                        <Col className='col-right color-green flex-center'>
                                            {parseFloat(healthFactor) > 1e12 ? <IoInfiniteSharp size={18}></IoInfiniteSharp> : healthFactor}
                                            {amount ? amount.amount !== "" ? afterHealthFactor ? afterHealthFactor == -1 ?
                                                <div className='flex-center'>→ <IoInfiniteSharp size={18}></IoInfiniteSharp> </div> : ((CurrencyFormater(parseFloat(afterHealthFactor), 2)) <= 0 ? <div className='flex-center'>→ <IoInfiniteSharp size={18}></IoInfiniteSharp> </div> : "→" + CurrencyFormater(parseFloat(afterHealthFactor), 2)) : "" : "" : ""}

                                        </Col>
                                    </Row>
                                    {/* <Row className='padding'>
                                        <Col className='col-left'>
                                            New Credit
                                        </Col>
                                        <Col className='col-right'>
                                            $ 12.98
                                        </Col>
                                    </Row> */}
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
