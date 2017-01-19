import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import * as express from 'express';

import { Observable } from 'rxjs';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import * as io from 'socket.io-client';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'app works!';
  observable$: Observable<{}>;
  socket: any;
  sentMessageUsername: string = null;
  response: string;
  //reference = this;


  constructor(http: Http) {

    let reference = this;
    this.observable$ = http
      .get('/api/public/simple')
      .map((response: Response) => response.json());
      this.socket=io('http://localhost:4041', {query: "userName=Dizda"});

    this.socket.on('receive', function(){
      console.log('hepek');
    });
    this.socket.emit('chatMessageToSocketServer', "nesto", function(respMsg, username){
      console.log("Dizda");
      reference.sentMessageUsername = username;
      reference.response = respMsg;
      console.log(respMsg);
  });

  }
}
