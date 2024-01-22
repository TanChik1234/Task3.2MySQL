UPDATE books
SET books.views = books.views + 1
WHERE books.books_id = (SELECT books_authors.book_id
                        FROM books_authors
                        WHERE books_authors.id = ?);