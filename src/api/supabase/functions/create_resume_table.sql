-- SQL command to create the resumes table
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_user_id ON resumes(user_id);

-- Function to upload a resume
CREATE OR REPLACE FUNCTION upload_resume(user_id UUID, file_path TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO resumes (user_id, file_path) VALUES (user_id, file_path);
END;
$$ LANGUAGE plpgsql;

-- Function to delete a resume
CREATE OR REPLACE FUNCTION delete_resume(resume_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM resumes WHERE id = resume_id;
END;
$$ LANGUAGE plpgsql;
