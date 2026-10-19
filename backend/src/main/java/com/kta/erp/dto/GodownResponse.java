package com.kta.erp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GodownResponse {

    private Long id;
    private String code;
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String contactPerson;
    private String contactPhone;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
