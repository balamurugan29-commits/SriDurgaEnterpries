package com.sridurga.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Long id;
    private Integer serialNumber;
    private String itemCode;
    private String description;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal rate;
    private BigDecimal serviceCharge;
    private BigDecimal amount;
}
