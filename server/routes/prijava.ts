import {Router, Request, Response, NextFunction} from 'express';
const crypto = require('crypto');
const mysql = require('mysql');
const prijava: Router = Router();

function getConnection() {
  return mysql.createConnection({
    host: 'eu-cdbr-west-01.cleardb.com',
    user: 'bd08922d88da6e',
    password: '8651bcec',
    database: 'heroku_4d519b9044708a5'
  });
}

function endConnection(connection) {
  connection.end(function (err) {
    console.log('Connection ended');
  });
}

function logError(err, query = 'Query') {
  console.log('Error while performing ' + query);
  console.log(err);
}

prijava.post('/prijava', function (request: Request, response: Response, next: NextFunction) {

  let username = request.body['username'];
  let password = request.body['password'];

  if (!username || !password) {
    response.status(400);
    response.json({prijava: false, message: "Request should contain username and password!"});
    return;
  }

  password = crypto.createHash('sha1').update(password).digest('hex');
  console.log("Hashed password: " + password);

  let connection = getConnection();

  connection.query('SELECT * from users where username=?', [username], function (err, rows, fields) {
    if (!err) {
      if (rows.length == 0) {
        response.status(404);
        response.json({prijava: false});
        endConnection(connection);
        return;
      }

      let id = -1;

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].password == password) {
          id = rows[i].id;
        }
      }

      if (id == -1) {
        response.status(401);
        response.json({prijava: false});
        endConnection(connection);
        return;
      }

      let token = "";
      token = crypto.randomBytes(8).toString('hex');

      connection.query('INSERT INTO session(token, user_id) VALUES(?, ?)', [token, id], function (err, rows, fields) {
        if(!err) {
          response.status(200);
          response.json({prijava: true, token: token, id: id});
          endConnection(connection);
        } else {
          logError(err, "token saving");
        }
      });

    }
    else {
      logError(err, "user search");
    }
  });

});

prijava.post('/dodaj', function (request: Request, response: Response, next: NextFunction) {

  let username = request.body['username'];
  let email = request.body['email'];
  let password = request.body['password'];
  let firstName = request.body['first_name'];
  let lastName = request.body['last_name'];
  let profilePicture = request.body['profile_picture'];

  if(!username || !email || !password || !firstName || !lastName || !profilePicture) {
    response.status(400);
    response.json({prijava: false, message: "Mising fields!"});
    return;
  }

  password = crypto.createHash('sha1').update(password).digest('hex');

  let connection = getConnection();

  connection.query('INSERT INTO users(username, email, password, first_name, last_name, profile_picture) VALUES(?, ?, ?, ?, ?, ?)',
    [username, email, password, firstName, lastName, profilePicture], function (err, rows, fields) {
      if (!err) {
        response.json({
          data: {
            success: true
          }
        });
        endConnection(connection);
      } else {
        if (err.code == 'ER_DUP_ENTRY') {
          response.status(409);
        }
        response.json({
          data: {
            success: false
          }
        });
        logError(err);
      }
    });

});


prijava.post('/search', function (request: Request, response: Response, next: NextFunction) {
  let connection = getConnection();
  let searchQuery = request.body['search'];
  console.log(searchQuery);
  let queryString = '%' + searchQuery + '%';
  connection.query('SELECT username,email,first_name,last_name,profile_picture from users where username LIKE ? ' +
    'OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?', [queryString, queryString, queryString, queryString], function (err, rows, fields) {
    if (!err) {
      response.json({data: rows});
      endConnection(connection);
    }
    else {
      logError(err);
    }

  });

});

prijava.get('/testing', function (request: Request, response: Response, next: NextFunction) {

  let connection = getConnection();
  connection.query('SELECT * from session', function (err, rows, fields) {
    if (!err) {
      response.json({data: rows});
      endConnection(connection);
    }
    else {
      logError(err);
    }

  });

});

export {prijava}
