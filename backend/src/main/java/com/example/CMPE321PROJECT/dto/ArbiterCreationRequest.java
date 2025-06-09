package com.example.CMPE321PROJECT.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
public class ArbiterCreationRequest {
    private String username;
    private String password;
    private String name;
    private String surname;
    private String nationality;
    private String experienceLevel;
    private List<String> certifications;
}