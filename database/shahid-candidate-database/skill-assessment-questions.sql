CREATE TABLE
    skill_assessment_questions (
        id BIGSERIAL PRIMARY KEY,
        attempt_id BIGINT NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        description TEXT,
        question_type VARCHAR(30) NOT NULL DEFAULT 'scenario',
        options JSONB NOT NULL,
        correct_option VARCHAR(255) NOT NULL,
        candidate_answer VARCHAR(255),
        is_correct BOOLEAN,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_assessment_question_attempt FOREIGN KEY (attempt_id) REFERENCES skill_verification_attempts (id) ON DELETE CASCADE,
        CONSTRAINT chk_assessment_question_number CHECK (question_number BETWEEN 1 AND 5),
        CONSTRAINT chk_assessment_question_type CHECK (question_type = 'scenario'),
        CONSTRAINT uq_attempt_question_number UNIQUE (attempt_id, question_number)
    );

CREATE INDEX idx_verification_attempt_candidate ON skill_verification_attempts (candidate_id);

CREATE INDEX idx_verification_attempt_skill ON skill_verification_attempts (skill_id);

CREATE INDEX idx_assessment_questions_attempt ON skill_assessment_questions (attempt_id);