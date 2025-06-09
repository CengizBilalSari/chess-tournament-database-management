package com.example.CMPE321PROJECT.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Data
public class CoachCreationRequest {
    private String username;
    private String password;
    private String name;
    private String surname;
    private String nationality;
    private List<String> specialties;
    private List<String> certifications;
    private Integer teamId;
    private LocalDate contractStart;
    private LocalDate contractFinish;
}