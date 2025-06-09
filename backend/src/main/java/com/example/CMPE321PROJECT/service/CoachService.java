package com.example.CMPE321PROJECT.service;

import com.example.CMPE321PROJECT.dto.MatchCreationRequest;
import com.example.CMPE321PROJECT.dto.PlayerAssignmentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CoachService {
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public CoachService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ResponseEntity<?> createMatch(MatchCreationRequest request) {
        try {
            Integer maxId = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(match_ID), 0) FROM Matches", Integer.class);
            int newMatchId = (maxId != null ? maxId : 0) + 1;

            String insertSql = """
                    INSERT INTO Matches
                    (match_ID, hall_ID, table_ID, white_player_team, black_player_team, white_player, black_player, date, time_slot, assigned_arbiter_username, creator_coach_username)
                    VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?)
                """;
            jdbcTemplate.update(insertSql,
                    newMatchId,
                    request.getHallId(),
                    request.getTableId(),
                    request.getWhitePlayerTeamId(),
                    request.getBlackPlayerTeamId(),
                    request.getDate(),
                    request.getTimeSlot(),
                    request.getArbiterUsername(),
                    request.getCreatorCoachUsername());

            return ResponseEntity.ok(Map.of("message", "Match created successfully", "matchId", newMatchId));
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }

    public ResponseEntity<?> assignPlayerToMatch(int matchId, PlayerAssignmentRequest request) {
        try {
            String updateSql = request.getWhitePlayer() ?
                    "UPDATE Matches SET white_player = ? WHERE match_ID = ?" :
                    "UPDATE Matches SET black_player = ? WHERE match_ID = ?";

            int rowsAffected = jdbcTemplate.update(updateSql, request.getPlayerUsername(), matchId);

            if (rowsAffected == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Match not found or no changes made"));
            }

            return ResponseEntity.ok(Map.of("message", "Player assigned to match successfully"));
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error","Duplicate entry"));
        }
    }

    public ResponseEntity<?> deleteMatch(int matchId) {
        try {
            String checkSql = """
                        SELECT COUNT(*) FROM Matches
                        WHERE match_ID = ?
                    """;
            int exists = jdbcTemplate.queryForObject(checkSql, Integer.class, matchId);
            if (exists == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Match not found"));
            }

            String deleteSql = """
                        DELETE FROM Matches
                        WHERE match_ID = ?
                    """;
            jdbcTemplate.update(deleteSql, matchId);

            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }

    public ResponseEntity<?> getAvailableHalls() {
        try {
            String sql = """
                        SELECT hall_ID AS hallId, hall_name AS name, hall_country AS country, hall_capacity AS capacity
                        FROM Hall
                    """;
            List<Map<String, Object>> halls = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(halls);
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }


    public ResponseEntity<?> getCreatedMatchesForDeletion(String coachName) {
        if (coachName == null || coachName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Coach name cannot be empty."));
        }
        String sql = """
                    SELECT
                        match_ID AS matchId,
                        hall_ID AS hallId,
                        table_ID AS tableId,
                        white_player_team AS whitePlayerTeamId,
                        white_player AS whitePlayerUsername,
                        black_player_team AS blackPlayerTeamId,
                        black_player AS blackPlayerUsername,
                        result,
                        time_slot AS timeSlot,
                        date,
                        assigned_arbiter_username AS assignedArbiterUsername,
                        rating,
                        creator_coach_username AS creatorCoachUsername
                    FROM Matches
                    WHERE creator_coach_username = ?
                    ORDER BY date DESC, time_slot ASC
                """;
        List<Map<String, Object>> matches = jdbcTemplate.queryForList(sql, coachName);
        return ResponseEntity.ok(matches);
    }

    public ResponseEntity<?> getCreatedMatchesForPlayerAssignment(String coachName) {
        if (coachName == null || coachName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Coach name cannot be empty."));
        }
        String sql = """
                SELECT
                    m.match_ID AS matchId,
                    m.hall_ID AS hallId,
                    m.table_ID AS tableId,
                    m.white_player_team AS whitePlayerTeamId,
                    m.white_player AS whitePlayerUsername,
                    m.black_player_team AS blackPlayerTeamId,
                    m.black_player AS blackPlayerUsername,
                    m.result,
                    m.time_slot AS timeSlot,
                    m.date,
                    m.assigned_arbiter_username AS assignedArbiterUsername,
                    m.rating,
                    m.creator_coach_username AS creatorCoachUsername,
                    wt.coach_username AS whiteTeamCoachUsername,
                    bt.coach_username AS blackTeamCoachUsername
                FROM Matches m
                JOIN Team wt ON m.white_player_team = wt.team_id
                JOIN Team bt ON m.black_player_team = bt.team_id
                WHERE wt.coach_username = ? OR bt.coach_username = ?
                ORDER BY m.date ASC, m.time_slot ASC
                """;


        List<Map<String, Object>> matchesFromDb = jdbcTemplate.queryForList(sql, coachName, coachName);
        List<Map<String, Object>> resultMatches = new ArrayList<>();

        for (Map<String, Object> matchRow : matchesFromDb) {
            Map<String, Object> processedMatch = new HashMap<>(matchRow);

            String whiteTeamCoach = (String) processedMatch.get("whiteTeamCoachUsername");
            String blackTeamCoach = (String) processedMatch.get("blackTeamCoachUsername");
            String assignableColor = null;

            if (coachName.equals(whiteTeamCoach)) {
                assignableColor = "white";
            } else if (coachName.equals(blackTeamCoach)) {
                assignableColor = "black";
            }

            if (assignableColor != null) {
                processedMatch.put("assignablePlayerColor", assignableColor);
            }
            processedMatch.remove("whiteTeamCoachUsername");
            processedMatch.remove("blackTeamCoachUsername");

            resultMatches.add(processedMatch);
        }

        return ResponseEntity.ok(resultMatches);

    }

    public ResponseEntity<?> getPlayersForAssignment(Integer teamId) {
        String sql = """
                SELECT username
                FROM PlayerTeam
                WHERE team_ID = ?
                ORDER BY username ASC
                """;
        List<String> playerUsernames = jdbcTemplate.queryForList(sql, String.class, teamId);

        if (playerUsernames.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>()); // Return an empty list
        }
        return ResponseEntity.ok(playerUsernames);
    }
    public ResponseEntity<?> getInfoForMatches() {
        try {
            Map<String, Object> response = new HashMap<>();

            String arbitersSql = "SELECT username FROM Arbiter ORDER BY username ASC";
            List<String> arbiters = jdbcTemplate.queryForList(arbitersSql, String.class);
            response.put("arbiters", arbiters);

            String tablesSql = "SELECT hall_ID AS hallId, table_ID AS tableId FROM Tables ORDER BY hall_ID, table_ID";
            List<Map<String, Object>> tables = jdbcTemplate.queryForList(tablesSql);
            response.put("tables", tables);

            String teamsSql = "SELECT team_id AS teamId FROM Team ORDER BY team_id ASC";
            List<Integer> teams = jdbcTemplate.queryForList(teamsSql, Integer.class);
            response.put("teams", teams);

            return ResponseEntity.ok(response);
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }
}