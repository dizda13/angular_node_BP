import * as express from 'express';
import { json, urlencoded } from 'body-parser';
import * as path from 'path';
import * as cors from 'cors';
import * as compression from 'compression';

import { loginRouter } from './routes/login';
import { protectedRouter } from './routes/protected';
import { publicRouter } from './routes/public';
import { feedRouter } from './routes/feed';
import { prijava } from './routes/prijava';
import { userApi } from './routes/userApi';
const app: express.Application = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var map=new Object();

app.disable('x-powered-by');

app.use(json());
app.use(compression());
app.use(urlencoded({ extended: true }));

// allow cors only for local dev
app.use(cors({
  origin: '*'
}));

// app.set('env', 'production');

// api routes
app.use('/api/secure', protectedRouter);
app.use('/api/login', loginRouter);
app.use('/api/public', publicRouter);
app.use('/api/feed', feedRouter);
app.use('/rest', prijava);
app.use('/rest', userApi);

if (app.get('env') === 'production') {

  // in production mode run application from dist folder
  app.use(express.static(path.join(__dirname, '/../client')));
}

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next) {
  let err = new Error('Not Found');
  next(err);
});

// production error handler
// no stacktrace leaked to user
app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {

  res.status(err.status || 500);
  res.json({
    error: {},
    message: err.message
  });
});

io.on('connection', function(socket) {
  //console.log(socket.request.connection.remoteAddress);
  console.log('new connection');
  map[socket.handshake.query.userName]=socket.id;
  socket.emit();
  console.log(map['Dizda']);
  console.log(socket.id);
  console.log(socket.handshake.query.userName);
  socket.on('chatMessageToSocketServer', function(msg,func){
    console.log(msg);
    func("Message recieved!",socket.handshake.query.userName);
    let name = socket.handshake.query.sentMessageUsername;
    console.log(name);
    socket.emit('receive');
  });



});

server.listen(4041, function() {
  console.log('server up and running at 4041 port');
});

export { app }
