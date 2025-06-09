package com.example.CMPE321PROJECT.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class HallResponse {
    private int hallId;
    private String name;
    private String country;
    private int capacity;
}