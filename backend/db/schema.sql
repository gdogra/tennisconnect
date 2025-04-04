-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'player',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  player1_id INTEGER REFERENCES users(id),
  player2_id INTEGER REFERENCES users(id),
  date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  player1_score INTEGER,
  player2_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create challenge_requests table
CREATE TABLE IF NOT EXISTS challenge_requests (
  id SERIAL PRIMARY KEY,
  challenger_id INTEGER REFERENCES users(id),
  challenged_id INTEGER REFERENCES users(id),
  proposed_date TIMESTAMP NOT NULL,
  proposed_location VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  match_id INTEGER REFERENCES matches(id),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user
INSERT INTO users (username, email, password, role)
VALUES (
  'admin', 
  'admin@tennisconnect.com', 
  '$2b$10$rIC/ORGzlRcGQ1VwFHLEbOiFGR/6FKhMXHeBkD5a.Ot8eNfZlS4Hy', -- password: admin123
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample players
INSERT INTO users (username, email, password, role)
VALUES 
  ('john_doe', 'john@example.com', '$2b$10$rIC/ORGzlRcGQ1VwFHLEbOiFGR/6FKhMXHeBkD5a.Ot8eNfZlS4Hy', 'player'),
  ('jane_smith', 'jane@example.com', '$2b$10$rIC/ORGzlRcGQ1VwFHLEbOiFGR/6FKhMXHeBkD5a.Ot8eNfZlS4Hy', 'player'),
  ('mike_wilson', 'mike@example.com', '$2b$10$rIC/ORGzlRcGQ1VwFHLEbOiFGR/6FKhMXHeBkD5a.Ot8eNfZlS4Hy', 'player'),
  ('sarah_johnson', 'sarah@example.com', '$2b$10$rIC/ORGzlRcGQ1VwFHLEbOiFGR/6FKhMXHeBkD5a.Ot8eNfZlS4Hy', 'player'),
  ('david_brown', 'david@example.com', '$2b$10$rIC/ORGzlRcGQ1VwFHLEbOiFGR/6FKhMXHeBkD5a.Ot8eNfZlS4Hy', 'player')
ON CONFLICT (email) DO NOTHING;

-- Insert sample matches (completed)
INSERT INTO matches (player1_id, player2_id, date, location, status, player1_score, player2_score)
VALUES 
  (2, 3, NOW() - INTERVAL '3 days', 'West Side Tennis Club', 'completed', 6, 4),
  (3, 4, NOW() - INTERVAL '7 days', 'East End Tennis Center', 'completed', 3, 6),
  (2, 4, NOW() - INTERVAL '14 days', 'Central Tennis Court', 'completed', 7, 5),
  (5, 3, NOW() - INTERVAL '10 days', 'Downtown Tennis Club', 'completed', 6, 3),
  (4, 6, NOW() - INTERVAL '5 days', 'Riverside Tennis Center', 'completed', 4, 6)
ON CONFLICT DO NOTHING;

-- Insert sample scheduled matches
INSERT INTO matches (player1_id, player2_id, date, location, status)
VALUES 
  (2, 5, NOW() + INTERVAL '2 days', 'Central Tennis Court', 'scheduled'),
  (3, 6, NOW() + INTERVAL '5 days', 'West Side Tennis Club', 'scheduled')
ON CONFLICT DO NOTHING;

-- Insert sample challenge requests (pending)
INSERT INTO challenge_requests (challenger_id, challenged_id, proposed_date, proposed_location, status, message)
VALUES
  (2, 6, NOW() + INTERVAL '7 days', 'Downtown Tennis Club', 'pending', 'Would you be available for a match next week?'),
  (5, 3, NOW() + INTERVAL '10 days', 'East End Tennis Center', 'pending', 'I'd like to challenge you to a rematch!')
ON CONFLICT DO NOTHING;

-- Insert sample challenge requests (accepted with corresponding matches)
INSERT INTO matches (player1_id, player2_id, date, location, status)
VALUES 
  (4, 2, NOW() + INTERVAL '3 days', 'Riverside Tennis Center', 'scheduled')
ON CONFLICT DO NOTHING;

INSERT INTO challenge_requests (challenger_id, challenged_id, proposed_date, proposed_location, status, match_id, message)
VALUES
  (4, 2, NOW() + INTERVAL '3 days', 'Riverside Tennis Center', 'accepted', 
   (SELECT id FROM matches WHERE player1_id = 4 AND player2_id = 2 AND date > NOW() ORDER BY date LIMIT 1),
   'Looking forward to our match!')
ON CONFLICT DO NOTHING;

-- Insert sample challenge requests (declined)
INSERT INTO challenge_requests (challenger_id, challenged_id, proposed_date, proposed_location, status, message)
VALUES
  (3, 5, NOW() + INTERVAL '4 days', 'Central Tennis Court', 'declined', 'Sorry, I have another commitment that day.'),
  (6, 4, NOW() + INTERVAL '6 days', 'West Side Tennis Club', 'declined', 'I'll be out of town that weekend.')
ON CONFLICT DO NOTHING;
