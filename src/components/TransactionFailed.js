import React from 'react'
import { Button, Result } from 'antd'

export default function TransactionFailed(props) {
    return (
        <div>
            <Result
                status="error"
                title="Transaction Failed"
                extra={[
                    <Button className='modal-btn' type="primary" key="console" onClick={props.func}>
                        Try Again
                    </Button>,
                ]}
            />
        </div>
    )
}
