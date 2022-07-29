import React from 'react'
import CollateralModal from './AssetTables/Modals/CollateralModal';

export default function Checkswitch(props) {
    return (
        <CollateralModal record={props.record} provider={props.provider}/>
    )
}
