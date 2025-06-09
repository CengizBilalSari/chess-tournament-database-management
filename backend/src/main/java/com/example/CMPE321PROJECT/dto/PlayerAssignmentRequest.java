package com.example.CMPE321PROJECT.dto;


public class PlayerAssignmentRequest {
    private String playerUsername;
    private boolean whitePlayer;  // Note: No "is" prefix

    public String getPlayerUsername() {return playerUsername;}

    // Setter for playerUsername
    public void setPlayerUsername(String playerUsername) {
        this.playerUsername = playerUsername;
    }

    // Getter for whitePlayer (note: uses getWhitePlayer(), not isWhitePlayer())
    public boolean getWhitePlayer() {
        return whitePlayer;
    }

    // Setter for whitePlayer
    public void setWhitePlayer(boolean whitePlayer) {
        this.whitePlayer = whitePlayer;
    }
}