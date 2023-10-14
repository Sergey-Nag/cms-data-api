const PASSWORD_VALIDATION_REGEXP = /^([A-Za-z\d-!]+){4,}$/;
const EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const ISO_DATE_REGEXP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([-+]\d{2}:\d{2}))?$/;
// const PASSWORD_VALIDATION_REGEXP = /^(?=.*[A-Za-z])(?=.*[\d!-+*#@])[A-Za-z\d!-+*#@]{4,}$/;
const NUMBER_SERACH_INPUT_REGEXP = /^([<>]=?|==) \d+(\.\d+)?( && ([<>]=?|==) \d+(\.\d+)?)?$/;

module.exports = {
    PASSWORD_VALIDATION_REGEXP,
    EMAIL_REGEXP,
    ISO_DATE_REGEXP,
    NUMBER_SERACH_INPUT_REGEXP,
}