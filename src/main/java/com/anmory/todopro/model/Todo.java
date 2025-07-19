package com.anmory.todopro.model;

import lombok.Data;
import java.util.Date;

@Data
public class Todo {
    private Integer todoId;
    private Integer dayId;
    private Integer overallId;
    private Integer userId;
    private String title;
    private String description;
    private Boolean isCompleted;
    private Date createdAt;
    private Date updatedAt;
}    