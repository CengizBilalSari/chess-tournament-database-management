package com.example.CMPE321PROJECT.controller;

import com.example.CMPE321PROJECT.dto.MatchCreationRequest;
import com.example.CMPE321PROJECT.dto.PlayerAssignmentRequest;
import com.example.CMPE321PROJECT.service.CoachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coach")
public class CoachController {
    private final CoachService coachService;

    @Autowired
    public CoachController(CoachService coachService) {
        this.coachService = coachService;
    }

    @PostMapping("/matches")
    public ResponseEntity<?> createMatch(@RequestBody MatchCreationRequest request) {
        return coachService.createMatch(request);
    }

    @PostMapping("/matches/{matchId}/assign-player")
    public ResponseEntity<?> assignPlayerToMatch(@PathVariable int matchId, @RequestBody PlayerAssignmentRequest request) {
        return coachService.assignPlayerToMatch(matchId, request);
    }

    @DeleteMapping("/matches/{matchId}")
    public ResponseEntity<?> deleteMatch(@PathVariable int matchId) {
        return coachService.deleteMatch(matchId);
    }

    @GetMapping("/halls")
    public ResponseEntity<?> getAvailableHalls() {
        return coachService.getAvailableHalls();
    }


    @GetMapping("/createdMatches/{coachName}")
    public ResponseEntity<?> getCreatedMatchesForDeletion(@PathVariable String coachName) {
        return coachService.getCreatedMatchesForDeletion(coachName);
    }


    @GetMapping("/ownMatches/{coachName}")
    public ResponseEntity<?> getMatchesForPlayerAssigment(@PathVariable String coachName) {
        return coachService.getCreatedMatchesForPlayerAssignment(coachName);
    }

    @GetMapping("/players/{teamId}")
    public ResponseEntity<?> getPlayersForAssignment(@PathVariable Integer teamId) {
        return coachService.getPlayersForAssignment(teamId);
    }
    @GetMapping("/infoForMatches")
    public ResponseEntity<?> getInfoForMatches() {
        return coachService.getInfoForMatches();
    }



}