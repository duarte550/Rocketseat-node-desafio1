const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const flag = users.find((user) => user.username === username);
  
  if (!flag){
    return response.status(404).json({error: "Username does not exist"})
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username} = request.body;
  const flag = users.find((user) => user.username === username);
  if(flag){
    return response.status(400).json({error: "Username already exists"})
  }
  id = uuidv4()
  user = {id,
          name,
          username,
          todos: []
  }
  users.push(user)
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const{ username} = request.headers;
  const{ user} = request;

  if(user){
    return response.status(200).json(user.todos)
  }

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const{ username} = request.headers;
  const newTask = {id: uuidv4(),
                    title,
                    deadline: new Date(deadline),
                    created_at: new Date(),
                    done: false}
  users.find((user) => user.username === username).todos.push(newTask);
  return response.status(201).json(newTask)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const{id}= request.params;
  const {title, deadline} = request.body;
  const{ user} = request;

  
  const newDeadline = new Date(deadline)
  const newTitle = title
  const task = user.todos.find((task) => task.id === id)

  if(!task){
      return response.status(404).json({error: "This task id does not exist"})
  }
  task.deadline = newDeadline;
  task.title = newTitle;
  return response.status(201).json(task);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const{id}= request.params;
  const{ user} = request;

  const task = user.todos.find((task) => task.id === id)
  if(!task){
      return response.status(404).json({error: "This task id does not exist"})
  }
  task.done = true;
  return response.status(201).json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const{id}= request.params;
  const{ user} = request;

  const task = user.todos.find((task) => task.id === id)
  if(!task){
    return response.status(404).json({error: "This task id does not exist"})
  }
  user.todos.splice(task,1)
  return response.status(204).send();

});

module.exports = app;