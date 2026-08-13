CREATE TYPE list_roles AS ENUM ('reader', 'commenter', 'editor', 'owner');

CREATE TABLE IF NOT EXISTS shared_lists (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS shared_list_members (
    list_id INTEGER NOT NULL REFERENCES shared_lists(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role list_roles NOT NULL DEFAULT 'reader',
    PRIMARY KEY (list_id, user_id)
);