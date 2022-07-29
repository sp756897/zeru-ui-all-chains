import React from 'react'
import { Button, Result } from 'antd'

export default function TransactionSuccess(props) {
    return (
        <div>
            <Result
                status="success"
                title="Transaction Successful"
                extra={[
                    <Button className='modal-btn' type="primary" key="console" onClick={props.func}>
                        Ok, Close
                    </Button>,
                ]}
            />
        </div>
    )
}
