package com.anmory.todopro.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午10:29
 */

@Data
public class User {
    private Integer userId;
    private String username;
    private String password;
    private String email;
    private Date createdAt;
    private Date updatedAt;
}
