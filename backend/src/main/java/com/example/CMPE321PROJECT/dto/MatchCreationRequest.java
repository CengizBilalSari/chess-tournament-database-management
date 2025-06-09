package com.example.CMPE321PROJECT.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class MatchCreationRequest {
    private int hallId;
    private int tableId;
    private int whitePlayerTeamId;
    private int blackPlayerTeamId;
    private String date;
    private int timeSlot;
    private String arbiterUsername;
    private String creatorCoachUsername;
}