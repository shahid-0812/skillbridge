CREATE TABLE
    skill_verification_attempts (
        id BIGSERIAL PRIMARY KEY,
        candidate_id BIGINT NOT NULL,
        skill_id BIGINT NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Created',
        started_at TIMESTAMPTZ,
        submitted_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        score INTEGER,
        verified_level VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_verification_attempt_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
        CONSTRAINT fk_verification_attempt_skill FOREIGN KEY (skill_id) REFERENCES skills_master (id) ON DELETE RESTRICT,
        CONSTRAINT chk_verification_attempt_status CHECK (
            status IN (
                'Created',
                'Started',
                'Submitted',
                'Completed',
                'Expired'
            )
        ),
        CONSTRAINT chk_verification_attempt_score CHECK (
            score IS NULL
            OR score BETWEEN 0 AND 100
        ),
        CONSTRAINT chk_verification_attempt_level CHECK (
            verified_level IS NULL
            OR verified_level IN ('Basic', 'Intermediate', 'Advanced')
        )
    );

