 CREATE DATABASE CHESS_DB;
 USE CHESS_DB; 
 CREATE TABLE `User` (
  `username` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(75) DEFAULT NULL,
  `surname` varchar(75) DEFAULT NULL,
  `nationality` varchar(100) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 
 CREATE TABLE `Sponsor` (
  `sponsor_ID` int NOT NULL,
  `sponsor_name` varchar(255) NOT NULL,
  PRIMARY KEY (`sponsor_ID`),
  UNIQUE KEY `sponsor_name` (`sponsor_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `Coach` (
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`username`),
  CONSTRAINT `Coach_ibfk_1` FOREIGN KEY (`username`) REFERENCES `User` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `CoachCertification` (
  `username` varchar(255) NOT NULL,
  `coach_certification_name` varchar(255) NOT NULL,
  PRIMARY KEY (`username`,`coach_certification_name`),
  CONSTRAINT `CoachCertification_ibfk_1` FOREIGN KEY (`username`) REFERENCES `Coach` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Title` (
  `title_ID` int NOT NULL,
  `title_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`title_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `Team` (
  `team_id` int NOT NULL,
  `team_name` varchar(255) DEFAULT NULL,
  `coach_username` varchar(255) NOT NULL,
  `contract_start` date NOT NULL,
  `contract_finish` date NOT NULL,
  `sponsor_ID` int DEFAULT NULL,
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `coach_username` (`coach_username`),
  KEY `sponsor_ID` (`sponsor_ID`),
  CONSTRAINT `Team_ibfk_1` FOREIGN KEY (`coach_username`) REFERENCES `Coach` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Team_ibfk_2` FOREIGN KEY (`sponsor_ID`) REFERENCES `Sponsor` (`sponsor_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `Player` (
  `username` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `elo_rating` int NOT NULL,
  `title_ID` int DEFAULT NULL,
  `fide_ID` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`username`),
  KEY `title_ID` (`title_ID`),
  CONSTRAINT `Player_ibfk_1` FOREIGN KEY (`username`) REFERENCES `User` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Player_ibfk_2` FOREIGN KEY (`title_ID`) REFERENCES `Title` (`title_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Player_chk_1` CHECK ((`elo_rating` > 1000))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `PlayerTeam` (
  `username` varchar(255) NOT NULL,
  `team_ID` int NOT NULL,
  PRIMARY KEY (`username`,`team_ID`),
  KEY `team_ID` (`team_ID`),
  CONSTRAINT `PlayerTeam_ibfk_1` FOREIGN KEY (`username`) REFERENCES `Player` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PlayerTeam_ibfk_2` FOREIGN KEY (`team_ID`) REFERENCES `Team` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 
 CREATE TABLE `Arbiter` (
  `username` varchar(255) NOT NULL,
  `experience_level` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`username`),
  CONSTRAINT `Arbiter_ibfk_1` FOREIGN KEY (`username`) REFERENCES `User` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Arbiter_chk_1` CHECK ((`experience_level` in (_utf8mb4'beginner',_utf8mb4'intermediate',_utf8mb4'advanced',_utf8mb4'expert')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ArbiterCertification` (
  `username` varchar(255) NOT NULL,
  `arbiter_certification_name` varchar(255) NOT NULL,
  PRIMARY KEY (`username`,`arbiter_certification_name`),
  CONSTRAINT `ArbiterCertification_ibfk_1` FOREIGN KEY (`username`) REFERENCES `Arbiter` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `DatabaseManager` (
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `Hall` (
  `hall_ID` int NOT NULL,
  `hall_name` varchar(255) DEFAULT NULL,
  `hall_country` varchar(255) DEFAULT NULL,
  `hall_capacity` int DEFAULT NULL,
  PRIMARY KEY (`hall_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `Tables` (
  `table_ID` int NOT NULL,
  `hall_ID` int NOT NULL,
  PRIMARY KEY (`hall_ID`,`table_ID`),
  CONSTRAINT `Tables_ibfk_1` FOREIGN KEY (`hall_ID`) REFERENCES `Hall` (`hall_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Matches` (
  `match_ID` int NOT NULL,
  `hall_ID` int DEFAULT NULL,
  `table_ID` int DEFAULT NULL,
  `white_player_team` int NOT NULL,
  `white_player` varchar(255) DEFAULT NULL,
  `black_player_team` int NOT NULL,
  `black_player` varchar(255) DEFAULT NULL,
  `result` varchar(10) DEFAULT NULL,
  `time_slot` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `assigned_arbiter_username` varchar(255) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `creator_coach_username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`match_ID`),
  UNIQUE KEY `location_conflict` (`hall_ID`,`table_ID`,`date`,`time_slot`),
  UNIQUE KEY `white_player_conflict` (`white_player`,`date`,`time_slot`),
  UNIQUE KEY `black_player_conflict` (`black_player`,`date`,`time_slot`),
  UNIQUE KEY `arbiter_conflict` (`assigned_arbiter_username`,`date`,`time_slot`),
  KEY `white_player_team` (`white_player_team`),
  KEY `black_player_team` (`black_player_team`),
  KEY `white_player__in_team` (`white_player`,`white_player_team`),
  KEY `black_player__in_team` (`black_player`,`black_player_team`),
  KEY `fk_matches_creator_coach` (`creator_coach_username`),
  CONSTRAINT `black_player__in_team` FOREIGN KEY (`black_player`, `black_player_team`) REFERENCES `PlayerTeam` (`username`, `team_ID`),
  CONSTRAINT `fk_matches_creator_coach` FOREIGN KEY (`creator_coach_username`) REFERENCES `Coach` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Matches_ibfk_1` FOREIGN KEY (`hall_ID`, `table_ID`) REFERENCES `Tables` (`hall_ID`, `table_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Matches_ibfk_2` FOREIGN KEY (`white_player`) REFERENCES `Player` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Matches_ibfk_3` FOREIGN KEY (`black_player`) REFERENCES `Player` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Matches_ibfk_4` FOREIGN KEY (`white_player_team`) REFERENCES `Team` (`team_id`),
  CONSTRAINT `Matches_ibfk_5` FOREIGN KEY (`black_player_team`) REFERENCES `Team` (`team_id`),
  CONSTRAINT `Matches_ibfk_6` FOREIGN KEY (`assigned_arbiter_username`) REFERENCES `Arbiter` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `white_player__in_team` FOREIGN KEY (`white_player`, `white_player_team`) REFERENCES `PlayerTeam` (`username`, `team_ID`),
  CONSTRAINT `different_teams` CHECK ((`white_player_team` <> `black_player_team`)),
  CONSTRAINT `Matches_chk_1` CHECK ((`result` in (_utf8mb4'white_wins',_utf8mb4'black_wins',_utf8mb4'draw'))),
  CONSTRAINT `Matches_chk_2` CHECK ((`time_slot` between 1 and 3)),
  CONSTRAINT `Matches_chk_3` CHECK ((`rating` between 1 and 10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Trigger for INSERT operations on Matches (2-slot check)
DELIMITER //
CREATE TRIGGER trg_MatchSchedulingConflict_Insert
BEFORE INSERT ON Matches
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;

    -- 1. Location Conflict Check (Covers 2 slots)
    SELECT COUNT(*) INTO conflict_count
    FROM Matches
    WHERE hall_ID = NEW.hall_ID
      AND table_ID = NEW.table_ID
      AND date = NEW.date
      AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1); -- Check adjacent slots

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Location conflict: Overlaps with another match at the same location/table within the 2-slot duration.';
    END IF;

    -- 2. White Player Conflict Check (Covers 2 slots)
    SELECT COUNT(*) INTO conflict_count
    FROM Matches
    WHERE date = NEW.date
      AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1) -- Check adjacent slots
      AND (white_player = NEW.white_player OR black_player = NEW.white_player);

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'White player conflict: Player is already scheduled within the 2-slot duration on this date.';
    END IF;

    -- 3. Black Player Conflict Check (Covers 2 slots)
    SELECT COUNT(*) INTO conflict_count
    FROM Matches
    WHERE date = NEW.date
      AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1) -- Check adjacent slots
      AND (white_player = NEW.black_player OR black_player = NEW.black_player);

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Black player conflict: Player is already scheduled within the 2-slot duration on this date.';
    END IF;

    -- 4. Arbiter Conflict Check (Covers 2 slots)
    IF NEW.assigned_arbiter_username IS NOT NULL THEN
        SELECT COUNT(*) INTO conflict_count
        FROM Matches
        WHERE assigned_arbiter_username = NEW.assigned_arbiter_username
          AND date = NEW.date
          AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1); -- Check adjacent slots

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Arbiter conflict: Arbiter is already assigned within the 2-slot duration on this date.';
        END IF;
    END IF;

END; //
DELIMITER ;



-- Trigger for UPDATE operations on Matches (2-slot check)
DELIMITER //
CREATE TRIGGER trg_MatchSchedulingConflict_Update
BEFORE UPDATE ON Matches
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;

    -- Only perform checks if relevant scheduling information has changed
    IF NEW.hall_ID != OLD.hall_ID OR NEW.table_ID != OLD.table_ID OR NEW.date != OLD.date OR NEW.time_slot != OLD.time_slot OR
       NEW.white_player != OLD.white_player OR NEW.black_player != OLD.black_player OR
       IFNULL(NEW.assigned_arbiter_username, '') != IFNULL(OLD.assigned_arbiter_username, '')
    THEN

        -- 1. Location Conflict Check (Covers 2 slots)
        SELECT COUNT(*) INTO conflict_count
        FROM Matches
        WHERE match_ID != NEW.match_ID -- Exclude self
          AND hall_ID = NEW.hall_ID
          AND table_ID = NEW.table_ID
          AND date = NEW.date
          AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1);

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Location conflict: Overlaps with another match at the same location/table within the 2-slot duration.';
        END IF;

        -- 2. White Player Conflict Check (Covers 2 slots)
        SELECT COUNT(*) INTO conflict_count
        FROM Matches
        WHERE match_ID != NEW.match_ID -- Exclude self
          AND date = NEW.date
          AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1)
          AND (white_player = NEW.white_player OR black_player = NEW.white_player);

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'White player conflict: Player is already scheduled within the 2-slot duration on this date.';
        END IF;

        -- 3. Black Player Conflict Check (Covers 2 slots)
        SELECT COUNT(*) INTO conflict_count
        FROM Matches
        WHERE match_ID != NEW.match_ID -- Exclude self
          AND date = NEW.date
          AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1)
          AND (white_player = NEW.black_player OR black_player = NEW.black_player);

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Black player conflict: Player is already scheduled within the 2-slot duration on this date.';
        END IF;

        -- 4. Arbiter Conflict Check (Covers 2 slots)
        IF NEW.assigned_arbiter_username IS NOT NULL THEN
            SELECT COUNT(*) INTO conflict_count
            FROM Matches
            WHERE match_ID != NEW.match_ID -- Exclude self
              AND assigned_arbiter_username = NEW.assigned_arbiter_username
              AND date = NEW.date
              AND time_slot IN (NEW.time_slot - 1, NEW.time_slot + 1);

            IF conflict_count > 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Arbiter conflict: Arbiter is already assigned within the 2-slot duration on this date.';
            END IF;
        END IF;

    END IF; -- End check if relevant fields changed

END; //
DELIMITER ;


-- Prevent updating match rating if it's already set
DELIMITER //
CREATE TRIGGER trg_Matches_PreventRatingUpdate
BEFORE UPDATE ON Matches
FOR EACH ROW
BEGIN
    -- Check if the rating is being changed FROM a non-null value TO a different value
    IF OLD.rating IS NOT NULL AND NEW.rating <> OLD.rating THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot modify an existing match rating. Rating can only be set once.';
    END IF;
END; //
DELIMITER ;

DELIMITER //

CREATE TRIGGER validate_creator_coach_before_insert
BEFORE INSERT ON Matches
FOR EACH ROW
BEGIN
    DECLARE coach_count INT;
    
    -- Check if the creator_coach_username is the coach of either team AND
    -- the match date is within their contract period
    SELECT COUNT(*) INTO coach_count
    FROM Team
    WHERE coach_username = NEW.creator_coach_username
    AND (team_id = NEW.white_player_team OR team_id = NEW.black_player_team)
    AND NEW.date BETWEEN contract_start AND contract_finish;
    
    -- If the coach doesn't belong to either team or date is outside contract
    IF coach_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Creator coach must be: (1) coach of either team, and (2) under contract on match date';
    END IF;
END//

DELIMITER ;









