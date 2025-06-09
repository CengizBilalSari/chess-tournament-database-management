package com.example.CMPE321PROJECT.controller;

import com.example.CMPE321PROJECT.dto.MatchRatingRequest;
import com.example.CMPE321PROJECT.service.ArbiterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/arbiter")
public class ArbiterController {

    private final ArbiterService arbiterService;

    @Autowired
    public ArbiterController(ArbiterService arbiterService) {
        this.arbiterService = arbiterService;
    }

    @PutMapping("/{username}/matches/{matchId}/rating")
    public ResponseEntity<?> rateMatch(
            @PathVariable String username,
            @PathVariable int matchId,
            @RequestBody MatchRatingRequest request) {
        return arbiterService.rateMatch(username, matchId, request.getRating());
    }

    // GET /api/arbiter/{username}/rating-statistics
    @GetMapping("/{username}/rating-statistics")
    public ResponseEntity<?> getRatingStatistics(@PathVariable String username) {
        return arbiterService.getRatingStatistics(username);
    }

    @GetMapping("/{username}/matches-to-rate")
    public ResponseEntity<?> getMatchesToRate(@PathVariable String username) {
        return arbiterService.getMatchesToRate(username);
    }
}
