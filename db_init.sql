PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS broadcasts ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,     
    title VARCHAR(64),                  
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    visit_number INT DEFAULT 0,                 
    broadcaster_user_id INT,            
    broadcaster_user_name VARCHAR(64)  
);                                    
CREATE TABLE IF NOT EXISTS watchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT,
    user_name VARCHAR(64),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leaved_at TIMESTAMP,
    broadcast INT,
    FOREIGN KEY (broadcast) REFERENCES broadcasts(id)
);
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text VARCHAR(512),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user INT,
    broadcast INT,
    FOREIGN KEY (broadcast) REFERENCES broadcasts(id),
    FOREIGN KEY (user) REFERENCES watchers(id)
);