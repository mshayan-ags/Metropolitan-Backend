function filterArrayOfObjectAndRemoveRepetitions(arr, property) {
  const uniqueValues = new Set();
  const filteredArr = arr.filter((obj) => {
    if (!uniqueValues.has(obj[property])) {
      uniqueValues.add(obj[property]);
      return true;
    }
    return false;
  });
  return filteredArr;
}

async function CheckAllRequiredFieldsAvailaible(req, fields, res) {
  let Msg;
  await fields.map((a) => {
    if (
      req?.[a] == null ||
      req?.[a] == undefined ||
      req?.[a] == "" ||
      !req?.[a] == null
    ) {
      res
        .status(500)
        .json({ status: 500, message: `Please Fill the Required Field ${a}` });

      Msg = "Error";
    }
  });

  return Msg;
}

module.exports = {
  filterArrayOfObjectAndRemoveRepetitions,
  CheckAllRequiredFieldsAvailaible,
};
