CREATE TABLE IF NOT EXISTS books_authors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT,
    author1_id INT,
    author2_id INT,
    author3_id INT,
    FOREIGN KEY (book_id) REFERENCES books (books_id),
    FOREIGN KEY (author1_id) REFERENCES authors (author_id),
    FOREIGN KEY (author2_id) REFERENCES authors (author_id),
    FOREIGN KEY (author3_id) REFERENCES authors (author_id)
);
