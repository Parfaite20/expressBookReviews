const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  // return res.status(300).json({message: "Yet to be implemented"});

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // return res.status(300).json({message: "Yet to be implemented"});

  return res.status(200).json({books: books});
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // return res.status(300).json({message: "Yet to be implemented"});

  const isbn = req.params.isbn; 
  const book = books[isbn]; 

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
  
 });

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // return res.status(300).json({message: "Yet to be implemented"});

  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  if (booksByAuthor.length > 0) {
    return res.status(200).json({booksByAuthor: booksByAuthor});
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // return res.status(300).json({message: "Yet to be implemented"});

  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title === title);

  if (booksByTitle.length > 0) {
    return res.status(200).json({booksByTitle: booksByTitle});
  } else {
    return res.status(404).json({ message: "No books found by this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // return res.status(300).json({message: "Yet to be implemented"});

  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});



public_users.get('/', async function (req, res) {
  try {
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ data: books });
      }, 1000); 
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    return res.status(500).json({ message: 'Impossible de récupérer la liste des livres', error: error.message });
  }
});


public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve({ data: book });
        } else {
          reject(new Error("Book not found"));
        }
      }, 1000);
    });

    return res.status(200).json(response.data); 
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});


public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
        if (booksByAuthor.length > 0) {
          resolve({ data: booksByAuthor });
        } else {
          reject(new Error("No books found by this author"));
        }
      }, 1000);
    });

    return res.status(200).json( response.data);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});


public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
        if (booksByTitle.length > 0) {
          resolve({ data: booksByTitle }); 
        } else {
          reject(new Error("No books found by this title")); 
        }
      }, 1000); 
    });

    return res.status(200).json(response.data); 
  } catch (error) {
    return res.status(404).json({ message: error.message }); 
  }
});


module.exports.general = public_users;
