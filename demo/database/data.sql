-- File: database/data.sql
USE graph_visualizer;
-- Insert multiple users
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@graphviz.com',
'$2a$10$Nk9XqXqXqXqXqXqXqXqXqOuOqXqXqXqXqXqXqXqXqXqXqXqXqXq'),
('Demo User', 'demo@graphviz.com',
'$2a$10$Nk9XqXqXqXqXqXqXqXqXqOuOqXqXqXqXqXqXqXqXqXqXqXqXqXq');
-- Insert sample graphs
INSERT INTO graphs (name, graph_data, user_id) VALUES
('BFS Example',
'{"nodes":[{"id":"1","label":"A","x":200,"y":100},{"id":"2","label":"B","x":100,"y":200},{"id":"3","label":
"C","x":300,"y":200},{"id":"4","label":"D","x":200,"y":300}],"edges":[{"source":"1","target":"2","weig
ht":1},{"source":"1","target":"3","weight":1},{"source":"2","target":"4","weight":1},{"source":"3","tar
get":"4","weight":1}]}', 2),
('Dijkstra Example',
'{"nodes":[{"id":"1","label":"A","x":150,"y":150},{"id":"2","label":"B","x":300,"y":100},{"id":"3","label":
"C","x":300,"y":200},{"id":"4","label":"D","x":450,"y":150}],"edges":[{"source":"1","target":"2","weig
ht":4},{"source":"1","target":"3","weight":2},{"source":"2","target":"3","weight":1},{"source":"2","tar
get":"4","weight":5},{"source":"3","target":"4","weight":8}]}', 2);
Comme