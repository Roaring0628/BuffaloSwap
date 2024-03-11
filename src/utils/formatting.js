export const formatNumber = (number, precision) => {
    if (precision > 2) {
        return parseFloat(number).toFixed(precision).toString()
    }
    return parseFloat(number).toFixed(precision).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    // console.debug("formatNumber str: " + str);
}