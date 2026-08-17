CREATE TYPE location_types AS ENUM ('restaurant', 'hotel', 'bar', 'museum', 'activity', 'landmark');
CREATE TYPE location_statuses AS ENUM('to_be_visited', 'visited', 'favorite');

CREATE TABLE IF NOT EXISTS locations (
    -- Database IDs
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Used for personal lists
    list_id INTEGER REFERENCES shared_lists(id) ON DELETE CASCADE, -- Used for shared lists

    -- General information
    name VARCHAR(255) NOT NULL,
    category location_types NOT NULL,
    price REAL NOT NULL DEFAULT 0 CHECK (price > 0),
    description TEXT,
    opening_times JSONB,
    tags JSONB,
    status location_statuses NOT NULL DEFAULT 'visited',
    
    -- Geographic information
    full_address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 country code
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE
);

-- Search optimizations
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_locations_listid ON locations(list_id);
CREATE INDEX idx_locations_userid ON locations(user_id);
CREATE INDEX idx_locations_name_trgm ON locations USING gin (name gin_trgm_ops);
CREATE INDEX idx_locations_desc_trgm ON locations USING gin (name gin_trgm_ops);
CREATE INDEX idx_locations_name_lowercase ON locations(LOWER(name));
