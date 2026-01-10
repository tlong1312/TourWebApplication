package com.longne.tourapplication.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class MonthlyRevenueDTO implements Serializable {
    private int year;
    private int month;
    private BigDecimal revenue;
}
