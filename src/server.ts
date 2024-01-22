import express, {Request, Response} from 'express';
import session from 'express-session';
const FileStore = require('session-file-store')(session);
import * as fs from 'fs';
import * as path from 'path';
import bodyParser, { json } from 'body-parser';
import cors from 'cors';
const User = require("./db").User;
const Admin = require("./db").Admin;
import basicAuth from 'basic-auth';
import multer from 'multer';
import {MyMethods} from './helpers'


const app = express();
const port = 3000;

/*
 * The rules for saving uploaded files are defined: they will be stored in the specified 
 * directory (uploadFolder), and their names will be unique, incorporating a timestamp 
 * and the original file extension.
 */
const uploadFolder = 'public/uploads/'
const storage = multer.diskStorage({
  destination: (req:Request, file:any, cb:Function) => {
    cb(null, uploadFolder);
  },
  filename: (req:Request, file:any, cb:Function) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage: storage });

/*
The folder where session files are stored. 
If the folder is absent at the time of server startup, a new folder is created with the specified name. 
*/
const sessionDirectory = "./sessions";
if (!fs.existsSync(sessionDirectory)) {
  fs.mkdirSync(sessionDirectory);
}

// Middleware for basic authentication. 
const auth = (req:Request, res:Response, next:Function) => {
  Admin.getAdminData((err:Error, data:any) => {
    if (err) {
      console.log(`Произошла ошибка: ${err}`);
      res.send(JSON.stringify({error: err}));
      return;
    }
    const user = basicAuth(req);
    //  Verification of entered username and password. 
    if (!user) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      console.log(`!user`);
      return res.sendStatus(401);
    }
    //Validation of the correctness of the provided credentials.
    let isTrueData = false;
    for(let item of data){
      if(user.name === item.login && user.pass === item.password){
        isTrueData = true;
        break;
      }
    }

    if(!isTrueData){
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      console.log(`!isTrueData`);
      return res.sendStatus(401);
    }

    next();
  })
};

//Middlewares, which operates between request processing and response sending.
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(upload.single('customFile'));
app.use(express.json());
app.use(cors({ 
  credentials: true, 
  origin: `http://localhost:${port}` 
}));
app.use(express.static("public"));
app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css'));

app.use(
  session({
    store: new FileStore({
      path: sessionDirectory,
      ttl: 86400
    }),
    secret: "secret mikky mouse",
    resave: true,
    saveUninitialized: true,
    cookie: {},
  })
);

//Handling a request to retrieve the user page.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../views/books-page.html"))
})
//Handling a request to retrieve the admin page.
app.get('/admin', auth, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin.html"))
})
//Handling a request to retrieve data about books that are not marked for deletion. 
//Books can be filtered by title or author.
app.get('/books', (req, res) => {
  const limit = Number(req.query.limit);
  if(req.query.search){
    const encodedText = req.query.search as string;
    const decodedText = decodeURIComponent(encodedText);
    MyMethods.sendSearchDataExceptMarkedForDeletion(req, res, limit, decodedText);
    return;
  }
  if(req.query.year){
    const year = +req.query.year;
    MyMethods.sendDataAboutBooksSpecificYear(req, res, limit, year);
    return;
  }
  if(req.query.author){
    const authorID = +req.query.author;
    MyMethods.sendDataAboutBooksSpecificAuthorID(req, res, limit, authorID);
    return;
  }

  const filter = req.query.filter as string;

  if(filter !== "new"){
    MyMethods.sendSearchDataExceptMarkedForDeletion(req, res, limit, filter);
    return;
  }

  const offset = Number(req.query.offset) || 0;
  MyMethods.sendAllDataExceptMarkedForDeletion(req, res, filter, offset, limit);
})
//Handling a request to retrieve the search page.
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, "../views/books-page.html"));
})

app.get('/sort', (req, res) => {
  // console.log('get sort');
  res.sendFile(path.join(__dirname, "../views/books-page.html"));
})

//Handling a request to retrieve the identifier page.
app.get('/book/:id', (req, res) => {
  const bookId = req.params.id;
  if (!bookId) {
    return res.status(404).json({ error: 'Книга не найдена' });
  }
  User.increaseViews(bookId, (err:Error)=>{
    if (err) {
      console.log(`Произошла ошибка: ${err}`);
      res.status(500).send(JSON.stringify({ error: err }));
      return;
    }
  });
  res.sendFile(path.join(__dirname, "../views/book-page.html"));
})
//Handling a request to retrieve data about a specific book with a given identifier.
app.get('/books/:id', (req, res) => {
  // console.log(` server GET bookID ${req.params.id}`);
  const bookId = req.params.id;
  if (!bookId) {
    return res.status(404).json({ success:false, msg: 'Книга не найдена' });
  }
  MyMethods.sendDataAboutOneBook(res, bookId);
})
//Handling a request to retrieve data about all books, including those marked for deletion.
app.get('/admin/books', (req, res) => {
  MyMethods.sendDataAboutAllBooks(res);
})
//Handling a request to mark a book for future deletion.
app.post('/admin/deleteBook', (req, res) => {
  MyMethods.markBookForDeletion(req,res);
})
//Handling a request to add a book to the database.
app.post("/admin/addBook", (req, res) => {
  MyMethods.addBookToTheDatabase(req, res);
});
//Handling a request to retrieve data about books filtered by title or author 
//(including those marked for deletion).
app.get('/admin/search', (req, res) => {
  const encodedText = req.query.search as string;
  const decodedText = decodeURIComponent(encodedText);
  MyMethods.sendDataAboutSearchBooks(res, decodedText);
})
//Handling a request to increase the number of clicks on the "Want to Read" 
//button for a specific book.
app.post('/book/increaseClicks/', (req, res) => {
  let bookId = req.body.id;
  User.increaseClicks(bookId, (err:Error)=>{
    if (err) {
      console.log(`Произошла ошибка: ${err}`);
      res.status(500).send(JSON.stringify({ error: err }));
      return;
    }
  });
})

//Handling the request to retrieve sorted data
app.get('/admin/sort/:propertyForSort', (req, res) => {
  let property = req.params.propertyForSort;
  let sortingOrder = req.query.sortingOrder as string;
  if (!property) {
    return res.status(404).json({ success:false, msg: 'Сортування за данною властивістю не можливе'});
  }
  MyMethods.sendSortedDataAboutAllBooks(property, sortingOrder, res);
})


app.listen(port, () => {
  console.log(`Server on http://localhost:${port}/`);
});

