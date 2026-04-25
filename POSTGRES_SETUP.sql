# PostgreSQL Schema for GEC Portal

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clubs (
  club_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_id INTEGER NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  club_id INTEGER NOT NULL REFERENCES clubs(club_id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  poster_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
  registration_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(event_id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

CREATE TABLE attendance (
  attendance_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(event_id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

CREATE TABLE certificates (
  certificate_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(event_id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  certificate_url VARCHAR(255),
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Seed test users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@gec.ac.in', '$2a$10$..hash_for_Admin123..', 'super_admin'),
('Test Student', 'student@gec.ac.in', '$2a$10$..hash_for_Student123..', 'student'),
('Club Admin', 'clubadmin@gec.ac.in', '$2a$10$..hash_for_ClubAdmin123..', 'club_admin');
