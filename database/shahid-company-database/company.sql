CREATE TABLE
    companies (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(150) NOT NULL,
        company_logo_url TEXT,
        industry VARCHAR(100),
        company_size VARCHAR(50),
        website_url TEXT,
        description TEXT,
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    company_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
        company_id INTEGER NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL DEFAULT 'HR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    jobs (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
        created_by INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
        job_title VARCHAR(200) NOT NULL,
        job_description TEXT NOT NULL,
        employment_type VARCHAR(50),
        work_setting VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        experience_min NUMERIC(4, 1) DEFAULT 0,
        experience_max NUMERIC(4, 1),
        salary_min NUMERIC(12, 2),
        salary_max NUMERIC(12, 2),
        application_deadline DATE,
        status VARCHAR(30) NOT NULL DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    job_skills (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills_master (id) ON DELETE RESTRICT,
        required_level VARCHAR(30) NOT NULL,
        is_required BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (job_id, skill_id)
    );

CREATE TABLE
    job_assessments (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL UNIQUE REFERENCES jobs (id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        instructions TEXT,
        passing_score NUMERIC(5, 2) NOT NULL DEFAULT 70,
        duration_minutes INTEGER DEFAULT 30,
        status VARCHAR(30) NOT NULL DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    job_assessment_questions (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES job_assessments (id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(30) NOT NULL DEFAULT 'MCQ',
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        correct_option VARCHAR(1),
        marks NUMERIC(5, 2) NOT NULL DEFAULT 1,
        question_order INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    applications (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER NOT NULL REFERENCES candidates (id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
        assessment_id INTEGER REFERENCES job_assessments (id) ON DELETE SET NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Applied',
        assessment_score NUMERIC(5, 2),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (candidate_id, job_id)
    );

CREATE TABLE
    job_assessment_attempts (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
        assessment_id INTEGER NOT NULL REFERENCES job_assessments (id) ON DELETE CASCADE,
        candidate_id INTEGER NOT NULL REFERENCES candidates (id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP,
        score NUMERIC(5, 2),
        status VARCHAR(30) NOT NULL DEFAULT 'In Progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    job_assessment_answers (
        id SERIAL PRIMARY KEY,
        attempt_id INTEGER NOT NULL REFERENCES job_assessment_attempts (id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES job_assessment_questions (id) ON DELETE CASCADE,
        selected_option VARCHAR(1),
        is_correct BOOLEAN,
        marks_obtained NUMERIC(5, 2) DEFAULT 0,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (attempt_id, question_id)
    );  