package com.example.CMPE321PROJECT.service;

import com.example.CMPE321PROJECT.dto.ArbiterCreationRequest;
import com.example.CMPE321PROJECT.dto.CoachCreationRequest;
import com.example.CMPE321PROJECT.dto.PlayerCreationRequest;
import com.example.CMPE321PROJECT.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DatabaseManagerService {
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DatabaseManagerService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public ResponseEntity<?> createPlayer(PlayerCreationRequest request) {
        try {
            String hash = passwordEncoder.encode(request.getPassword());

            String sql = "INSERT INTO User (username, password, name, surname, nationality) VALUES (?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, request.getUsername(), hash,
                    request.getName(), request.getSurname(), request.getNationality());

            sql = "INSERT INTO Player (username, date_of_birth, elo_rating, title_ID, fide_ID) " +
                    "VALUES (?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, request.getUsername(), request.getDateOfBirth(),
                    request.getEloRating(), request.getTitleId(), request.getFideId());

            return ResponseEntity.ok(Map.of("message", "Player created successfully"));
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }

    public ResponseEntity<?> renameHall(int hallId, String newName) {
        try {
            String checkHallSql = "SELECT COUNT(*) FROM Hall WHERE hall_ID = ?";
            int count = jdbcTemplate.queryForObject(checkHallSql, Integer.class, hallId);

            if (count == 0) {
                throw new NotFoundException("Hall not found with ID: " + hallId);
            }

            // Update the hall's name
            String sql = "UPDATE Hall SET hall_name = ? WHERE hall_ID = ?";
            int affectedRows = jdbcTemplate.update(sql, newName, hallId);

            if (affectedRows > 0) {
                String getUpdatedHallSql = "SELECT hall_ID, hall_name FROM Hall WHERE hall_ID = ?";
                Map<String, Object> updatedHall = jdbcTemplate.queryForMap(getUpdatedHallSql, hallId);

                return ResponseEntity.ok(Map.of(
                        "hallId", updatedHall.get("hall_ID"),
                        "hallName", updatedHall.get("hall_name")
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Hall not found with ID: " + hallId));
            }
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }

    public ResponseEntity<?> createCoach(CoachCreationRequest request) {
        try {
            String hash = passwordEncoder.encode(request.getPassword());

            String sql = "INSERT INTO User (username, password, name, surname, nationality) VALUES (?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, request.getUsername(), hash,
                    request.getName(), request.getSurname(), request.getNationality());

            sql = "INSERT INTO Coach (username) VALUES (?)";
            jdbcTemplate.update(sql, request.getUsername());

            sql = "INSERT INTO CoachCertification (username, coach_certification_name) VALUES (?, ?)";
            for (String certification : request.getCertifications()) {
                jdbcTemplate.update(sql, request.getUsername(), certification);
            }
            sql = "UPDATE Team SET coach_username = ?, contract_start = ?, contract_finish = ? WHERE team_id = ?";
            jdbcTemplate.update(sql, request.getUsername(),
                    request.getContractStart(),
                    request.getContractFinish(),
                    request.getTeamId());
            return ResponseEntity.ok(Map.of("message", "Coach created successfully"));
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }
    public ResponseEntity<?> createArbiter(ArbiterCreationRequest request) {
        try {
            String hash = passwordEncoder.encode(request.getPassword());

            String sql = "INSERT INTO User (username, password, name, surname, nationality) VALUES (?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, request.getUsername(), hash,
                    request.getName(), request.getSurname(), request.getNationality());

            sql = "INSERT INTO Arbiter (username, experience_level) VALUES (?, ?)";
            jdbcTemplate.update(sql, request.getUsername(), request.getExperienceLevel());

            sql = "INSERT INTO ArbiterCertification (username, arbiter_certification_name) VALUES (?, ?)";
            for (String certification : request.getCertifications()) {
                jdbcTemplate.update(sql, request.getUsername(), certification);
            }

            return ResponseEntity.ok(Map.of("message", "Arbiter created successfully"));
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }
    public ResponseEntity<?> getHalls() {
        try {
            String sql = "SELECT hall_ID, hall_name FROM Hall";
            List<Map<String, Object>> halls = jdbcTemplate.queryForList(sql);

            List<Map<String, Object>> result = halls.stream()
                    .map(hall -> Map.of(
                            "hallId", hall.get("hall_ID"),
                            "hallName", hall.get("hall_name")
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (DataAccessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMostSpecificCause().getMessage()));
        }
    }
}