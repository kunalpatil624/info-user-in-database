const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require('method-override');
const { connect } = require('http2');

app.use(methodOverride('_method')); // methode overrride use to patch and delet requists
app.use(express.urlencoded({extended: true}));

app.set("view engine", "views");
app.set("views",path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_student',
    password: 'Kunal@626511'
  });

//   let getRandomUser = () => {
//     return [
//       faker.date.birthdate(),
//       faker.date.past(),
//     ];
//   }

//   let date = [];
//   for(let i=1; i<=106; i++)
//   {
//     date.push(getRandomUser());
//     // console.log(getRandomUser());

//   }

// let query = `INSERT INTO user(birthdate,registeredAt) VALUES {date} ?`;
// connection.query(query,(err, result) => {
//   console.log(result);
// })

app.listen(port, () => {
  console.log(`servire is listening ${port}`);
});


// HOME rout
app.get("/", (req,res) => {
  try{
    let query = "SELECT COUNT(*) FROM user"
    connection.query(query, (err, result) => {
      if(err) throw err;
      let count = result[0]['COUNT(*)'];
      res.render("index.ejs",{count});
    })
  }
  catch(err){
    console.log(err);
    res.send(err);
    }
  }
)
// this are only created to redirect process
app.get("/users", (req,res) => {
  try{
    let query = "SELECT * FROM user"
    connection.query(query, (err, users) => {
      if(err) throw err;
      res.render("showusers.ejs",{users});
    })
  }
  catch(err){
    console.log(err);
    res.send(err);
    }
  }
)

// SHOW USER rout
app.post("/users", (req, res) => {
  // try{
    let {username : newUsername, password : formPass} = req.body;
    let query1 = `SELECT * FROM user WHERE username =  '${newUsername}' AND password = '${formPass}'`;
    try{
      connection.query(query1, (err, result) => {
        if(err) throw err;
        let user = result[0];
        if(user == null)
        {
          res.send("WRONG USERNAME OR PASSWORD.!");
        }
        else{
          let query = "SELECT * FROM user";
          try{
            connection.query(query, (err, users) => {
              if(err) throw err;
              res.render("showusers.ejs",{users});
            })
          }
          catch(err){
            res.send(err);
          }
        }
      })
    }catch(err){
      res.send(err);
    }
    // let query = "SELECT * FROM user"
    // connection.query(query, (err, users) => {
    //   if(err) throw err;
    //   res.render("showusers.ejs",{users});
    })
  // }
  // catch(err){
  //   console.log(err);
  //   res.send(err);
  //   }
// })

// EDIT rout
app.get("/user/:id/edit", (req, res) => {
  try{
    let {id} = req.params;
    let query = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(query, (err, result) => {
      if(err) throw err;
      let user = result[0];
      console.log(user);
      res.render("edit.ejs",{user});
    })
  }
  catch(err){
    console.log(err);
    res.send(err);
    }
})

// DB update rout
app.patch("/user/:id", (req,res) => {
  let {id} = req.params;
  let {username : newUsername, password : formPass} = req.body;
  let query = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(query, (err, result) => {
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("WRONG PASSWORD.!");
      }else{
        let query = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}' `;
        connection.query(query, (err, result) => {
          if(err) throw err;
          res.redirect("/users");
        })
      }
    })
  }
  catch(err){
    console.log(err);
    res.send(err);
    }
})


// add rout
app.get("/user/new", (req,res) => {
  res.render("new.ejs");
})

app.post("/user/new", (req,res) => {
  let {id, username, email, password} = req.body;
  try{
    let query = `INSERT INTO user(id, username, email, password) VALUES ('${id}', '${username}', '${email}', '${password}')`;
    connection.query(query, (err, result) => {
      if(err) throw err;
      res.redirect("/users");
    })
  }catch(err){
    console.log(err);
  }
})

app.get("/user/:id/delete", (req,res) => {
  let {id} = req.params;
  let query = `SELECT * FROM user WHERE id = '${id}' `;
  try{
    connection.query(query, (err,result) => {
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs",{user});
      console.log(user);
    })
  }
  catch(err){
    console.log(err);
    res.send("Some err in db");
  }
})

app.delete("/user/:id", (req,res) => {
  let {id} = req.params;
  let {username,password} = req.body;
  try{
    let query = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(query, (err, result) => {
      let user = result[0];
      if(err) throw err;
      console.log(result);
      if(user.password != password && user.username != username)
      {
        res.send("wrong password or username.!");
      }
      else{
        let query = `DELETE FROM user WHERE username = '${user.username}' AND password = '${user.password}'`;
        connection.query(query, (err,result) => {
          res.redirect("/users");
        })
      }
    })
  }
  catch(err){
    res.send("some error in db.!");
  }
})