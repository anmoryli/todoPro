package com.anmory.todopro.dto;

import lombok.Data;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-20 上午1:10
 */

// 内部类表示解析后的待办事项
@Data
public class TodoItem {
    private String title;
    private String task;

    public TodoItem(String title, String task) {
        this.title = title;
        this.task = task;
    }
}
