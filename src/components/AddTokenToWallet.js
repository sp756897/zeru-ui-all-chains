import { Button } from 'antd'
import React from 'react'
import { IoWalletSharp } from 'react-icons/io5'

export default function AddTokenToWallet() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <p className='font-size-1rem-bolder color-cement'>Add Token to wallet</p>
      <IoWalletSharp size="3rem" />
      <Button type='primary' style={{ background: '#1ae' }}>Add</Button>
    </div>
  )
}
