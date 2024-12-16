import Validator from 'validatorjs';

const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
Validator.register('valid_url', value => urlPattern.test(value), "The site must be a valid URL.");

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
Validator.register('password_regex', value => passwordRegex.test(value), "Password must contain at least one uppercase letter, one lowercase letter and one number");

const firstError = (validation) => {
    const firstkey = Object.keys(validation.errors.errors)[0];
    return validation.errors.first(firstkey);
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