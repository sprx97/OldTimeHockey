var mysqlEscapeArray = require('../index.js');

var names = ["bob", "joe", "bill", "Robert' DROP TABLE Students;"];

var sql = 'SELECT * FROM users WHERE name IN ' + mysqlEscapeArray(names);

console.log(sql);
//SELECT * FROM users WHERE name IN ('bob','joe','bill','Robert\' DROP TABLE Students;')
