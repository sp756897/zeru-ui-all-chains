import React from "react";
import {LogoutOutlined} from '@ant-design/icons'
import {TbLogout} from 'react-icons/tb'

export default function Account({
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
}) {

  let accountButtonInfo;
  if (web3Modal?.cachedProvider) {
    accountButtonInfo = { name: ' Disconnect Wallet', action: logoutOfWeb3Modal };
  } else {
    accountButtonInfo = { name: 'Connect', action: loadWeb3Modal };
  }


  return (
    <div >
      {web3Modal && (
        <a className="flex-start"
          style={{ borderRadius:'0.35rem',fontSize:'1rem',fontWeight:'500',}}
          onClick={accountButtonInfo.action}
        >
          <TbLogout size={20} /> {accountButtonInfo.name}
        </a>
      )}
    </div>
  );
}
