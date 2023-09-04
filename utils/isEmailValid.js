const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
function isEmailValid(email) {
    return emailRegex.test(email);
}

module.exports = isEmailValid;