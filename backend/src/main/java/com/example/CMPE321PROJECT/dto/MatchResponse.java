package com.example.CMPE321PROJECT.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class MatchResponse {
    private int matchId;
    private String tournamentName;
    private String hallName;
    private int tableId;
    private String whitePlayer;
    private String blackPlayer;
    private String date;
    private int timeSlot;
    private String arbiter;
}