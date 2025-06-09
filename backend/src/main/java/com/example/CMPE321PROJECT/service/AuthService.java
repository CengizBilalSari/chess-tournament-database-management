package com.example.CMPE321PROJECT.service;

import com.example.CMPE321PROJECT.exception.InvalidCredentialsException;
import com.example.CMPE321PROJECT.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public ResponseEntity<?> authenticateUser(String username, String password) {
        try {
            String sql = "SELECT username, password, name, surname FROM User WHERE BINARY username = ?";
            Map<String, Object> user = null;

            try {
                user = jdbcTemplate.queryForMap(sql, username);
            } catch (EmptyResultDataAccessException e) {
                throw new InvalidCredentialsException("Invalid credentials: User not found");
            }
            String hashedPassword = (String) user.get("password");

            // Check password
            if (!passwordEncoder.matches(password, hashedPassword)) {
                if (!passwordEncoder.matches(password, hashedPassword)) {
                    throw new InvalidCredentialsException("Invalid credentials");
                }
            }

            sql = "SELECT CASE " +
                    "  WHEN EXISTS (SELECT 1 FROM Player WHERE username = ?) THEN 'PLAYER' " +
                    "  WHEN EXISTS (SELECT 1 FROM Coach WHERE username = ?) THEN 'COACH' " +
                    "  WHEN EXISTS (SELECT 1 FROM Arbiter WHERE username = ?) THEN 'ARBITER' " +
                    "  ELSE 'UNKNOWN' END as role";

            String role = jdbcTemplate.queryForObject(sql, String.class, username, username, username);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("username", user.get("username"));
            response.put("name", user.get("name"));
            response.put("surname", user.get("surname"));
            response.put("role", role);

            return ResponseEntity.ok(response);
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    public ResponseEntity<?> authenticateManager(String username, String password) {
        try {
            String sql = "SELECT username, password FROM DatabaseManager WHERE BINARY username = ?";
            Map<String, Object> manager = jdbcTemplate.queryForMap(sql, username);

            String hashedPassword = (String) manager.get("password");

            if (!passwordEncoder.matches(password, hashedPassword)) {
                throw new InvalidCredentialsException("Invalid credentials: Incorrect password");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("username", manager.get("username"));
            response.put("role", "ADMIN");

            return ResponseEntity.ok(response);

        } catch (EmptyResultDataAccessException e) {
            throw new NotFoundException("Manager not found");
        }
    }
}