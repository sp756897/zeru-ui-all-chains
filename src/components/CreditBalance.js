import deployed_contracts_address from "../deployed-contracts.json"
import creditToken_abi from "../artifacts/contracts/protocol/tokenization/CreditTokenNew.sol/CreditTokenNew.json"
import { ethers } from "ethers"

export const CreditBalance = (address_creditToken, pro) => {
    const creditToken_contract = new ethers.Contract(
        address_creditToken,
        creditToken_abi.abi,
        pro
    )
    return creditToken_contract
}
