//YYMMDD SSSS C A Z (13 digits) -> last digit is Luhn checksum.

function passesLuhn(value) {
    let sum = 0
    let alternate = false
    for (let i = value.length -1; i >= 0; i--) {
        let digit = Number(value[i])
        if (alternate) {
            digit *= 2
            if (digit > 9) digit -= 9
        }
        sum += digit
        alternate = !alternate
    }
    return sum % 10 === 0
}

function hasValidDate(value) {
    const month = Number(value.slice(2, 4))
    const day = Number(value.slice(4, 6))
    if (month < 1 || month > 12) return false
    const daysInMonth = new Date(2000, month, 0).getDate()
    return day >= 1 && day <= daysInMonth
}

export function isValidSaId(value) {
    return /^\d{13}$/.test(value) && hasValidDate(value) && passesLuhn(value)
}
