CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  institution_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  institution_id INTEGER NOT NULL,
  invite_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_trainers (
  batch_id INTEGER REFERENCES batches(id),
  trainer_id INTEGER REFERENCES users(id),
  PRIMARY KEY (batch_id, trainer_id)
);

CREATE TABLE IF NOT EXISTS batch_students (
  batch_id INTEGER REFERENCES batches(id),
  student_id INTEGER REFERENCES users(id),
  PRIMARY KEY (batch_id, student_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES batches(id),
  trainer_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  student_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'absent',
  marked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);