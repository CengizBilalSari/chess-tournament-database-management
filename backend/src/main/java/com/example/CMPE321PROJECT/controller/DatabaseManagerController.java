package com.example.CMPE321PROJECT.controller;
import com.example.CMPE321PROJECT.dto.ArbiterCreationRequest;
import com.example.CMPE321PROJECT.dto.CoachCreationRequest;
import com.example.CMPE321PROJECT.dto.PlayerCreationRequest;
import com.example.CMPE321PROJECT.service.DatabaseManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/db-manager")
public class DatabaseManagerController {
    private final DatabaseManagerService dbManagerService;

    @Autowired
    public DatabaseManagerController(DatabaseManagerService dbManagerService) {
        this.dbManagerService = dbManagerService;
    }

    @PostMapping("/users/player")
    public ResponseEntity<?> createPlayer(@RequestBody PlayerCreationRequest request) {
        return dbManagerService.createPlayer(request);
    }

    @PostMapping("/users/coach")
    public ResponseEntity<?> createCoach(@RequestBody CoachCreationRequest request) {
        return dbManagerService.createCoach(request);
    }

    @PostMapping("/users/arbiter")
    public ResponseEntity<?> createArbiter(@RequestBody ArbiterCreationRequest request) {
        return dbManagerService.createArbiter(request);
    }

    @PutMapping("/halls/name/{hallId}")
    public ResponseEntity<?> renameHall(@PathVariable int hallId, @RequestBody Map<String, String> requestBody) {
        String newName = requestBody.get("newName");
        return dbManagerService.renameHall(hallId, newName);
    }

    @GetMapping("/halls/name")
    public ResponseEntity<?> getHalls() {
        return dbManagerService.getHalls();
   }


}