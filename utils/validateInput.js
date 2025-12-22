const validate = (data) => {
  let error = [];

  for (let obj in data) {
    let val = data[obj];
    val=val.trim();

    if (val === "") {
      error.push({ er: `${obj} is missing` });
      break;
    }

    if (val !== "") {
      if (obj === "email") {
        let emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let check = emailRegexp.test(val);
        if (!check) {
          error.push({ er: "email is not valid" });
          break;
        }
      }

      if (obj === "gstin") {
        let gstinRegexpo =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        let check = gstinRegexpo.test(val.toUpperCase());
        if (!check) {
           error.push({er:'GSTIN is not valid'});
           break;
          }
        }
        
        if (obj === "contactNumber") {
        let mobileRegexp = /^[0-9]{10}$/;
        
        let check = mobileRegexp.test(val);
        if (!check) {
          error.push({er:'Contact Number is not valid'});
  
        }
      }
    }
  }

  return error;
};

module.exports = {
  validate,
};
