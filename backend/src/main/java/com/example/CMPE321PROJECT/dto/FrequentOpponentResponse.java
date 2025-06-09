package com.example.CMPE321PROJECT.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
public class FrequentOpponentResponse {
    private String username;
    private String name;
    private String surname;
    private int eloRating;
    // Or for ties:
    private double averageEloRating;
    private List<String> tiedPlayers;
}