package com.kta.erp.dto.transport;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransporterResponse {

    private Long id;
    private String code;
    private String companyName;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String gstin;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
