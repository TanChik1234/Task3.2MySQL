UPDATE books
SET deleted = ? WHERE books_id = (SELECT book_id FROM books_authors WHERE id = ?)