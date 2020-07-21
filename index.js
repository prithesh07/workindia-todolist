const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const Cryptr = require('cryptr');
const cryptr = new Cryptr('pritheshIStheKEY');


const app = express();
app.use(bodyParser.json());

//create database connection
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todolist'
  });

  conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");    
   
  }); 

// API for creating agent 
  app.post('/app/agent',(req, res) => {
    let data = {agent_id: req.body.agent_id, password: cryptr.encrypt(req.body.password)};
    let sql = "INSERT INTO agents SET ?";
    let query = conn.query(sql, data,(err, results) => {
      if(err) throw err;
      res.send({"Response Data" : {"status":"account created","status_code": 200}});
    });
  });

// API fr authenticating an agent and retrieving agent id
  app.post('/app/agent/auth',(req, res) => {
    let sql = "Select agent_id, password from agents where agent_id='"+ req.body.agent_id + "'";
    let query = conn.query(sql,(err, results) => {
      if(err) throw err;
        console.log(results);
      if(results.length == 0)
        res.send({"Response Data" : {"status":"failure","status_code": 401}});
      else
      {
        if(cryptr.decrypt(results[0].password) == req.body.password)
        {
          res.send({ "Response Data" : {
          'status': 'success',
          'agent_id': parseInt(results[0].agent_id),
          'status_code': 200
          }});
        }
        else
          res.send({"Response Data" : {"status":"failure","status_code": 401}});
      }
    });
  });

  // API to sent out the tasks of an agent
  app.get('/app/sites/list',(req, res) => {
    let sql = "SELECT * FROM list where  agentID="+req.query.agent+" order by dueDate";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      if(results.length >0)
        res.send({"Response Data": results});
      else
      res.send({"Response Data": "None"});
    });
  });

  // API to add the task for an agent
  app.post('/app/sites',(req, res) => {
    let data = {agentID : req.query.agent, taskTitle: req.body.title, taskDescription: req.body.description, taskCateogry:req.body.category,dueDate:req.body.due_date};
    let sql = "INSERT INTO list SET ?";
    let query = conn.query(sql, data,(err, results) => {
      if(err) throw err;
      res.send({"Response Data" : {"status":"success","status_code": 200}});
    });
  });

  app.listen(3000,() =>{
    console.log('Server started on port 3000...');
});