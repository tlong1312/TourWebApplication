package com.longne.tourapplication.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YearlyRevenueDTO implements Serializable {
    private int year;
    private BigDecimal revenue;
}