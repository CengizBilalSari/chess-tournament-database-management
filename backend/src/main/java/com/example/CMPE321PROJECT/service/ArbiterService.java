package com.example.CMPE321PROJECT.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ArbiterService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public ArbiterService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ResponseEntity<?> rateMatch(String arbiterUsername, int matchId, int rating) {
        try {
            String verifySql = """
                SELECT COUNT(*) FROM Matches
                WHERE match_ID = ? 
                AND BINARY assigned_arbiter_username = ? 
                AND rating IS NULL 
                AND date < NOW()
            """;

            int count = jdbcTemplate.queryForObject(verifySql, Integer.class, matchId, arbiterUsername);

            if (count == 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Match not found, not assigned to arbiter, already rated, or not yet played"));
            }

            String updateSql = "UPDATE Matches SET rating = ? WHERE match_ID = ?";
            jdbcTemplate.update(updateSql, rating, matchId);

            return ResponseEntity.ok(Map.of("message", "Match rated successfully"));

        } catch (DataAccessException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }

    public ResponseEntity<?> getRatingStatistics(String arbiterUsername) {
        try {
            String sql = """
                SELECT COUNT(rating) AS total_rated,
                       AVG(rating) AS average_rating
                FROM Matches
                WHERE BINARY assigned_arbiter_username = ?
                AND rating IS NOT NULL
            """;

            Map<String, Object> stats = jdbcTemplate.queryForMap(sql, arbiterUsername);
            return ResponseEntity.ok(stats);

        } catch (DataAccessException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }

    public ResponseEntity<?> getMatchesToRate(String arbiterUsername) {
        try {
            String sql = """
                SELECT match_ID AS matchId, date, white_player AS whitePlayer, black_player AS blackPlayer, hall_ID AS hallId, table_ID AS tableId
                FROM Matches
                WHERE  BINARY assigned_arbiter_username = ?
                AND rating IS NULL
                AND date < NOW()
            """;
            var matches = jdbcTemplate.queryForList(sql, arbiterUsername);
            return ResponseEntity.ok(matches);
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }
}
