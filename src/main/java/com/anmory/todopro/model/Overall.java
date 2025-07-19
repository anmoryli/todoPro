package com.anmory.todopro.model;

import lombok.Data;
import java.util.Date;

@Data
public class Overall {
    private Integer overallId;
    private Integer userId;
    private String name;
    private String description;
    private String imgPath;
    private Boolean isCompleted;
    private Date createdAt;
    private Date updatedAt;
}    