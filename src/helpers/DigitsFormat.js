import CurrencyFormater from "./CurrencyFormater"

export const DigitsFormat = (num) => {

    let numValue = parseFloat(num)
    let formattedValue = 0;
    if (numValue == 0) {
        formattedValue = "0.00"
    }
    else if (numValue < 1) {
        formattedValue = parseFloat(numValue).toFixed(7)
        formattedValue = parseFloat(formattedValue)
    }
    else if (numValue > 1e9) {
        formattedValue = CurrencyFormater(numValue, 2)
    }
    else {
        formattedValue = parseFloat(numValue).toFixed(2)
    }
    return formattedValue
}