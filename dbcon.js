var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_kirchchr',
  password        : '5540',
  database        : 'cs340_kirchchr'
});

module.exports.pool = pool;
