#!/bin/bash

# Параметры подключения к серверу MySQL
mysql_user="tanchik1808"
mysql_password=""
mysql_database="task3_2"
mysql_host="db4free.net"
mysql_port=3306

# Путь, куда будет сохранено резервное копирование
backup_path="/home/user/Projects node.js/Task3.2/backupMySQL"

# Имя файла резервной копии с датой и временем
backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"

# Команда для создания резервной копии 
mysqldump -h"$mysql_host" -P"$mysql_port" -u"$mysql_user" -p"$mysql_password" "$mysql_database" > "$backup_path/$backup_file"

# Команды для удаления строк с определенным значением в ячейке 
mysql -h"$mysql_host" -P"$mysql_port" -u"$mysql_user" -p"$mysql_password" "$mysql_database" -e "DELETE FROM books_authors WHERE book_id IN (SELECT books_id FROM books WHERE deleted = 1);"
mysql -h"$mysql_host" -P"$mysql_port" -u"$mysql_user" -p"$mysql_password" "$mysql_database" -e "DELETE FROM books WHERE deleted = 1;"
mysql -h"$mysql_host" -P"$mysql_port" -u"$mysql_user" -p"$mysql_password" "$mysql_database" -e "DELETE FROM authors
WHERE NOT EXISTS (
    SELECT 1
    FROM books_authors
    WHERE 
        books_authors.author1_id = authors.author_id OR
        books_authors.author2_id = authors.author_id OR
        books_authors.author3_id = authors.author_id
);"
