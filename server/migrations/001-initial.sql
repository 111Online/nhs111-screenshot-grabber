--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS Metadata (
  "id"          TEXT PRIMARY KEY,
  "name"       TEXT NOT NULL,
  "schedule"    TEXT,
  "dos"    TEXT NOT NULL,
  "data"    BLOB NOT NULL,
  "date" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);



--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Metadata;