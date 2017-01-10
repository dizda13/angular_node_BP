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

  console.log("Received token: " + token);

  let connection = getConnection();

  connection.query('SELECT * from session where token = ?', [token], function (err, rows, fields) {
    if(!err) {
      if(rows.length == 0) {
        console.log("Token invalid!");
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

  connection.query('SELECT id, username,email,first_name,last_name,profile_picture from users WHERE id = ?', [id], function (err, rows, fields) {
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

userApi.put('/profile', function (request: Request, response: Response, next: NextFunction) {

  let connection = getConnection();

  let id = request.body.id;

  let username = request.body['username'];
  let email = request.body['email'];
  let firstName = request.body['first_name'];
  let lastName = request.body['last_name'];
  let profilePicture = request.body['profile_picture'];

  let query = 'UPDATE users SET ';

  let fields = [];

  if (username) {
    fields.push('username = ' + connection.escape(username));
  }

  if (email) {
    fields.push('email = ' + connection.escape(email));
  }

  if (firstName) {
    fields.push('first_name = ' + connection.escape(firstName));
  }

  if (lastName) {
    fields.push('last_name = ' + connection.escape(lastName));
  }

  if (profilePicture) {
    fields.push('profile_picture = ' + connection.escape(profilePicture));
  }

  query += fields.join();

  query += ' WHERE id = ' + connection.escape(id);

  connection.query(query, function (err, rows, fields) {
    if(!err) {
      response.status(200);
      response.json({
        data: {
          success: true
        }
      });
      endConnection(connection);
    } else {
      response.json({
        data: {
          success: false
        }
      });
      logError(err);
    }
  });

});

userApi.put('/profile/password', function (request: Request, response: Response, next: NextFunction) {

  let id = request.body.id;

  let currentPassword = request.body['current_password'];
  let newPassword = request.body['new_password'];

  if(!currentPassword || !newPassword) {
    response.status(400);
    response.json({message: "Request should contain current and new password"});
    return;
  }

  if(currentPassword == newPassword) {
    response.status(400);
    response.json({message: "New password should not be same as old"});
    return;
  }

  let password = crypto.createHash('sha1').update(currentPassword).digest('hex');

  let connection = getConnection();

  connection.query('SELECT * from users where id=?', [id], function (err, rows, fields) {
    if (!err) {
      if (rows.length == 0) {
        response.status(404);
        response.json({message: "User not found!"});
        endConnection(connection);
        return;
      }

      let test = -1;

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].password == password) {
          test = rows[i].id;
        }
      }

      if(test == -1) {
        response.status(401);
        response.json({message: "Old password is wrong!"});
        endConnection(connection);
        return;
      }

      newPassword = crypto.createHash('sha1').update(newPassword).digest('hex');

      connection.query('UPDATE users SET password=? WHERE id=?', [newPassword, id], function (err, rows, fields) {
        if(!err) {
          response.status(200);
          response.json({
            data: {
              success: true
            }
          });
        } else {
          logError(err, "Updating password");
        }
      });
    } else {
      logError(err, "Finding user");
    }
  });

});

userApi.post('/contacts', function (request: Request, response: Response, next: NextFunction) {

  let id = request.body.id;
  let username = request.body['username'];

  if(!username) {
    response.status(400);
    response.json({message: "Missing username"});
    return;
  }

  let connection = getConnection();

  connection.query('INSERT INTO contacts (user_id1, user_id2) VALUES(?, (SELECT id FROM users WHERE username=?))', [id, username], function (err, rows, fields) {
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

userApi.delete('/contacts/:id', function (request: Request, response: Response, next: NextFunction) {

  let id = request.body.id;
  let contactId = request.params['id'];

  if(!contactId) {
    response.status(400);
    response.json({message: "Missing contactId"});
    return;
  }

  let connection = getConnection();

  connection.query('DELETE FROM contacts where (user_id1 = ? AND user_id2 = (SELECT id FROM users WHERE username=?)) OR (user_id1 = (SELECT id FROM users WHERE username=?) AND user_id2 = ?)', [id, contactId, contactId, id], function (err, rows, fields) {
    if(!err) {
      response.status(200);
      response.json({
        data: {
          success: true
        }
      });
      endConnection(connection);
    } else {
      response.json({
        data: {
          success: false
        }
      });
      logError(err);
    }
  });

});

userApi.get('/contacts', function (request: Request, response: Response, next: NextFunction) {
  let id = request.body.id;

  let connection = getConnection();

  // Should use named parameters, but it is not supported, and I dont want to include some other stuff right now :D
  connection.query('SELECT id, username,email,first_name,last_name,profile_picture FROM users, ' +
    '(SELECT user_id1, user_id2 FROM contacts WHERE user_id1 = ? OR user_id2 = ?) as foundContacts ' +
    'WHERE (users.id = foundContacts.user_id1 OR users.id = foundContacts.user_id2) AND users.id != ?', [id, id, id], function (err, rows, fields) {
    if(!err) {
      response.status(200);
      response.json({
        data: rows

      });
      endConnection(connection);
    } else {
      response.json({
        data: {
          success: false
        }
      });
      logError(err);
    }
  });
});

userApi.put('/ip-address', function(request: Request, response: Response, next: NextFunction) {
  let id = request.body.id;

  let ip_address = request.body['ip-address'];

  if(!ip_address){
    response.status(400);
    response.json({message: "Missing ip address"});
    return;
  }

  let connection = getConnection();

  connection.query('UPDATE users SET ip_address=? WHERE id=?', [ip_address,id], function (err, rows, fields) {
  if(!err) {
    response.status(200);
    response.json({
      data: {
        success: true
      }
    });
    endConnection(connection);
  } else {
    response.json({
      data: {
        success: false
      }
    });
    logError(err);
  }
});

});

userApi.get('/ip-address/:username', function(request: Request, response: Response, next: NextFunction) {
  let id = request.body.id;

  let username = request.params.username;

  if (!username) {
    response.status(400);
    response.json({message: "Missing ip address"});
    return;
  }

  let connection = getConnection();

  connection.query('SELECT ip_address FROM users WHERE username=?', [username], function (err, rows, fields) {
    if (!err) {
      if (rows.length == 0) {
        response.status(404);
        response.json({message: 'wtf'});
      } else {
        response.status(200);
        response.json({data: rows[0]});
      }
      endConnection(connection);
    } else {
      response.json({
        data: {
          success: false
        }
      });
      logError(err);
    }
  });
});

userApi.get('/chat/:username', function(request: Request, response: Response, next: NextFunction) {
  let id = request.body.id;
  let id2=10;
  let username = request.params.username;

  if (!username) {
    response.status(400);
    response.json({message: "Missing username of friend"});
    return;
  }

  let connection = getConnection();

  connection.query('SELECT id FROM users WHERE username=?', [username], function (err, rows, fields) {
    if (!err) {
      if (rows.length == 0) {
        response.status(404);
        response.json({message: 'wtf'});
      } else {
        id2=rows[0].id;
        console.log(rows[0].id);
        connection.query('SELECT messages.id, send.username as sender_id, receive.username as receiver_id, message, time FROM messages ' +
          'JOIN users as send ON send.id=sender_id ' +
          'JOIN users as receive ON receive.id=receiver_id  WHERE (sender_id=? AND receiver_id=?)  OR (sender_id=? AND receiver_id=?)' +
          'ORDER BY messages.time', [id,id2,id2,id], function (err, rows, fields) {
          if (!err) {
              response.status(200);
              response.json({data: rows});
            endConnection(connection);
          } else {
            response.json({
              data: {
                success: false
              }
            });
            logError(err);
          }
        });
      }
      endConnection(connection);
    } else {
      response.json({
        data: {
          success: false
        }
      });
      logError(err);
    }
  });


});

userApi.put('/chat/:username', function(request: Request, response: Response, next: NextFunction) {
  let id = request.body.id;
  let id2=10;
  let username = request.params.username;
  let message  = request.body.message
  if (!username) {
    response.status(400);
    response.json({message: "Missing username"});
    return;
  }

  let connection = getConnection();

  connection.query('SELECT id FROM users WHERE username=?', [username], function (err, rows, fields) {
    if (!err) {
      if (rows.length == 0) {
        response.status(404);
        response.json({message: 'wtf'});
      } else {
        id2=rows[0].id;
        console.log(rows[0].id);
        connection.query('INSERT INTO messages (sender_id,receiver_id,message, time) VALUES (?,?,?,NOW())', [id,id2,message], function (err, rows, fields) {
          if (!err) {
            response.status(200);
            response.json({
              data: {
                success: true
              }
            });
            endConnection(connection);
          } else {
            response.json({
              data: {
                success: false
              }
            });
            logError(err);
          }
        });
      }
      endConnection(connection);
    } else {
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
