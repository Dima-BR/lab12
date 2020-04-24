'use strict';
require('dotenv').config();
// will not using external call so don't need to dependences "Superagent"
// just 2 depandansies comming from express and pg 
// 1) dependences 
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
// 2) initial server 
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
// for DB >> we checking errors  if we have it console it // later will handel it 
client.on('error', (err) => console.log(err));
client.connect().then(() => {
    app.listen(PORT, () => console.log('up on', PORT));
  });

//middlewares
//because will dealing with form 
// when I do a POST Request from the Form in the frontend to your Backend request body  undefined unless U do extended: true to get data there 
// it's give me an object that have key value coming from Form
app.use(express.urlencoded({ extended: true }));
// _method >> to make your server listen to delete and update(PUT)  REQUESTS
app.use(methodOverride('_method'));
//because will dealing with public file 
app.use(express.static('./public'));
// to set my view engine
app.set('view engine', 'ejs');

// Api's
// all routes I will using in my App :)
app.get('/',getTasks);
// this enabel our Form to get 
// params (task_id) variabel to give us dynamic route
app.get('/tasks/:task_id', getOneTask);
app.get('/add', getForm);
app.post('/add', addTask);
app.put('/update/:task_id', updateTask);
app.delete('/delete/:task_id', deleteTask);
app.use('*', notFoundHandler);

function getTasks(req, res) {
    const SQL = 'SELECT * FROM tasks;';
    client
      .query(SQL)
      .then((results) => {
          console.log(results);
        res.render('index', { tasks: results.rows });
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
  }

  function getOneTask(req, res) {
    const SQL = 'SELECT * FROM tasks WHERE id=$1;';
    const values = [req.params.task_id];
    client
      .query(SQL, values)
      .then((results) => {
        res.render('pages/detail-view', { task: results.rows[0] });
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
  }
  function getForm(req, res) {
    res.render('pages/add-view');
  }
  function addTask(req, res) {
      console.log('Body',req.body);
      
    const { title, description, category, contact, status } = req.body;
    const SQL =
      'INSERT INTO tasks (title,description,contact,status,category) VALUES ($1,$2,$3,$4,$5);';
    const values = [title, description, contact, status, category];
    client
      .query(SQL, values)
      .then((results) => {
          // render to render new view 
          // redirect >> git request to this path (Go to the get route it will git the data and show it in the home page)
        res.redirect('/');
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
  }
// add task
  function updateTask(req, res) {
    const { title, description, category, contact, status } = req.body;
    const SQL =
      'UPDATE tasks SET title=$1,description=$2,category=$3,contact=$4,status=$5 WHERE id=$6';
    const values = [
      title,
      description,
      category,
      contact,
      status,
      req.params.task_id,
    ];
    client
      .query(SQL, values)
      .then((results) => res.redirect(`/tasks/${req.params.task_id}`))
      .catch((err) => errorHandler(err, req, res));
  }

//   Delete Task
  function deleteTask(req, res) {
    const SQL = 'DELETE FROM tasks WHERE id=$1';
    const values = [req.params.task_id];
    client
      .query(SQL, values)
      .then((results) => res.redirect('/'))
      .catch((err) => errorHandler(err, req, res));
  }

  function notFoundHandler(req, res) {
    res.status(404).send('PAGE NOT FOUND');
  }
  function errorHandler(err, req, res) {
    res.status(500).render('pages/error-view', { error: err });
    // res.status(500).send(err);
  }

  