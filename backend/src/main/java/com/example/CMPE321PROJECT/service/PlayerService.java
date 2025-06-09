package com.example.CMPE321PROJECT.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PlayerService {
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public PlayerService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }


    public ResponseEntity<?> getPlayedOpponents(String currentPlayer) {
        try {
            String sql = """
                        SELECT DISTINCT u.username, u.name, u.surname, p.elo_rating
                        FROM Matches m
                        JOIN Player p ON (p.username = m.white_player OR p.username = m.black_player)
                        JOIN User u ON u.username = p.username
                        WHERE (m.white_player = ? OR m.black_player = ?)
                          AND p.username != ?
                    """;

            List<Map<String, Object>> opponents = jdbcTemplate.queryForList(
                    sql, currentPlayer, currentPlayer, currentPlayer
            );

            return ResponseEntity.ok(opponents);
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }

    public ResponseEntity<?> getMostFrequentOpponentRating(String currentPlayer) {
        try {
            String innerSql = """
                        SELECT 
                            CASE 
                                WHEN white_player = ? THEN black_player 
                                ELSE white_player 
                            END AS opponent
                        FROM Matches
                        WHERE white_player = ? OR black_player = ?
                    """;

            String outerSql = """
                        SELECT opponent, COUNT(*) AS game_count, AVG(p.elo_rating) AS avg_rating
                        FROM (
                    """ + innerSql + """
                        ) AS og
                        JOIN Player p ON og.opponent = p.username
                        GROUP BY opponent
                    """;


            List<Map<String, Object>> stats = jdbcTemplate.queryForList(
                    outerSql, currentPlayer, currentPlayer, currentPlayer
            );

            if (stats.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No matches played yet"));
            }

            int maxGames = stats.stream()
                    .mapToInt(o -> ((Number) o.get("game_count")).intValue())
                    .max()
                    .orElse(0);

            List<Map<String, Object>> mostFrequent = stats.stream()
                    .filter(o -> ((Number) o.get("game_count")).intValue() == maxGames)
                    .toList();

            List<String> opponents = mostFrequent.stream()
                    .map(o -> (String) o.get("opponent"))
                    .toList();

            double averageElo = mostFrequent.stream()
                    .mapToDouble(o -> ((Number) o.get("avg_rating")).doubleValue())
                    .average()
                    .orElse(0.0);

            return ResponseEntity.ok(Map.of(
                    "opponents", opponents,
                    "average_elo_rating", averageElo
            ));

        } catch (DataAccessException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }


}