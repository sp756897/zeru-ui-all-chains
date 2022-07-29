import { Card, Col, Row } from 'antd'
import { Button } from 'antd';
import { Typography } from 'antd';

import React from 'react'
import "../styles/styles.css"

const flexcss = { display: 'flex', alignItems: 'center', justifyContent: 'space-around', textAlign: 'center', gap: '2rem' }

const { Title } = Typography;
export default function Staking() {
    return (
        <div className='stakingdiv'>
            <Row className='textaligncenter'>
                <Col span={12} className='text'>
                    <p className='font-size-0_5rem-bolder color-dull'>Funds in safety mode</p>
                    <p className='font-size-1_5rem-bolder'>2,345,478.00</p>
                </Col>
                <Col span={12} className='text'>
                    <p className='font-size-0_5rem-bolder color-dull'>Total emmission per day</p>
                    <p className='font-size-1_5rem-bolder'>453.67</p>
                </Col>
            </Row>
            <div className='staking-card'>
                <Card style={{ maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
                    <p className='font-size-1_5rem-bolder'>Stake ZERU</p>
                    <br />
                    <Row className='flex-even padding1'>
                        <Col >
                            <p className='font-size-1_5rem-bolder'>ZERU</p>
                        </Col>
                        <Col >
                            <p className='font-size-0_5rem-bolder color-dull'>Staking APY</p>
                            <p className='font-size-1_5rem-bolder'>8.20%</p>
                        </Col>
                        <Col >
                            <p className='font-size-0_5rem-bolder color-dull'>Max Slashing</p>
                            <p className='font-size-1_5rem-bolder'>30.00%</p>

                        </Col>
                        <Col >
                            <Button type="primary">
                                Stake
                            </Button>
                        </Col>
                    </Row>
                    <Row style={flexcss}>
                        <Card className="flex-center" style={{width:'200px',height:'150px'}} >
                            <p className='font-size-0_5rem-bolder color-dull'>Staked ZERU</p>
                            <p className='font-size-1_5rem-bolder'>10</p>
                        </Card>
                        <Card className="flex-center" style={{width:'200px',height:'150px'}}>
                            <p className='font-size-0_5rem-bolder color-dull'>Claimable ZERU</p>
                            <p className='font-size-1_5rem-bolder'>2</p>
                            <Button type='primary'>
                                Claim ZERU
                            </Button>
                        </Card>
                    </Row>
                </Card>
            </div>

        </div>
    )
}
