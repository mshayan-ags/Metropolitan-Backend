const { default: mongoose } = require("mongoose");

async function SetArrManyRelationhip(field, checkValue, res) {
  let Msg = "";
  if (checkValue == undefined || checkValue == "" || checkValue == null) {
    res.status(500).json({
      status: 500,
      message: "Please Enter Value of all the fields",
    });
    Msg = "Error";
  }
  const Arr =
    field?.length >= 1 ? [...field] : field?.length > 0 ? [field] : [];
  if (Arr.length > 0) {
    await Arr.filter((a, i) => {
      if (a == checkValue) {
        i = Arr.length;
        return;
      } else if (a != checkValue && i == Arr.length - 1) {
        Arr.push(new mongoose.Types.ObjectId(checkValue));
      }
    });
  } else {
    Arr.push(new mongoose.Types.ObjectId(checkValue));
  }

  return { Arr: await Arr, Msg };
}

async function RemoveArrManyRelationhip(field, checkValue, res) {
  let Msg = "";
  if (checkValue == undefined || checkValue == "" || checkValue == null) {
    res.status(500).json({
      status: 500,
      message: "Please Enter Value of all the fields",
    });
    Msg = "Error";
  }
  const Arr =
    field?.length >= 1 ? [...field] : field?.length > 0 ? [field] : [];
  if (Arr.length > 0) {
    await Arr.filter((a, i) => {
      if (a == checkValue) {
        Arr.splice(i, 1);
        i = Arr.length;
        return;
      }
    });
  }

  return { Arr: await Arr, Msg };
}

module.exports = { SetArrManyRelationhip, RemoveArrManyRelationhip };
