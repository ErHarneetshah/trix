import Validator from 'validatorjs';
// import { Model, Sequelize } from '../Database/sequelize.js';
// import _ from "lodash";
// import TronWeb from 'tronweb'
// import moment from 'moment';

Validator.registerAsync('gte', function (columnValue, attribute, req, passes) {
    // //console.log({columnValue,attribute,req})
    if (parseFloat(attribute) > parseFloat(columnValue)) {
        return passes(false, `The ${req} should be greater than or equal to ${attribute}`);
    } else {
        return passes();
    }
});

Validator.registerAsync('gt', function (columnValue, attribute, req, passes) {
    // //console.log({columnValue,attribute,req})
    if (parseFloat(attribute) >= parseFloat(columnValue)) {
        return passes(false, `The ${req} should be greater than ${attribute}`);
    } else {
        return passes();
    }
});


Validator.registerAsync('is_wallet_address', function (columnValue, attribute, req, passes) {
    const isAddress = TronWeb.isAddress(columnValue);
    if (isAddress === false) {
        return passes(false, `Invalid Wallet Address`);
    } else {
        return passes();
    }
});


Validator.registerAsync('unique', function (columnValue, attribute, req, passes) {
    const attr = attribute.split(",");  // 0 = tablename , 1 = columnname
    columnValue = columnValue.trim() 
    Model.query(`SELECT * FROM ${attr[0]} Where ${attr[1]} = "${columnValue}" LIMIT 1`).then(([results]) => {
        return (results.length == 0) ? passes() : passes(false, `The ${req} already exists in company.`);
    }).catch((error) => {
        return passes(false, error.message)
    });
});

Validator.registerAsync('exists', function (columnValue, attribute, req, passes) {
    const attr = attribute.split(",");
    Model.query(`SELECT * FROM ${attr[0]} Where ${attr[1]} = "${columnValue}" LIMIT 1`).then(([results]) => {
        return (results.length == 0) ? passes(false, `The ${req} is not Exists.`) : passes();
    }).catch((error) => {
        return passes(false, error.message)
    });
});

Validator.registerAsync('exists-except', function (columnValue, attribute, req, passes) {
    const attr = attribute.split(",");  // 0 = tablename , 1 = columnname, 2 = expect column, 3 = expect column value
    Model.query(`SELECT * FROM ${attr[0]} Where ${attr[1]} = "${columnValue}" AND ${attr[2]} != ${attr[3]} LIMIT 1`).then(([results]) => {
        return (results.length > 0) ? passes(false, `The ${req} is Already Exists.`) : passes();
    }).catch((error) => {
        return passes(false, error.message)
    });
});

///////////////////////////// Swift code validation /////////////////////////////////////////////////////////

const validCountryCodes = new Set([
    "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX",
    "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ",
    "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK",
    "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM",
    "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FM", "FO", "FR", "GA",
    "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GT", "GU",
    "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ",
    "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR",
    "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA",
    "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS",
    "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO",
    "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR",
    "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG",
    "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ",
    "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TZ",
    "UA", "UG", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE",
    "YT", "ZA", "ZM", "ZW"
]);


Validator.register('swift-regex', function(value, requirement, attribute) { // requirement parameter defaults to null
    if (!value.match(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/)) {
        return false;
    }
    const countryCode = value.slice(4, 6);
    return validCountryCodes.has(countryCode);
}, 'The SWIFT format is invalid.');



const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
Validator.register('password_regex', value => passwordRegex.test(value), "Password must contain at least one uppercase letter, one lowercase letter and one number");

// const upiRegex = /^[\w.-]+@[\w.-]+$/;
// Validator.register('upi_regex', value => upiRegex.test(value), "UPI ID Format is Invalid");

// const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
// Validator.register('ifsc_regex', value => ifscRegex.test(value), "IFSC Code Format is Invalid");



const firstError = (validation) => {
    const firstkey = Object.keys(validation.errors.errors)[0];
    return validation.errors.first(firstkey);
}



export const check_age = async (dob) => {                           
    const age = moment().diff(moment(dob), 'years');
    if (age > 15) {
        return true ;
    } else {
        return false ;
    }
}

function validate(request, rules, messages = {}) {
    if (typeof request != 'object' || typeof rules != 'object' || typeof messages != 'object') {
        return {
            status: 0,
            message: 'Invalid Params'
        }
    }
    let validation = new Validator(request, rules, messages);
    return new Promise((resolve, reject) => {
        validation.checkAsync(() => resolve({ status: 1, message: "" }), () => reject({ status: 0, message: firstError(validation) }));
    }).then(r => r).catch(err => err);
}

export default validate;