  import { Router, Request, Response, NextFunction } from 'express';
import * as Promise from "bluebird";
import * as Sequelize from "sequelize";
//import { sign } from 'jsonwebtoken';
import { secret, length, digest } from '../config';
//import { mysql } from 'mysql';
var mysql = require('mysql');
const prijava: Router = Router();


prijava.post('/prijava', function(request: Request, response: Response, next: NextFunction){

  var mysql = require('mysql');
  var connection = mysql.createConnection({
    host     : 'eu-cdbr-west-01.cleardb.com',
    user     : 'bd08922d88da6e',
    password : '8651bcec',
    database : 'heroku_4d519b9044708a5'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log(err);
    console.log("Error connecting database ... nn");
}
});

var username = request.body['username'];
var password = request.body['password'];

console.log(username);
console.log(password);

connection.query('SELECT * from users where username=? AND password=?' , [username, password] , function(err, rows, fields) {
  connection.end(function(err) {
    console.log('Connection ended');
  });
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

  var connection = mysql.createConnection({
    host     : 'eu-cdbr-west-01.cleardb.com',
    user     : 'bd08922d88da6e',
    password : '8651bcec',
    database : 'heroku_4d519b9044708a5'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

var username = request.body['username'];
var email = request.body['email'];
var password = request.body['password'];
var firstName = request.body['first_name'];
var lastName = request.body['last_name'];
var profilePicture = request.body['profile_picture'];

connection.query('INSERT INTO users(username, email, password, first_name, last_name, profile_picture) VALUES(?, ?, ?, ?, ?, ?)',
                [username, email, password, firstName, lastName, profilePicture] , function(err, rows, fields) {
connection.end();
console.log(err);
if(!err) {
  response.json({success: true});
} else {
    response.json({success: false});
}
});

});


prijava.post('/search', function(request: Request, response: Response, next: NextFunction){
  var mysql = require('mysql');
  var connection = mysql.createPool({
    host     : `eu-cdbr-west-01.cleardb.com`,
    user     : `bd08922d88da6e`,
    password : `8651bcec`,
    database : `heroku_4d519b9044708a5`,
    connectionLimit: 10
});


//connection.connect(function(err){
/*if(!err) {
    console.log("Database is connected ... nn");
    console.log(err);
} else {
    console.log("Error connecting database ... nn");
    console.log(err);
}
});*/


var searchQuery = request.body['search'];

console.log(searchQuery);
connection.query('SELECT username,email,first_name,last_name,profile_picture from users where username LIKE ?',['%' + searchQuery + '%'] , function(err, rows, fields) {
//connection.end();
  if (!err){

    //console.log('The solution is: ', rows);
    //response.writeHead(200, { 'Content-Type': 'application/json'});

    response.json({data : rows});
    connection.end(function(err) {
      console.log('Connection ended');
  });
  }
  else{
      console.log('Error while performing Query.');
      console.log(err);
  }

  });

});

prijava.get('/testing', function(request: Request, response: Response, next: NextFunction){

  var mysql = require('mysql');
  var connection = mysql.createConnection({
    host     : `eu-cdbr-west-01.cleardb.com`,
    user     : `bd08922d88da6e`,
    password : `8651bcec`,
    database : `heroku_4d519b9044708a5`
});


connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
    console.log(err);
} else {
    console.log("Error connecting database ... nn");
    console.log(err);
}
});
connection.query('SELECT * from users', function(err, rows, fields) {
connection.end();
  if (!err){
    //response.writeHead(200, { Content-Type: 'application/json'});
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.json({data : rows});
    connection.end();
    connection.release();

  }
  else
    console.log('Error while performing Query.');

  });

});

export { prijava }
