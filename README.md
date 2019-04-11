# Winston + SQLite3

Fork of JasonShin's SQLite 3 transport for Winston logger module. 
This fork adds database locking using async-lock to provide separate contention-free access to the database

## Installation
```
npm install winston-sqlite3
```

## Setup
```javascript
const winston = require('winston')
// Requiring `winston-sqlire3` will expose `winston.transports.SQLite3`
require('winston-sqlite3')

winston.add(winston.transports.SQLite3, {
  database: '<winston by default>',
  user:  '<winston by default>',
  password: '<null by default>',
  filename: '<path to your sqlite db file. For example: content/data/biphub-dev.sqlite3>',
  tableName: '<specify name of table that you want to generate inside sqlite3>'
  dbLock: <provide an instance of async-lock to use as a database access lock>,
  dbLockName: '<name for database lock. defaults to dblock if not provided>'
})

winston.log('info', 'Hello distributed log files!')
winston.info('Hello again distributed logs')
```


License
----

The MIT License Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
