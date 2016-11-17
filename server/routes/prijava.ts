import { Router, Request, Response, NextFunction } from 'express';
import * as Promise from "bluebird";
import * as Sequelize from "sequelize";
//import { sign } from 'jsonwebtoken';
import { secret, length, digest } from '../config';
//import { mysql } from 'mysql';

const prijava: Router = Router();

prijava.post('/prijava', function(request: Request, response: Response, next: NextFunction){

  var mysql = require('mysql');
  var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'mydb'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});
console.log(request.body['username']);
console.log(request.body['password']);

connection.query('SELECT * from users where username =\''+ request.body['username'] + '\' AND password= \'' + request.body['password']+'\'' , function(err, rows, fields) {
connection.end();
  if (!err){
    //console.log(rows);
    //console.log('The solution is: ', rows);
    if(rows.length!=0)
      response.json({prijava: true});
    else
      response.json({prijava: false});
    }
  else
    console.log('Error while performing Query.');
  });

});

prijava.post('/dodaj', function(request: Request, response: Response, next: NextFunction){

  var mysql = require('mysql');
  var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'mydb'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

connection.query('INPUT INTO users(username, email, password, first_name, last_name, profile_picture) VALUES('+
request.body['username'] + "," +
request.body['email'] + "," +
request.body['password'] + "," +
request.body['first_name'] + "," +
request.body['last_name'] + "," +
request.body['profile_picture'] + ')' , function(err, rows, fields) {
connection.end();
  if (!err){
    console.log(rows);
    //console.log('The solution is: ', rows);
    if(rows.length!=0)
      response.json({prijava: true});
    else
      response.json({prijava: false});
    }
  else
    console.log('Error while performing Query.');
  });

});

prijava.post('/search', function(request: Request, response: Response, next: NextFunction){

  var mysql = require('mysql');
  var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'mydb'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});
console.log(request.body['search']);
connection.query('SELECT * from users where username LIKE \'%'+request.body['search']+'%\'' , function(err, rows, fields) {
connection.end();
  if (!err)
    //console.log('The solution is: ', rows);
    response.send(rows);
  else
    console.log('Error while performing Query.');
  });

});


export { prijava }
