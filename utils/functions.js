function filterArrayOfObjectAndRemoveRepetitions(arr, property) {
    const uniqueValues = new Set();
    const filteredArr = arr.filter(obj => {
        if (!uniqueValues.has(obj[property])) {
            uniqueValues.add(obj[property]);
            return true;
        }
        return false;
    });
    return filteredArr;
}


module.exports={
    filterArrayOfObjectAndRemoveRepetitions
}