package com.anmory.todopro.service;

import com.anmory.todopro.dto.TodoItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ToolServiceTest {

    @Autowired
    ToolService toolService;
    @Test
    void parseTodoList() {
        String aiTestResponse = "{日常工作}[整理本周会议纪要],{学习计划}[完成Java并发编程章节练习],{健康管理}[晚间跑步30分钟],{家庭事务}[给父母打电话确认周末行程],{购物清单}[购买笔记本电脑充电器],{社交安排}[回复朋友聚餐邀请]@";
        List<TodoItem> todoItems = toolService.parseTodoList(aiTestResponse);
        System.out.println(todoItems);
    }
}