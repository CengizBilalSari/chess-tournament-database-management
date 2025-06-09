package com.example.CMPE321PROJECT.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ArbiterStatsResponse {
    private int totalMatchesRated;
    private double averageRating;
}