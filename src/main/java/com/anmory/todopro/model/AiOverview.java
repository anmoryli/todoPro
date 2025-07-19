package com.anmory.todopro.model;

import lombok.Data;
import java.util.Date;

@Data
public class AiOverview {
    private Integer aiOverviewId;
    private Integer userId;
    private String title;
    private String overview;
    private Date createdAt;
    private Date updatedAt;
}    