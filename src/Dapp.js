import React, { useEffect, useState, useCallback } from "react";
import Web3ModalSetup from "./helpers/Web3ModalSetup"
import Account from "./components/Account"
import ThemeSwitcher from "./components/ThemeSwitch";
import Address from "./components/Address";
import { useSelector, useDispatch, connect } from "react-redux"
import { setAddress, setUserSummary, setUserBalances } from "./store/slices/accountSlice";
import { setReserve } from "./store/slices/reserveSlice";
import AssetDetails from "./components/AssetDetails";
import './styles/color.css'
import './styles/navbar.css'
import logo from './images/logo.png'
import name from './images/name.png'
import { Button, Divider, Layout, Switch } from 'antd';
import { Tabs } from 'antd';
import Staking from "./components/Staking";
import Credit from "./components/Credit";
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { BrowserRouter as Router, NavLink, Route, Routes } from "react-router-dom";
import 'antd/dist/antd.css';
import { shortenAddress } from "./helpers/ShortenAddress";
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Space } from 'antd';
import { message } from 'antd';
import { CopyOutlined, ExportOutlined, SettingFilled } from '@ant-design/icons';
import { Select } from 'antd';
import Blockies from 'react-blockies';
import { BsBoxArrowUpRight } from 'react-icons/bs'
import { MdContentCopy } from 'react-icons/md'



import deployed_contracts_address from "./deployed-contracts.json"
import UiPoolDataProvider_abi from "./artifacts/contracts/misc/UiPoolDataProviderV2.sol/UiPoolDataProviderV2.json"
import walletBalanceProvider_abi from "./artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
import { UiPoolDataProvider, WalletBalanceProvider } from "@aave/contract-helpers"
import { formatReserves, formatUserSummary } from '@aave/math-utils';
import dayjs from 'dayjs';
import { loadReserveSummary, loadUserSummary, loadWalletSummary } from "./store/slices/reserveSlice";
import Markets from "./components/Markets";
import Dashboard from "./components/Dashboard";
import TestnetWarning from "./components/TestnetWarning";
import Faucet from "./components/Faucet";

const { Option } = Select;

const { TabPane } = Tabs;
const { Header, Footer, Content } = Layout;

const { ethers } = require("ethers");

const web3Modal = Web3ModalSetup();

const copysuccess = () => {
    message.success('Address Copied');
};



export default function Dapp() {

    const dispatch = useDispatch();
    const address = useSelector((state) => state.account.address);
    const userSummary = useSelector((state) => state.account.userSummary);
    const userWalletBalancesDictionary = useSelector((state) => state.account.userWalletBalancesDictionary);
    const reserveData = useSelector((state) => state.reserve.reserveData);

    const [currentNetwork, setCurrentNetwork] = useState("");
    const [visible, setVisible] = useState(false);


    const handleVisibleChange = (flag) => {
        setVisible(flag);
    };

    const [injectedProvider, setInjectedProvider] = useState()

    const zip = (a, b) => {
        var listOfuserWalletBalances = {}
        a.map((adata, key) => {
            let bal = parseFloat(ethers.utils.formatEther(b[key])).toFixed(2)
            listOfuserWalletBalances[adata.toLowerCase()] = bal
        })
        return listOfuserWalletBalances
    }

    const logoutOfWeb3Modal = async () => {
        await web3Modal.clearCachedProvider();
        if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
            await injectedProvider.provider.disconnect();
        }
        setTimeout(() => {
            window.location.reload();
        }, 1);
    };

    const loadWeb3Modal = useCallback(async () => {
        let provider = null
        let addr = null
        let pro = null
        let chainId = null
        let signer_temp = null
        let chainData = null
        let disProps = null

        try {
            provider = await web3Modal.connect();
            pro = new ethers.providers.Web3Provider(provider);
            await pro.send("eth_requestAccounts", []);
            signer_temp = pro.getSigner();
            addr = await signer_temp.getAddress()
            chainData = await pro.getNetwork()
            chainId = chainData.chainId
            if (chainData.name == "unknown") {
                setCurrentNetwork("Ganache")
            } else {
                setCurrentNetwork(chainData.name)
            }

        }
        catch (err) {
            console.log("Error in loadWeb3Modal web3Modal connect: ", err)
        }

        try {
            setInjectedProvider(pro)
            dispatch(setAddress({ address: addr }))
        }
        catch (err) {
            console.log("Error in Dispatch and setInjectedProvider: ", err)
        }

        try {
            disProps = { pro: pro, addr: addr }
            await dispatch(loadReserveSummary(pro))
            await dispatch(loadUserSummary(disProps))
            await dispatch(loadWalletSummary(disProps))
        }
        catch (err) {
            console.log("Error in loadWeb3Modal getPoolDatawithFormatHumanised: ", err)
        }

        provider.on("chainChanged", async (chainId) => {
            console.log(`chain changed to ${chainId}! updating providers`);
            pro = new ethers.providers.Web3Provider(provider);
            setInjectedProvider(pro)

            try {
                disProps = { pro: pro, addr: addr }
                await dispatch(loadReserveSummary(pro))
                await dispatch(loadUserSummary(disProps))
                await dispatch(loadWalletSummary(disProps))
            }
            catch (err) {
                console.log("Error in loadWeb3Modal getPoolDatawithFormatHumanised: ", err)
            }

        });

        provider.on("accountsChanged", async () => {
            console.log(`account changed!`);
            pro = new ethers.providers.Web3Provider(provider);
            await pro.send("eth_requestAccounts", []);
            const signer_temp = pro.getSigner();
            let addr = await signer_temp.getAddress()
            chainData = await pro.getNetwork()
            chainId = chainData.chainId
            setInjectedProvider(pro)
            dispatch(setAddress({ address: addr }))

            try {
                disProps = { pro: pro, addr: addr }
                await dispatch(loadReserveSummary(pro))
                await dispatch(loadUserSummary(disProps))
                await dispatch(loadWalletSummary(disProps))
            }
            catch (err) {
                console.log("Error in loadWeb3Modal getPoolDatawithFormatHumanised: ", err)
            }

        });

        // Subscribe to session disconnection
        provider.on("disconnect", (code, reason) => {
            console.log(code, reason);
            logoutOfWeb3Modal();
        });
        // eslint-disable-next-line
    }, [setInjectedProvider]);


    useEffect(() => {
        if (web3Modal.cachedProvider) {
            loadWeb3Modal();
        }
    }, [loadWeb3Modal]);

    let wrapperFunction = () => {
        //do something
        navigator.clipboard.writeText(address);
        //do something
        copysuccess();
    }

    const alignmenucss = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    }

    const menu = (
        <Menu
            items={[
                {
                    label: <code>Network:{currentNetwork}</code>,
                    key: '0',
                },
                {
                    type: 'divider',
                },
                {
                    label: <a className="flex-start" onClick={wrapperFunction}><MdContentCopy size={20} /> Copy Address</a>,
                    key: '1',
                },
                {
                    label: <a className="flex-start" href={`https://${currentNetwork}.etherscan.io/address/${address}`} target="_blank"><BsBoxArrowUpRight size={20} /> View on Explorer</a>,
                    key: '2',
                },
                {
                    label: <Account
                        web3Modal={web3Modal}
                        loadWeb3Modal={loadWeb3Modal}
                        logoutOfWeb3Modal={logoutOfWeb3Modal}
                    />,
                    key: '3'
                }
            ]}
        />
    );

    const globalMenu = (
        <Menu
            items={[
                {
                    label: <code>Global Settings</code>,
                    key: '0',
                },
                {
                    type: 'divider',
                },
                {
                    label: <div style={alignmenucss}>Dark Mode <ThemeSwitcher /></div>,
                    key: '1',
                },
                {
                    label: <div style={alignmenucss}>Testnet Mode <Switch /></div>,
                    key: '2',
                },
                {
                    label: <div>
                        Language
                        <Select
                            defaultValue="English"
                            bordered={false}
                        >
                            <Option value="English">English</Option>
                            <Option value="Hindi">Hindi</Option>
                            <Option value="Kannada">Kannada</Option>
                        </Select>
                    </div>,
                    key: '3'
                }
            ]}
        />
    );

    let accountButtonInfo = { name: 'Connect', action: loadWeb3Modal };


    return (
        <div className="Dapp">
            <Router>
                <Layout style={{ minHeight: '100vh' }}>
                    {/* {currentNetwork == 'homestead' ? '' :
                        <div>
                            <TestnetWarning cnetwork={currentNetwork} />
                        </div>
                    } */}

                    <Header style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', height: '54px' }}>
                        <div >
                            <img src={logo} width={30} />
                            <img src={name} width={100} />
                        </div>
                        <div >
                            <input type="checkbox" id="nav-toggle" className="nav-toggle" />
                            <nav className="navbar-item">
                                <ul>
                                    <li>
                                        <NavLink className="navlink" to="/">
                                            Markets
                                        </NavLink>
                                    </li>

                                    <li>
                                        <NavLink className="navlink" to="/credit">
                                            Credit
                                        </NavLink>
                                    </li>
                                    {/* <li>
                                        <NavLink className="navlink" to={`/dashboard`}>
                                            Dashboard
                                        </NavLink>
                                    </li> */}
                                    <li>
                                        <NavLink className="navlink" to="/staking">
                                            Staking
                                        </NavLink>
                                    </li>
                                </ul>
                            </nav>
                            <label htmlFor="nav-toggle" className="nav-toggle-label">
                                <span></span>
                            </label>
                        </div>
                        <div>
                            {web3Modal?.cachedProvider ? <Dropdown className="user-dropdown" overlay={menu} trigger={['click']}>
                                <a onClick={(e) => e.preventDefault()}>
                                    <Blockies
                                        seed={address}
                                        size={10}
                                        scale={3}
                                        color="#1ae"
                                        bgColor="#ffe"
                                        spotColor="#abc"
                                        className="identicon"
                                    />                                        {address ? <code> <Address address={shortenAddress(address)} /></code> : "Connect Wallet"}
                                    <DownOutlined style={{ color: 'white' }} />
                                </a>
                            </Dropdown> : <Button className="wallet-connect-btn" type="primary" onClick={accountButtonInfo.action}>Connect Wallet</Button>}

                            <Dropdown overlay={globalMenu} trigger={['click']} onVisibleChange={handleVisibleChange} visible={visible}>
                                <a onClick={(e) => e.preventDefault()}>
                                    <SettingFilled className='settings-icon' />
                                </a>
                            </Dropdown>



                        </div>


                    </Header>




                    <Routes>
                        <Route path="/" element={<Markets provider={injectedProvider} />} />
                        <Route path="/details" element={<AssetDetails />} />
                        <Route path="/staking" element={<Staking />} />
                        <Route path="/credit" element={<Credit provider={injectedProvider} />} />
                        <Route path="/faucet" element={<Faucet />} />
                        <Route path={`/dashboard`} element={<Dashboard network={currentNetwork} />} />
                    </Routes>
                    <Footer style={{ background: '#070a0e', color: 'white', marginTop: 'auto' }}>
                        ⒸZERU
                    </Footer>
                </Layout>



            </Router>
        </div>
    )
}

