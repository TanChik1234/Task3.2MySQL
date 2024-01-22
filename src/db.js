const mysql = require('mysql2');
const fs = require('fs');
const dbname = 'task3_2';

const db = mysql.createConnection({
  host: 'db4free.net',
  port: 3306,
  user: 'tanchik1808',
  password: '395657Tanya',
  database: dbname
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('Подключение к базе данных успешно!');

    // Создайте таблицу, если её нет
    const createTableBooksQuery = fs.readFileSync('sqlFiles/createTableBooks.sql', 'utf8');

    db.query(createTableBooksQuery, (createTableErr) => {
      if (createTableErr) {
        console.error('Ошибка создания таблицы:', createTableErr);
      } else {
        console.log('Таблица Books успешно создана или уже существует');
      }
    });

    const createTableAuthorsQuery = fs.readFileSync('sqlFiles/createTableAuthors.sql', 'utf8');

    db.query(createTableAuthorsQuery, (createTableErr) => {
      if (createTableErr) {
        console.error('Ошибка создания таблицы:', createTableErr);
      } else {
        console.log('Таблица Authors успешно создана или уже существует');
      }
    });

    const createTableBooksAuthorsQuery = fs.readFileSync('sqlFiles/createTableBooksAuthors.sql', 'utf8');

    db.query(createTableBooksAuthorsQuery, (createTableErr) => {
      if (createTableErr) {
        console.error('Ошибка создания таблицы:', createTableErr);
      } else {
        console.log('Таблица Books_Authors успешно создана или уже существует');
      }
    });

  }
});


class User {
  static all(cb) {
      const queryData = fs.readFileSync('sqlFiles/getAllBooksExceptDeleted.sql', 'utf8');
      const queryCount = fs.readFileSync('sqlFiles/countAllBooksExceptDeleted.sql', 'utf8');

      db.query(queryData, function (errData, rows) {
          if (errData) {
              return cb(errData, null, null);
          }
          db.query(queryCount, function (errCount, result) {
              if (errCount) {
                  return cb(errCount, null, null);
              }
              const totalCount = result ? result[0].count : 0;
              cb(null, rows, totalCount);
          });
      });
};
 
  static search(searchText, cb) {
    const parts = searchText.trim().toLowerCase().split(/\s+/);
    const sql = fs.readFileSync('sqlFiles/searchByTitleAndAuthorUser.sql', 'utf8');
    if(parts.length > 1){
      searchComplexText(sql, parts, cb);
    } else {
      searchSimpleText(sql, parts, cb);
    }
    
};

  static searchByYear(year, cb) {
    const sql = fs.readFileSync('sqlFiles/searchByYear.sql', 'utf8');
    db.query(sql, year, cb);
  };

  static searchByAuthorId(author_id, cb) {
    const sql = fs.readFileSync('sqlFiles/searchByAuthorId.sql', 'utf8');
    db.query(sql, [author_id, author_id, author_id], cb);
  }

  static find(id, cb) {
    const sql = fs.readFileSync('sqlFiles/searchByIdUser.sql', 'utf8');
    db.query(sql, id, cb);
  }; 

  static increaseViews(id, cb) {
    const sql = fs.readFileSync('sqlFiles/updateViews.sql', 'utf8');
    db.query(sql, id, cb);
  };

  static increaseClicks(id, cb) {
    const sql = fs.readFileSync('sqlFiles/updateClicks.sql', 'utf8');
    db.query(sql, id, cb);
  };

}

class Admin {
  static getAdminData(cb){
    const sql = fs.readFileSync('sqlFiles/getAdminData.sql', 'utf8');
    db.query(sql, cb);
  }

  static allBooks(cb) {
    const sql = fs.readFileSync('sqlFiles/getAllBooks.sql', 'utf8');
    db.query(sql, cb);
  }

  static search(searchText, cb) {
    const parts = searchText.trim().toLowerCase().split(/\s+/);
    const sql = fs.readFileSync('sqlFiles/searchByTitleAndAuthorAdmin.sql', 'utf8');

    if(parts.length > 1){
      searchComplexText(sql, parts, cb);
    } else {
      searchSimpleText(sql, parts, cb);
    }
  }

  static create(data, cb) {
    const queryAddBookData = fs.readFileSync('sqlFiles/addBookData.sql', 'utf8');
    const queryAddBookAuthorsData = fs.readFileSync('sqlFiles/addBookAuthorsData.sql', 'utf8');
  
    const titleForSearch = `${data.title.toLowerCase()}`;
    const values = [data.title, titleForSearch, data.year, data.pages, data.description, data.image, data.clicks, data.views, 0];
    db.query(queryAddBookData, values, function (errData, result) {
      if (errData) {
        return cb(errData, null, null);
      }
      const authorPromises = [];
  
      authorPromises.push(addAuthor(data.author1));
      if (data.author2) {
        authorPromises.push(addAuthor(data.author2));
      }
      if (data.author3) {
        authorPromises.push(addAuthor(data.author3));
      }
      Promise.all(authorPromises)
        .then(authorIds => {
          let val = [];
          for(let i = 0; i<3; i++){
            val.push(data.title);
            data[`author${i+1}`] ? val.push(data[`author${i+1}`]) : val.push("NULL")
          }
          db.query(queryAddBookAuthorsData, val, cb);
        })
        .catch(err => cb(err, null, null));
    });
  }

  static softDelete(data, cb) {
    if (!data) {
      return cb(new Error('Please provide an id'));
    }
    let id = data.id;
    let del = data.check;
    const sql = fs.readFileSync('sqlFiles/softDeleteBookData.sql', 'utf8');
    db.query(sql, [del, id], cb);
  }

  static sortData(propertyForSorted, sortingOrder, cb) {
    const sql = fs.readFileSync('sqlFiles/getSortedAllBooks.sql', 'utf8');
    const orderByClause = `ORDER BY ${propertyForSorted} ${sortingOrder}`;
    const formattedSql = sql.replace('ORDER BY ? ?', orderByClause);
    db.query(formattedSql, cb);
  }
}

function addAuthor(authorName) {
  const queryAddAuthorData = fs.readFileSync('sqlFiles/addAuthorData.sql', 'utf8');
  const authorValues = [authorName, authorName.toLowerCase(), authorName, authorName.toLowerCase()];
  return new Promise((resolve, reject) => {
    db.query(queryAddAuthorData, authorValues, function (errAuthor, resultAuthor) {
      if (errAuthor) {
        reject(errAuthor);
      } else {
        resolve(resultAuthor.insertId);
      }
    });
  });
}

function searchSimpleText(sqlQuery, text, cb){
  const params = [`%${text}%`,`%${text}%`,`%${text}%`,`%${text}%`];
        db.query(sqlQuery, params, function(errData, result){
          if (errData) {
            return cb(errData, null, null);
          }
          cb(null, result);
        })
}

function searchComplexText(sqlQuery, text, cb){
  let part1 = text.slice(0, -1).join(' ');
  let part2 = text[text.length - 1];
  if(part1.length > 0){
    let params = [`%${part1}%`,`%${part1}%`,`%${part1}%`,`%${part1}%`];
    db.query(sqlQuery, params, function(errData, result1){
      if (errData) {
        return cb(errData, null, null);
      }
      params = [`%${part2}%`,`%${part2}%`,`%${part2}%`,`%${part2}%`];
      db.query(sqlQuery, params, function(errData, result2){
        if (errData) {
          return cb(errData, null, null);
        }
        let allResults = [...result1, ...result2].filter(
          (obj, index, self) => index === self.findIndex((o) => o.id === obj.id)
        );
        cb(null, allResults);
      })
    });
    }  
}

module.exports = db;
module.exports.User = User;
module.exports.Admin = Admin;
