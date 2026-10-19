package com.kta.erp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SupplierRequest {

    @NotBlank(message = "Supplier code is required")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 255)
    private String name;

    @Size(max = 100)
    private String contactPerson;

    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100)
    private String state;

    @NotBlank(message = "Pincode is required")
    @Size(max = 10)
    private String pincode;

    @Size(max = 15)
    private String gstNumber;

    private BigDecimal balance = BigDecimal.ZERO;
    private Boolean active = true;
}
