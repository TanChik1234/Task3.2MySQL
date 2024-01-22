
import express, {Request, Response} from 'express';
const User = require("./db").User;
const Admin = require("./db").Admin;

export class MyMethods{
/**
 * The method is responsible for sending data about books according to a specific filter,
 * excluding those marked for deletion.
 * @param req user request
 * @param res user response
 * @param limit limit (maximum number of books to send information to the user)
 * @param decodedText specific text to search for the required books
 */
  static sendSearchDataExceptMarkedForDeletion(req:Request, res:Response, limit:number, decodedText:string){
    const offset = Number(req.query.offset) || 0;
    User.search(decodedText, (err:Error, books:any) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        return JSON.stringify({ success:false, msg: 'Помилка при пошуку' });
      }
      limit = Math.min(limit, (books.length-offset));
      sendResponseDataForUser(res, books, books.length, decodedText, offset, limit);
    })
  }

/**
 * The method is responsible for sending data about all books, excluding those marked for deletion.
 * @param req user request
 * @param res user response
 * @param filter a specific filter by which books will be filtered
 * @param offset the index of the first book whose data will be sent to the user
 * @param limit limit (maximum number of books to send information to the user)
 */
  static sendAllDataExceptMarkedForDeletion(req:Request, res:Response,filter:string, offset:number, limit:number){
    User.all((err:Error, books:any, totalAmount:number) => {
      if(err){
        res.status(500).send(JSON.stringify({success:false, msg:err}));
        return;
      }
      sendResponseDataForUser(res, books, totalAmount, filter, offset, limit);
    })
  }

/**
 * The method is responsible for sending data about books of a specific release year, excluding those marked for deletion.
 * @param req - User request.
 * @param res - User response.
 * @param limit - Limit (maximum number of books to send information to the user).
 * @param year - The release year of the books being searched.
 */

  static sendDataAboutBooksSpecificYear(req:Request, res:Response, limit: number, year:number){
    const offset = Number(req.query.offset) || 0;
    User.searchByYear(year, (err:Error, books:any) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        return JSON.stringify({ success:false, msg: 'Помилка при пошуку' });
      }
      limit = Math.min(limit, (books.length-offset));
      sendResponseDataForUser(res, books, books.length, `year$${year}`, offset, limit);
    })
  }

/**
 * The method is responsible for sending data about books written by a specific author, excluding those marked for deletion.
 * @param req - User request.
 * @param res - User response.
 * @param limit - Limit (maximum number of books to send information to the user).
 * @param authorId - The identifier of the author whose books we are searching for.
 */
  static sendDataAboutBooksSpecificAuthorID(req:Request, res:Response, limit: number, authorId:number){
    const offset = Number(req.query.offset) || 0;
    User.searchByAuthorId(authorId, (err:Error, books:any) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        return JSON.stringify({ success:false, msg: 'Помилка при пошуку' });
      }
      limit = Math.min(limit, (books.length-offset));
      sendResponseDataForUser(res, books, books.length, `authorId$${authorId}`, offset, limit);
    })
  }

/**
 * The method is responsible for sending data about a book with a specific identifier.
 * @param res user response
 * @param bookId book identifier
 */
  static sendDataAboutOneBook(res:Response, bookId:string){
    User.find(bookId, (err:Error, book:any) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        res.send(JSON.stringify({success:false, msg: err}));
        return;
      }
      if(!book){
        console.log("Book not found");
        return res.status(404).json({ success:false, msg: 'Книга не найдена' });
      }
      let responseData = {
        "data": {
          "id": book[0].id,
          "title": book[0].title,
          "author1": book[0].author1,
          "authorID1": book[0].author1_id,  
          "author2": book[0].author2,
          "authorID2": book[0].author2_id,  
          "author3": book[0].author3,
          "authorID3": book[0].author3_id,
          "year": book[0].year,
          "pages": book[0].pages,
          "isbn": "",
          "description": book[0].description,
          "image": book[0].image_name,
          "event": Boolean(book[0].deleted)
        },
        success: true,
      }
      res.json(responseData);
    })
  }

/**
 * The method is responsible for sending data about all books, including those marked for deletion.
 * @param res admin response to the request
 */
  static sendDataAboutAllBooks(res:Response){
    Admin.allBooks((err:Error, books:any) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        res.send(JSON.stringify({success:false, msg: err}));
        return;
      }
      sendResponseDataForAdmin(res, books);
    })
  }

/**
 * The method is responsible for sending sorted data about all books, including those marked for deletion.
 * @param property - The property by which the data is sorted.
 * @param sortingOrder - The sorting order of the data.
 * @param res - Admin response to the request.
 */
  static sendSortedDataAboutAllBooks(property:string, sortingOrder:string, res:Response){
    Admin.sortData(property, sortingOrder, (err:Error, books:any) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        res.send(JSON.stringify({success:false, msg: err}));
        return;
      }
      sendResponseDataForAdmin(res, books);
    })
  }

  /**
 * The method is responsible for sending data about books according to a specific filter,
 * including those marked for deletion.
 * @param req admin request
 * @param res admin response to the request
 * @param decodedText specific text to search for the required books
 */
  static sendDataAboutSearchBooks(res:Response, decodedText:string){
    Admin.search(decodedText, (err:Error, books:any) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        return JSON.stringify({ success:false, msg: 'Помилка при пошуку' });
      }
      sendResponseDataForAdmin(res, books);
    })
  }

/**
 * The method is responsible for marking a book for future deletion.
 * @param req admin request with book data
 * @param res admin response to the request
 */
  static markBookForDeletion(req:Request, res:Response){
    Admin.softDelete(req.body, (err:Error)=>{
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        res.status(500).send(JSON.stringify({ error: err }));
        return;
      }
      res.send({ok: true, msg: "Software removal was successful."})
    })
  }

/**
 * The method is responsible for adding a book to the database.
 * @param req admin request
 * @param res admin response to the request
 */
  static async addBookToTheDatabase(req:Request, res:Response){
    console.log(`Server addBook`);
    const uploadedFile = req.file;
    await Admin.create(generateDataForNewBook(req), (err: Error) => {
      if (err) {
        console.log(`Произошла ошибка: ${err}`);
        res.status(500).send(JSON.stringify({ error: err }));
        return;
      };
    });
  
    if (!uploadedFile) {
      console.log("Error upload");
      res.status(400).send('Ошибка загрузки файла.');
      return;
    }
    res.redirect("http://localhost:3000/admin");
  }
}

/**
 * The method is responsible for aggregating data about books into a single object for convenient user transmission.
 * @param res user response
 * @param books array of book data
 * @param amount total number of books
 * @param filter a specific filter by which books will be filtered
 * @param offset the index of the first book whose data will be sent to the user
 * @param limit limit (maximum number of books to send information to the user)
 */
function sendResponseDataForUser(res:Response, books: [], amount:number, filter: string, offset:number, limit:number){
  let responseData = {
      "data": {
        "books": books.slice(offset, limit+offset),  
        "total": {
          "amount": amount
        },
        "filter": filter,
        "offset": offset,
        "limit": limit
      },
      success: true,
    }

    res.json(responseData)
}

/**
 * The method is responsible for aggregating data about books into a single object for convenient admin transmission.
 * @param res admin response
 * @param books array of book data
 */
function sendResponseDataForAdmin(res:Response, books:[]){
  let responseData = {
    "data": {
      "books": books,
      "total": {
        "amount": books.length
      },
    },
    success: true,
  }
  res.json(responseData);
}

/**
 * The method is responsible for consolidating data about a new book into a single object for further use.
 * @param req admin request
 * @returns an object with all the data about the book
 */
function generateDataForNewBook(req: Request){
  const bookData = {
    title: req.body.inputTitle,
    author1: req.body.inputAuthor1,
    author2: req.body.inputAuthor2,
    author3: req.body.inputAuthor3,
    year: req.body.inputYear,
    pages: req.body.inputPages,
    description: req.body.inputDescription,
    deleted: false,
    image: req.file?.filename,
    clicks: 0,
    views: 0
  }

  console.log(`Server generateData ${bookData}`);
  return bookData;
}

