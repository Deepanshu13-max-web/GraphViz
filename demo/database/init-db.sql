-- File: database/init-db.sql
-- Master script to setup entire database
SOURCE schema.sql;
SOURCE data.sql;
-- Show final status
SELECT 'Database initialized successfully!' as Status;
SELECT CONCAT('Users: ', COUNT(*)) as Info FROM users;
SELECT CONCAT('Graphs: ', COUNT(*)) as Info FROM graphs;