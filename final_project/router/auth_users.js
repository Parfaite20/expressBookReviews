const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "Parfaite", password: "password123" }
];

const isValid = (username) => { //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
  const user = users.find(user => user.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username) && authenticatedUser(username, password)) {

    const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });

    // req.session.authorization = { accessToken };
    req.session.authorization = { accessToken, username }; 

    // return res.status(200).json("Customer successfully logged in", {accessToken});
    return res.status(200).json({ message: "Customer successfully logged in", accessToken });

  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});



// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // return res.status(300).json({message: "Yet to be implemented"});

  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!req.session.authorization || !req.session.authorization.accessToken) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = req.session.authorization.accessToken;
  let username;
  try {
    const decoded = jwt.verify(token, "access");
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json(`The review for the book with ISBN ${isbn} has been added/updated.`);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session.authorization || !req.session.authorization.accessToken) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = req.session.authorization.accessToken;
  let username;
  try {
    const decoded = jwt.verify(token, "access");
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username]; 
      return res.status(200).json( `Review for ISBN ${isbn} posted by user ${username} deleted` );
    } else {
      return res.status(404).json({ message: "No review found for this user" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
