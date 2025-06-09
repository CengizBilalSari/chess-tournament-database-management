package com.example.CMPE321PROJECT.controller;

import com.example.CMPE321PROJECT.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/player")
public class PlayerController {
    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }


    @GetMapping("/opponents/{username}")
    public ResponseEntity<?> getPlayedOpponents(@PathVariable String username) {
        return playerService.getPlayedOpponents(username);
    }

    @GetMapping("/frequent-opponent/{username}")
    public ResponseEntity<?> getMostFrequentOpponentRating(@PathVariable String username) {
        return playerService.getMostFrequentOpponentRating(username);
    }
}