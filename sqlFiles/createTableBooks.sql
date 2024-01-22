CREATE TABLE IF NOT EXISTS books
    (books_id INT PRIMARY KEY AUTO_INCREMENT, 
    title TEXT, 
    title_for_search TEXT,
    year INT, 
    pages INT, 
    description TEXT,
    image_name TEXT,
    clicks INT,
    views INT,
    deleted INT);
