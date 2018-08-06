--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS Scheduler (
  "id"                INTEGER PRIMARY KEY,
  "metadata_id"       TEXT NOT NULL,
  "scheduled_time"    DATETIME NOT NULL,
  "start_time"        DATETIME,
  "finish_time"       DATETIME,
  "cancelled"         BOOLEAN DEFAULT 0, 
  "date"              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (metadata_id) REFERENCES Metadata(id)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Scheduler;