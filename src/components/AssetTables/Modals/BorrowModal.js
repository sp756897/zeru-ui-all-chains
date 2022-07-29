import { Button, Card, Col, Input, Modal, Row, Radio } from 'antd';
import { useEffect, useState } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { onBorrow } from '../../../actions/Borrow';
import { useDispatch } from 'react-redux';
import { RiGasStationFill } from 'react-icons/ri'
import { IoInfiniteSharp } from 'react-icons/io5'
import TransactionSuccess from '../../TransactionSuccess';
import TransactionFailed from '../../TransactionFailed';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { submitTransaction } from "../../../actions/SubmitTransaction";
import EstimateGas from '../../../actions/EstimateGas';
import { loadReserveSummary, loadUserSummary, loadWalletSummary } from '../../../store/slices/reserveSlice';
import { getMaxAmountAvailableToBorrow } from '../../../helpers/getMaxAmountAvailableToBorrow';
import { DigitsFormat } from '../../../helpers/DigitsFormat';

import { ethers } from 'ethers';
import AddTokenToWallet from '../../AddTokenToWallet';
import { valueToBigNumber, calculateHealthFactorFromBalancesBigUnits } from '@aave/math-utils';
import CurrencyFormater from "../../../helpers/CurrencyFormater"
import { BigNumber } from 'bignumber.js';
import { GetNewHealthFactorBorrow } from '../../../helpers/GetNewHealthFactorBorrow';


const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
        }}
        spin
    />
);

export default function BorrowModal(props) {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [amount, setAmount] = useState(0)
    const [gas, setGas] = useState()
    const [supplybuttontext, setSupplybuttontext] = useState("Enter Amount")
    const [disableappsupp, setdisableappsupp] = useState(true)
    const [isVariable, setVariable] = useState('Variable');
    const [isSuccess, setSuccess] = useState(false)
    const [disableSuccessOrFailureComp, setDisableSuccessOrFailureComp] = useState(true)
    const [afterHealthFactor, setAfterHealthFactor] = useState("")
    const [firstCheck, setfirstCheck] = useState(true)


    const dispatch = useDispatch();
    const user = useSelector((state) => state.account.address)
    const walletBalance = useSelector((state) => state.reserve.userWalletBalancesDictionary)
    const userAccountDatawithCreditData = useSelector((state) => state.reserve.userAccountDatawithCreditData)

    const asset = props.record.asset
    const reserve = props.record.reserve
    const availableLiquidityUSD = props.record.availableLiquidityUSD
    const availableBorrowsUSD = props.record.availableBorrowsUSD
    const totalDebtUSD = props.record.totalDebtUSD
    const borrowCapUSD = props.record.borrowCap
    const userWalletBalance = walletBalance ? walletBalance[reserve] : 0.00
    const balance = props.record.balance ? props.record.balance : 0.00
    const provider = props.provider
    const stableBorrowRateEnabled = props.record.stableBorrowRateEnabled
    const priceInUSD = parseFloat(props.record.priceInUSD)
    const availableBorrowswithCreditinUSD = userAccountDatawithCreditData ? (userAccountDatawithCreditData.availableBorrowsETHinUSD) : 0.0
    const availableBorrowswithCredit = userAccountDatawithCreditData ? userAccountDatawithCreditData.availableBorrowsETH : 0.0
    const formattedPriceInMarketReferenceCurrency = props.record.formattedPriceInMarketReferenceCurrency
    const formattedAvailableLiquidity = props.record.formattedAvailableLiquidity
    const totalBorrowsMarketReferenceCurrency = props.record.totalBorrowsMarketReferenceCurrency
    const totalCollateralMarketReferenceCurrency = props.record.totalCollateralMarketReferenceCurrency
    const currentLiquidationThreshold = props.record.currentLiquidationThreshold
    const healthFactor = CurrencyFormater(userAccountDatawithCreditData?.healthFactor, 2)
    const totalCreditInEth = userAccountDatawithCreditData ? ethers.utils.formatEther(userAccountDatawithCreditData.totalCreditInEth) : 0.0
    const realTotalCollateralMarketReferenceCurrency = valueToBigNumber(totalCollateralMarketReferenceCurrency).plus(valueToBigNumber(totalCreditInEth))

    const poolReserve = {
        formattedPriceInMarketReferenceCurrency: formattedPriceInMarketReferenceCurrency,
        formattedAvailableLiquidity: formattedAvailableLiquidity,
        availableLiquidityUSD: availableLiquidityUSD,
        totalDebtUSD: totalDebtUSD,
        borrowCapUSD: borrowCapUSD

    }
    const userInfo = {
        availableBorrowsETH: ethers.utils.formatEther(availableBorrowswithCredit),
        availableBorrowsUSD: availableBorrowsUSD,
        totalBorrowsMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency,

    }
    const [maxUserAmountToBorrow, setMaxUserAmountToBorrow] = useState(getMaxAmountAvailableToBorrow(poolReserve, userInfo, isVariable))
    let variableAPY = parseFloat(props.record.variableBorrowAPY).toFixed(2);
    let stableAPY = parseFloat(props.record.stableBorrowAPY).toFixed(2);

    if (stableAPY < 0.01) {
        stableAPY = "<0.01"
    }
    if (variableAPY < 0.01) {
        variableAPY = "<0.01"
    }

    let supplyt = "Borrow ";
    const title = supplyt.concat(asset);
    const btntype = props.btn;
    const css = { width: 180, textAlign: 'center', }

    const options = [
        {
            label: `Variable ${variableAPY}`,
            value: 'Variable',
            style: css,
        },
        {
            label: `Stable ${stableAPY}`,
            value: 'Stable',
            style: css
        },
    ];

    const showModal = () => {
        setVisible(true)
        setdisableappsupp(true)
        setSupplybuttontext("Enter Amount")
        setDisableSuccessOrFailureComp(true)
        setSuccess(false)
        let maxUserAmountToBorrowTemp = getMaxAmountAvailableToBorrow(poolReserve, userInfo, isVariable)
        setMaxUserAmountToBorrow(maxUserAmountToBorrowTemp)
    };

    const handleOk = async () => {

        if (provider.provider && amount.amount != "") {
            setLoading(true);

            const txs = await onBorrow(provider, amount, reserve, user, isVariable)
            try {
                await submitTransaction(provider.provider, txs)
                    .then(async (data) => {
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
        setAfterHealthFactor(null)
        setVisible(false);
    };

    const maxClick = async () => {
        let maxUserAmountToBorrowTemp = getMaxAmountAvailableToBorrow(poolReserve, userInfo, isVariable)
        setMaxUserAmountToBorrow(maxUserAmountToBorrowTemp)
        console.log("Max to borrow:", maxUserAmountToBorrowTemp.toString())
        let amountt = {
            amount: maxUserAmountToBorrowTemp
        }

        setAmount({ amount: maxUserAmountToBorrowTemp })

        if (amountt) {
            let newHealthFactor = GetNewHealthFactorBorrow(
                amountt,
                formattedPriceInMarketReferenceCurrency,
                totalCreditInEth,
                totalCollateralMarketReferenceCurrency,
                totalBorrowsMarketReferenceCurrency,
                currentLiquidationThreshold,
            )
            setAfterHealthFactor(newHealthFactor)

            setdisableappsupp(false)
            let supply = "Borrow ";
            let supplyAsset = supply.concat(asset);
            setSupplybuttontext(supplyAsset)
        }
        else {
            setdisableappsupp(true)
            setSupplybuttontext("Enter Amount")
        }

    }

    const onChange = async (e) => {

        let maxUserAmountToBorrowTemp = getMaxAmountAvailableToBorrow(poolReserve, userInfo, isVariable)
        setMaxUserAmountToBorrow(maxUserAmountToBorrowTemp)

        let amountt = {
            amount: e.target.value
        }
        setAmount({
            amount: e.target.value
        })

        if (parseFloat(e.target.value) < parseFloat(maxUserAmountToBorrow) || (parseFloat(maxUserAmountToBorrow) == 0.00)) {
            if (e.target.value) {

                let newHealthFactor = GetNewHealthFactorBorrow(
                    amountt,
                    formattedPriceInMarketReferenceCurrency,
                    totalCreditInEth,
                    totalCollateralMarketReferenceCurrency,
                    totalBorrowsMarketReferenceCurrency,
                    currentLiquidationThreshold,
                )
                setAfterHealthFactor(newHealthFactor)

                setfirstCheck(false)
                setdisableappsupp(false)
                let supply = "Borrow ";
                let supplyAsset = supply.concat(asset);
                setSupplybuttontext(supplyAsset)
            }
            else {
                setdisableappsupp(true)
                setSupplybuttontext("Enter Amount")
            }
        }
        else if (e.target.value !== "") {
            maxClick()
        }

    }

    const onChange4 = ({ target: { value } }) => {
        setVariable(value);
        let maxUserAmountToBorrowTemp = getMaxAmountAvailableToBorrow(poolReserve, userInfo, value)
        setMaxUserAmountToBorrow(maxUserAmountToBorrowTemp)
        console.log("in if out")
        if (amount) {
            if (parseFloat(amount.amount) > parseFloat(maxUserAmountToBorrowTemp)) {
                console.log("in if")
                setAmount({ amount: maxUserAmountToBorrowTemp })
            }
        }
    };

    useEffect(() => {
        async function estGas() {
            if (provider.provider && amount && amount.amount > 0) {
                const txs = await onBorrow(provider, amount, reserve, user, isVariable)
                let gast = await EstimateGas(txs)
                gast = parseFloat(gast).toFixed(2)
                setGas(gast)
            }
        }
        if (provider.provider && amount) {
            estGas()
        }
    }, [amount, isVariable])

    return (
        <div>
            <Button type={btntype} onClick={showModal}>
                Borrow
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
                                        <p className="color-little-bold-cement">Balance : {DigitsFormat(maxUserAmountToBorrow)}</p>
                                        <Button className='modal-below-input-div' size='small' type="text" onClick={maxClick}>MAX</Button>
                                    </Col>
                                </Row>

                            </Row>
                        </div>
                        {stableBorrowRateEnabled ? <div>
                            <p className='color-cement'>Borrow APY rate</p>
                            <div className="borrow-apy-selector">
                                <Radio.Group onChange={onChange4} options={options} value={isVariable} optionType="button" buttonStyle="solid" size='large' />
                            </div>
                        </div> : ""}
                        <br />
                        <div className='transaction-overview'>
                            <p className='color-cement'>Transaction Overview</p>
                            <div className='modal-transaction-overview-card'>
                                <Card >
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
