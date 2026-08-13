CREATE TYPE location_types AS ENUM ('restaurant', 'hotel', 'bar', 'museum', 'activity', 'landmark');
CREATE TYPE location_statuses AS ENUM('to_be_visited', 'visited', 'favorite');

CREATE TABLE IF NOT EXISTS locations (
    -- Database IDs
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Used for personal lists
    list_id INTEGER REFERENCES shared_lists(id) ON DELETE CASCADE, -- Used for shared lists

    -- General information
    name VARCHAR(255) NOT NULL,
    category location_types,
    description TEXT,
    opening_times JSONB,
    tags JSONB,
    status location_statuses NOT NULL DEFAULT 'visited',
    
    -- Geographic information
    full_address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 country code
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL
);