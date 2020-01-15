var mysql = require('mysql');

/**
 * Escape arrays in MySQL queries to prevent SQL injection vulnerabilities. This is especially useful in MySQL IN statements.
 *
 * @param array the javascript array to be escaped
 * @returns {string} escaped array with parentheses around it
 */
module.exports = function (array) {
    var escapedArray = '';
    var comma = '';
    array.forEach(function (value) {
        escapedArray += comma + mysql.escape(value);
        comma = ',';
    });
    return '(' + escapedArray + ')';
};
