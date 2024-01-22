-- Вставка зв'язку між книгою і авторами
INSERT INTO books_authors (book_id, author1_id, author2_id, author3_id)
SELECT b.books_id, a1.author_id, a2.author_id, a3.author_id
FROM books b
JOIN authors a1 ON b.title = ? AND a1.author_name = ?
LEFT JOIN authors a2 ON b.title = ? AND a2.author_name = ?
LEFT JOIN authors a3 ON b.title = ? AND a3.author_name = ?;
-- INSERT INTO books_authors (book_id, author1_id, author2_id, author3_id) VALUES
-- (?,?, ?, ?);


-- INSERT INTO books_authors (book_id, author1_id, author2_id, author3_id)
-- SELECT b.books_id, a1.author_id, a2.author_id, a3.author_id
-- FROM books b
-- JOIN authors a1 ON b.title = '' AND a1.author_name = ''
-- LEFT JOIN authors a2 ON b.title = '' AND a2.author_name = ''
-- LEFT JOIN authors a3 ON b.title = '' AND a3.author_name = '';