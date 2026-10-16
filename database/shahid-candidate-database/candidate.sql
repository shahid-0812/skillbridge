    -- ============================================================
    -- ACADEMIA PORTAL
    -- CANDIDATE DATABASE - FROM SCRATCH
    -- ============================================================
    -- ============================================================
    -- 1. USERS
    -- Account / authentication information
    -- ============================================================
    CREATE TABLE
        users (
            id BIGSERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

    -- ============================================================
    -- 2. CANDIDATES
    -- Main candidate profile
    -- ============================================================
    CREATE TABLE
        candidates (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL UNIQUE,
            profile_photo_url TEXT,
            professional_headline VARCHAR(255),
            phone_number VARCHAR(30),
            country VARCHAR(100),
            state VARCHAR(100),
            city VARCHAR(100),
            professional_summary TEXT,
            resume_url TEXT,
            linkedin_url TEXT,
            github_url TEXT,
            personal_website_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_candidates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

    -- ============================================================
    -- 3. CANDIDATE EDUCATION
    -- Multiple education records per candidate
    -- ============================================================
    CREATE TABLE
        candidate_education (
            id BIGSERIAL PRIMARY KEY,
            candidate_id BIGINT NOT NULL,
            education_level VARCHAR(100) NOT NULL,
            degree_name VARCHAR(255) NOT NULL,
            institution_name VARCHAR(255) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            score NUMERIC(6, 2),
            score_type VARCHAR(50),
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_education_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT chk_education_dates CHECK (
                end_date IS NULL
                OR end_date >= start_date
            ),
            CONSTRAINT chk_education_score CHECK (
                score IS NULL
                OR score >= 0
            ),
            CONSTRAINT chk_education_score_type CHECK (
                score_type IS NULL
                OR score_type IN ('CGPA', 'Percentage')
            )
        );

    -- ============================================================
    -- 4. PROJECTS
    -- Multiple projects per candidate
    -- ============================================================
    CREATE TABLE
        projects (
            id BIGSERIAL PRIMARY KEY,
            candidate_id BIGINT NOT NULL,
            project_name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            role VARCHAR(255) NOT NULL,
            technologies_used TEXT,
            start_date DATE,
            end_date DATE,
            project_url TEXT,
            team_size INTEGER,
            is_academic_project BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_projects_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT chk_project_dates CHECK (
                start_date IS NULL
                OR end_date IS NULL
                OR end_date >= start_date
            ),
            CONSTRAINT chk_project_team_size CHECK (
                team_size IS NULL
                OR team_size > 0
            )
        );

    -- ============================================================
    -- 5. INTERNSHIPS
    -- Multiple internships per candidate
    -- ============================================================
    CREATE TABLE
        internships (
            id BIGSERIAL PRIMARY KEY,
            candidate_id BIGINT NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            is_current BOOLEAN NOT NULL DEFAULT FALSE,
            location VARCHAR(255),
            work_setting VARCHAR(50),
            technologies_used TEXT,
            certificate_url TEXT,
            internship_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_internships_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT chk_internship_dates CHECK (
                end_date IS NULL
                OR end_date >= start_date
            ),
            CONSTRAINT chk_internship_work_setting CHECK (
                work_setting IS NULL
                OR work_setting IN ('Remote', 'Hybrid', 'On-site')
            ),
            CONSTRAINT chk_current_internship CHECK (
                (
                    is_current = TRUE
                    AND end_date IS NULL
                )
                OR (is_current = FALSE)
            )
        );

    -- ============================================================
    -- 6. WORK EXPERIENCE
    -- Multiple work experience records per candidate
    -- ============================================================
    CREATE TABLE
        work_experience (
            id BIGSERIAL PRIMARY KEY,
            candidate_id BIGINT NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            is_current BOOLEAN NOT NULL DEFAULT FALSE,
            location VARCHAR(255),
            work_setting VARCHAR(50),
            technologies_used TEXT,
            certificate_url TEXT,
            experience_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_work_experience_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT chk_work_experience_dates CHECK (
                end_date IS NULL
                OR end_date >= start_date
            ),
            CONSTRAINT chk_work_experience_work_setting CHECK (
                work_setting IS NULL
                OR work_setting IN ('Remote', 'Hybrid', 'On-site')
            ),
            CONSTRAINT chk_current_work_experience CHECK (
                (
                    is_current = TRUE
                    AND end_date IS NULL
                )
                OR (is_current = FALSE)
            )
        );

    -- ============================================================
    -- 7. SKILLS MASTER
    -- Central list of skills
    -- ============================================================
    CREATE TABLE
        skills_master (
            id BIGSERIAL PRIMARY KEY,
            skill_name VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

    -- ============================================================
    -- 8. CANDIDATE SKILLS
    -- Candidate's selected skills and verification information
    -- ============================================================
    CREATE TABLE
        candidate_skills (
            id BIGSERIAL PRIMARY KEY,
            candidate_id BIGINT NOT NULL,
            skill_id BIGINT NOT NULL,
            claimed_level VARCHAR(50) NOT NULL,
            verified_score INTEGER,
            verified_level VARCHAR(50),
            verification_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
            is_growth_area BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_candidate_skills_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT fk_candidate_skills_skill FOREIGN KEY (skill_id) REFERENCES skills_master (id) ON DELETE RESTRICT,
            CONSTRAINT uq_candidate_skill UNIQUE (candidate_id, skill_id),
            CONSTRAINT chk_claimed_level CHECK (
                claimed_level IN ('Basic', 'Intermediate', 'Advanced')
            ),
            CONSTRAINT chk_verified_level CHECK (
                verified_level IS NULL
                OR verified_level IN ('Basic', 'Intermediate', 'Advanced')
            ),
            CONSTRAINT chk_verified_score CHECK (
                verified_score IS NULL
                OR verified_score BETWEEN 0 AND 100
            )
        );

    -- ============================================================
    -- 9. TARGET ROLES
    -- Master list of target roles
    -- ============================================================
    CREATE TABLE
        target_roles (
            id BIGSERIAL PRIMARY KEY,
            role_name VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

    -- ============================================================
    -- 10. PREFERRED LOCATIONS
    -- Master list of preferred locations
    -- ============================================================
    CREATE TABLE
        preferred_locations (
            id BIGSERIAL PRIMARY KEY,
            location_name VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

    -- ============================================================
    -- 11. PREFERRED WORK SETTINGS
    -- Master list
    -- ============================================================
    CREATE TABLE
        preferred_work_settings (
            id BIGSERIAL PRIMARY KEY,
            setting_name VARCHAR(50) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT chk_preferred_setting CHECK (setting_name IN ('Remote', 'Hybrid', 'On-site'))
        );

    -- ============================================================
    -- 12. PREFERRED INDUSTRIES
    -- Master list of industries
    -- ============================================================
    CREATE TABLE
        preferred_industries (
            id BIGSERIAL PRIMARY KEY,
            industry_name VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

    -- ============================================================
    -- 13. CANDIDATE → TARGET ROLES
    -- Many-to-many relationship
    -- ============================================================
    CREATE TABLE
        candidate_target_roles (
            candidate_id BIGINT NOT NULL,
            role_id BIGINT NOT NULL,
            PRIMARY KEY (candidate_id, role_id),
            CONSTRAINT fk_candidate_target_roles_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT fk_candidate_target_roles_role FOREIGN KEY (role_id) REFERENCES target_roles (id) ON DELETE CASCADE
        );

    -- ============================================================
    -- 14. CANDIDATE → PREFERRED LOCATIONS
    -- Many-to-many relationship
    -- ============================================================
    CREATE TABLE
        candidate_preferred_locations (
            candidate_id BIGINT NOT NULL,
            location_id BIGINT NOT NULL,
            PRIMARY KEY (candidate_id, location_id),
            CONSTRAINT fk_candidate_locations_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT fk_candidate_locations_location FOREIGN KEY (location_id) REFERENCES preferred_locations (id) ON DELETE CASCADE
        );

    -- ============================================================
    -- 15. CANDIDATE → WORK SETTINGS
    -- Many-to-many relationship
    -- ============================================================
    CREATE TABLE
        candidate_preferred_work_settings (
            candidate_id BIGINT NOT NULL,
            setting_id BIGINT NOT NULL,
            PRIMARY KEY (candidate_id, setting_id),
            CONSTRAINT fk_candidate_work_settings_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT fk_candidate_work_settings_setting FOREIGN KEY (setting_id) REFERENCES preferred_work_settings (id) ON DELETE CASCADE
        );

    -- ============================================================
    -- 16. CANDIDATE → INDUSTRIES
    -- Many-to-many relationship
    -- ============================================================
    CREATE TABLE
        candidate_preferred_industries (
            candidate_id BIGINT NOT NULL,
            industry_id BIGINT NOT NULL,
            PRIMARY KEY (candidate_id, industry_id),
            CONSTRAINT fk_candidate_industries_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
            CONSTRAINT fk_candidate_industries_industry FOREIGN KEY (industry_id) REFERENCES preferred_industries (id) ON DELETE CASCADE
        );

    -- ============================================================
    -- INDEXES
    -- ============================================================
    CREATE INDEX idx_candidates_user_id ON candidates (user_id);

    CREATE INDEX idx_education_candidate_id ON candidate_education (candidate_id);

    CREATE INDEX idx_projects_candidate_id ON projects (candidate_id);

    CREATE INDEX idx_internships_candidate_id ON internships (candidate_id);

    CREATE INDEX idx_work_experience_candidate_id ON work_experience (candidate_id);

    CREATE INDEX idx_candidate_skills_candidate_id ON candidate_skills (candidate_id);

    CREATE INDEX idx_candidate_skills_skill_id ON candidate_skills (skill_id);

    -- ============================================================
    -- DONE
    -- ============================================================