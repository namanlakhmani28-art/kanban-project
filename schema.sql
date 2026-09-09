-- Database Creation
CREATE DATABASE IF NOT EXISTS kanban_os;
USE kanban_os;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS columns;

SET FOREIGN_KEY_CHECKS = 1;




-- COLUMN TABLE 
CREATE TABLE columns (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(50) NOT NULL UNIQUE,
    position INT NOT NULL,        -- Column display order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




-- TASKS TABLE
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    title VARCHAR(100) NOT NULL, 
    description TEXT,

    -- OS Process Metrics
    burst_time INT NOT NULL DEFAULT 1,   -- execution time
    priority INT NOT NULL DEFAULT 3,


    -- Foreign key to columns
    column_id INT NOT NULL,
    position INT NOT NULL DEFAULT 0,


    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,


    -- Constraints
    CONSTRAINT fk_tasks_columns
        FOREIGN KEY (column_id) REFERENCES columns(id)
        ON DELETE CASCADE,


    -- Performance Indexes
    INDEX idx_column_id (column_id),
    INDEX idx_priority (priority),
    INDEX idx_burst_time (burst_time),
    INDEX idx_position(position),
    INDEX idx_column_position (column_id, position)

) ENGINE=InnoDB DEFAULT charset=utf8mb4;



INSERT INTO columns (name, position) VALUES
('To Do', 1),       
('In Progress', 2),   
('Done', 3);

INSERT INTO tasks (title, description, burst_time, priority, column_id, position) VALUES
('Set up MySQL Database', 'Execute schema.sql and verify table creation.', 2, 1, 1, 0),
('Build Flask REST API', 'Implement task CRUD routes using Blueprints.', 5, 2, 1, 1),
('Integrate Drag and Drop', 'Add JavaScript drag events to move cards.', 3, 3, 2, 0),
('Configure DB Connection', 'Store credentials in config.py and test.', 1, 1, 1, 2); -- Fixed column_id from 4 to 1