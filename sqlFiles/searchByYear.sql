SELECT 
  id,
  title, 
  authors1.author_name AS author1, 
  authors2.author_name AS author2, 
  authors3.author_name AS author3, 
  year, 
  pages, 
  description, 
  image_name, 
  clicks, 
  views, 
  deleted
FROM 
  books_authors
INNER JOIN 
  books ON books_authors.book_id = books.books_id
LEFT JOIN 
  authors AS authors1 ON books_authors.author1_id = authors1.author_id
LEFT JOIN 
  authors AS authors2 ON books_authors.author2_id = authors2.author_id
LEFT JOIN 
  authors AS authors3 ON books_authors.author3_id = authors3.author_id
WHERE 
  year = ?
  AND deleted = 0
