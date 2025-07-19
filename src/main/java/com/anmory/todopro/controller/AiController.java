package com.anmory.todopro.controller;

import com.anmory.todopro.dto.TodoItem;
import com.anmory.todopro.model.Ai;
import com.anmory.todopro.model.AiOverview;
import com.anmory.todopro.model.Overall;
import com.anmory.todopro.model.Todo;
import com.anmory.todopro.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-20 上午12:08
 */

@Slf4j
@RestController
@RequestMapping("/ai")
public class AiController {
    @Autowired
    AiService aiService;
    @Autowired
    ToolService toolService;
    @Autowired
    TodoService todoService;
    @Autowired
    OverallService overallService;
    @Autowired
    DayService dayService;

    @RequestMapping("/generateDailyGoals")
    public boolean generateDailyGoals(int userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        // 获取最近的总体任务
        Overall overall = overallService.selectLastByUserId(userId);
        if(overall == null) {
            log.error("未找到用户 {} 的总体任务", userId);
            return false;
        }
        // 先把day表增加一个记录，代表下一天
        int dayId = dayService.insert(userId, "新的一天", "暂无今日总结");
        // 获取昨天的todo
        List<Todo> todos = todoService.selectByDayId(dayId - 1);
        if(todos.isEmpty()) {
            log.error("未找到昨天的待办事项");
            return false;
        }
        // 生成下一天的todo，结构化输出
        String aiTodos = toolService.todoGenerate(overall.toString(),
                todos.toString(),
                String.valueOf(userId));
        // 解析todo成list
        List<TodoItem> todoItems = toolService.parseTodoList(aiTodos);
        // 插入ai表
        aiService.insert(overall.getOverallId(), userId, todoItems.toString(), aiTodos);
        // 插入todo表
        for (TodoItem item : todoItems) {
            Todo todo = new Todo();
            todo.setTitle(item.getTitle());
            todo.setOverallId(overall.getOverallId());
            todo.setDescription(item.getTask());
            todo.setDayId(dayId);
            todo.setUserId(userId);
            todoService.insert(todo.getDayId(),todo.getOverallId(), todo.getUserId(), todo.getTitle(), todo.getDescription());
        }
        log.info("AI为用户 {} 生成了新的待办事项", userId);
        return true;
    }

    @RequestMapping("/aiSummary")
    public boolean aiSummary(int userIdn, HttpServletRequest request) throws Exception {
        int userId = toolService.resolveUserId(request, userIdn);
        // 获取最近10条总体任务
        List<Overall> overalls = overallService.selectLastTenOverallsByUserId(userId);
        // 获取对应的todoss
        List<Todo> todoss = null;
        for(Overall overall : overalls) {
            List<Todo> todos = todoService.selectByOverallId(overall.getOverallId());
            for(Todo todo : todos) {
                if(todoss == null) {
                    todoss = List.of(todo);
                } else {
                    todoss.add(todo);
                }
            }
        }
        // 生成总结
        String aiSummary = toolService.aiSummary(overalls.toString(), todoss.toString(), String.valueOf(userId));
        // 插入ai_overview表
        AiOverview aiOverview = new AiOverview();
        aiOverview.setUserId(userId);
        aiOverview.setTitle("AI总结");
        aiOverview.setOverview(aiSummary);
        aiService.insertOverview(aiOverview.getUserId(), aiOverview.getTitle(), aiOverview.getOverview());
        // 返回结果
        return true;
    }

    @RequestMapping("/getAiOverviewsByUserId")
    public List<AiOverview> getAiOverviewsByUserId(int userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        if (userId <= 0) {
            log.error("获取AI概览失败：无效的用户ID");
            return null;
        }
        List<AiOverview> aiOverviews = aiService.selectAllOverviewsByUserId(userId);
        if (aiOverviews.isEmpty()) {
            log.info("未找到用户 {} 的AI概览", userId);
            return null;
        }
        log.info("成功获取用户 {} 的AI概览", userId);
        return aiOverviews;
    }

    @RequestMapping("/getAiOverviewById")
    public AiOverview getAiOverviewById(int aiOverviewId) {
        AiOverview aiOverview = aiService.selectOverviewById(aiOverviewId);
        if (aiOverview == null) {
            log.error("未找到AI概览，ID: {}", aiOverviewId);
            return null;
        }
        log.info("成功获取AI概览，ID: {}", aiOverviewId);
        return aiOverview;
    }

    @RequestMapping("updateIsChecked")
    public int updateIsChecked(int userIdn, boolean isChecked) {
        int userId = toolService.resolveUserId(null, userIdn);
        Ai ai = aiService.selectLastByUserId(userId);
        int result = aiService.updateChecked(ai.getAiId());
        if (result == 0 || result == -1) {
            log.error("更新AI概览的已读状态失败，ID: {}", ai.getAiId());
            return -1;
        } else {
            log.info("成功更新AI概览的已读状态，ID: {}, 已读: {}", ai.getAiId(), isChecked);
        }
        return result;
    }

    @RequestMapping("/updateIsAccepted")
    public int updateIsAccepted(int userIdn, boolean isAccepted) {
        int userId = toolService.resolveUserId(null, userIdn);
        Ai ai = aiService.selectLastByUserId(userId);
        int result = aiService.updateAccepted(ai.getAiId());
        if (result == 0 || result == -1) {
            log.error("更新AI概览的接受状态失败，ID: {}", ai.getAiId());
            return -1;
        } else {
            log.info("成功更新AI概览的接受状态，ID: {}, 已接受: {}", ai.getAiId(), isAccepted);
        }
        return result;
    }
}
