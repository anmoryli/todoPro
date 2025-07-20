package com.anmory.todopro.controller;

import com.anmory.todopro.dto.TodoItem;
import com.anmory.todopro.model.*;
import com.anmory.todopro.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
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
        // 获取当前用户的总体任务（按用户隔离）
        Overall overall = overallService.selectLastByUserId(userId);
        if (overall == null) {
            log.error("用户 {} 无总体任务，无法生成每日目标", userId);
            return false;
        }

        LocalDate currentDate = LocalDate.now();
        Integer dayId = null;

        try {
            // 1. 查询当前用户当天的day记录（按用户隔离）
            Day todayDay = dayService.selectByUserIdAndDate(userId, currentDate);
            if (todayDay != null) {
                dayId = todayDay.getDayId();
                log.info("用户 {} 当天已有day记录，使用ID: {}", userId, dayId);
            } else {
                // 2. 创建当天记录（防并发重复）
                int insertRow = dayService.insert(userId, "新的一天", "暂无今日总结");
                if (insertRow <= 0) {
                    log.error("用户 {} 创建当天day记录失败", userId);
                    return false;
                }
                todayDay = dayService.selectByUserIdAndDate(userId, currentDate);
                if (todayDay == null) {
                    log.error("用户 {} 新建day记录后查询失败", userId);
                    return false;
                }
                dayId = todayDay.getDayId();
                log.info("用户 {} 新建当天day记录，ID: {}", userId, dayId);
            }

            // 3. 获取当前用户前一天的day记录（按用户隔离）
            LocalDate previousDate = currentDate.minusDays(1);
            Day previousDay = dayService.selectByUserIdAndDate(userId, previousDate);
            Integer previousDayId = previousDay != null ? previousDay.getDayId() : null;

            // 4. 获取前一天的待办（按用户+前一天dayId）
            List<Todo> todos = previousDayId != null
                    ? todoService.selectByDayIdAndUserId(previousDayId, userId)
                    : Collections.emptyList();

            if (todos.isEmpty()) {
                log.info("用户 {} 无前一天待办，使用默认值", userId);
                Todo defaultTodo = new Todo();
                defaultTodo.setTitle("初始化待办");
                defaultTodo.setDescription("开始新的一天计划");
                defaultTodo.setUserId(userId);
                todos = Collections.singletonList(defaultTodo);
            }

            // 5. 生成AI待办（复用原逻辑）
            String aiTodos = toolService.todoGenerate(
                    todos.toString(),
                    overall.toString(),
                    String.valueOf(userId)
            );
            log.info("用户 {} AI生成待办: {}", userId, aiTodos);

            // 6. 解析并插入待办（复用原逻辑，绑定当前用户dayId）
            List<TodoItem> todoItems = toolService.parseTodoList(aiTodos);
            if (todoItems.isEmpty()) {
                log.error("用户 {} 待办解析失败", userId);
                return false;
            }

            // 插入AI记录
            aiService.insert(overall.getOverallId(), userId, todoItems.get(0).getTitle(), aiTodos);

            // 插入待办（绑定当前dayId和用户）
            for (TodoItem item : todoItems) {
                todoService.insert(
                        dayId,
                        overall.getOverallId(),
                        userId,
                        item.getTitle(),
                        item.getTask()
                );
            }
            log.info("用户 {} 生成{}条待办，绑定dayId: {}", userId, todoItems.size(), dayId);
            return true;

        } catch (Exception e) {
            log.error("用户 {} 生成每日目标失败", userId, e);
            return false;
        }
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
                }
            }
        }
        if(todoss == null) {
//      插入一个空的todoss
            Todo todo = new Todo();
            todo.setTitle("暂无待办事项");
            todo.setDescription("暂无待办事项");
            todo.setUserId(userId);
            todoss = List.of(todo);
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
