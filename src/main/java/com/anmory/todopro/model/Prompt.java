package com.anmory.todopro.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-20 下午2:18
 */

@Data
public class Prompt {
    private Integer promptId;
    private String content;
    private Date createdAt;
    private Date updatedAt;
}

