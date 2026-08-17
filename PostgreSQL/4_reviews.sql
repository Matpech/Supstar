CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    UNIQUE (location_id, reviewer_id)
);

CREATE INDEX idx_reviews_locationid ON reviews(location_id);
CREATE INDEX idx_reviews_reviewerid ON reviews(reviewer_id);