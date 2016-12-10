import {Router, Request, Response, NextFunction} from 'express';
import {forEach} from "@angular/router/src/utils/collection";
const crypto = require('crypto');
const mysql = require('mysql');
const userApi: Router = Router();

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

userApi.use((request: Request & { headers: { authorization: string } }, response: Response, next: NextFunction) => {
  const token = request.headers.authorization;

  let connection = getConnection();

  connection.query('SELECT * from session where token = ?', [token], function (err, rows, fields) {
    if(!err) {
      if(rows.length == 0) {
        return response.status(401).json({
          message: 'Invalid token, please Log in first'
        });
      } else {
        request.body.id = rows[0].user_id;
        next();
        endConnection(connection);
      }
    } else {
      logError(err, 'Authorization');
    }
  });
});

userApi.delete('/odjava', function (request: Request, response: Response, next: NextFunction) {

  let connection = getConnection();

  let token = request.header('Authorization');

  connection.query('DELETE FROM session WHERE token = ?', [token], function (err, rows, fields) {
    if(!err) {
      response.status(200);
      response.json({odjava: true});
      endConnection(connection);
    } else {
      logError(err);
    }
  });

});

userApi.get('/profile', function (request: Request, response: Response, next: NextFunction) {

  let connection = getConnection();

  let id = request.body.id;

  connection.query('SELECT username,email,first_name,last_name,profile_picture from users WHERE id = ?', [id], function (err, rows, fields) {
    if(!err) {
      if(rows.length == 0) {
        response.status(404);
        response.json({message: 'wtf'});
      } else {
        response.status(200);
        response.json({data: rows[0]});
      }
      endConnection(connection);
    } else {
      logError(err);
    }
  });

});

userApi.post('/contacts', function (request: Request, response: Response, next: NextFunction) {

  let id = request.body.id;
  let contactId = request.get('contactId');

  if(!contactId) {
    response.status(400);
    response.json({message: "Missing contactId"});
    return;
  }

  let connection = getConnection();

  connection.query('INSERT INTO contacts (user_id1, user_id2) VALUES(?, ?)', [id, contactId], function (err, rows, fields) {
    if(!err) {
      response.status(200);
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

export {userApi}
