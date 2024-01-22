-- Вставка автора
INSERT INTO authors (author_name, author_name_for_search) 
SELECT ?, ?
FROM dual
WHERE NOT EXISTS (
    SELECT author_id FROM authors 
    WHERE author_name = ? AND author_name_for_search = ?
);
