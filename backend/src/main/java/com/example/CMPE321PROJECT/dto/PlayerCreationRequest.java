package com.example.CMPE321PROJECT.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Data
@Getter
@Setter
public class PlayerCreationRequest {
    private String username;
    private String password;
    private String name;
    private String surname;
    private String nationality;
    private Date dateOfBirth;
    private int eloRating;
    private int titleId;
    private String fideId;
}