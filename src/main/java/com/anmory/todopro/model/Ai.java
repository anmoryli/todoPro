package com.anmory.todopro.model;

import lombok.Data;
import java.util.Date;

@Data
public class Ai {
    private Integer aiId;
    private Integer overallId;
    private Integer userId;
    private String title;
    private String dailyGoals;
    private Boolean isChecked;
    private Boolean isAccepted;
    private Date createdAt;
    private Date updatedAt;
}    