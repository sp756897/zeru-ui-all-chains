import React from 'react'

export default function TestnetWarning(props) {
  return (
    <div class="flex-center testnet-warning">
        Note: You are currently connected to the {props.cnetwork} Testnet
    </div>
  )
}
