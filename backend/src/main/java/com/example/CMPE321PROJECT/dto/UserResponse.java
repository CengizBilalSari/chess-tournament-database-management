package com.example.CMPE321PROJECT.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class UserResponse {
    private String username;
    private String name;
    private String surname;
    private String role;
}