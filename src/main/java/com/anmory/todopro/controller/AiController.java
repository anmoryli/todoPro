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
        // 获取最近的总体任务
        Overall overall = overallService.selectLastByUserId(userId);
        if(overall == null) {
            log.error("未找到用户 {} 的总体任务", userId);
            return false;
        }

        // 获取当前日期（只取年月日）
        LocalDate currentDate = LocalDate.now();

        // 获取用户最后一条day记录
        Day lastDay = dayService.selectLast();
        LocalDate lastDayDate = null;

        if (lastDay != null) {
            // 将Day对象中的日期字段转换为LocalDate（假设Day类中有Date类型字段createAt）
            lastDayDate = convertToLocalDate(lastDay.getCreatedAt());
        }

        Integer dayId = null;

        log.info("比较当前日期 {} 和最后一条day记录日期 {}", currentDate, lastDayDate);
        // 判断是否需要创建新的day记录
        if (lastDayDate == null || !lastDayDate.isEqual(currentDate)) {
            // 需要创建新的day记录
            String title = "新的一天";
            String overview = "暂无今日总结";
            dayService.insert(userId, title, overview);
            int newDayId = dayService.selectLast().getDayId();

            if (newDayId <= 0) {
                log.error("创建新的day记录失败，用户ID: {}", userId);
                return false;
            }

            dayId = newDayId;
            log.info("为用户 {} 创建了新的day记录，ID: {}", userId, dayId);
        } else {
            // 使用已有的day记录
            dayId = lastDay.getDayId();
            log.info("使用用户 {} 已有的day记录，ID: {}", userId, dayId);
        }

        // 获取前一天的dayId（如果存在）
        Integer previousDayId = null;
        if (lastDay != null && !lastDayDate.isEqual(currentDate)) {
            previousDayId = lastDay.getDayId();
        }

        // 获取前一天的todo
        List<Todo> todos;
        if (previousDayId != null) {
            todos = todoService.selectByDayIdAndUserId(previousDayId, userId);
            System.out.println("前一天的待办事项: " + todos + ", 前一天的dayId: " + previousDayId +
                    ", 当前用户ID: " + userId);
        } else {
            todos = Collections.emptyList();
        }

        if(todos.isEmpty()) {
            log.info("未找到前一天的待办事项，使用默认待办");
            // 如果为空，创建一个默认的待办事项
            Todo todo = new Todo();
            todo.setTitle("暂无待办事项");
            todo.setDescription("今日无历史待办事项，开始新的一天");
            todo.setUserId(userId);
            todos = Collections.singletonList(todo);
        }

        // 生成下一天的todo，结构化输出
        String aiTodos = toolService.todoGenerate(
                todos.toString(),
                overall.toString(),
                String.valueOf(userId));
        System.out.println("AI生成的待办事项: " + aiTodos);

        // 解析todo成list
        List<TodoItem> todoItems = toolService.parseTodoList(aiTodos);
        System.out.println("解析后的待办事项: " + todoItems);

        if (todoItems.isEmpty()) {
            log.error("AI生成的待办事项解析失败，返回空列表");
            return false;
        }

        // 插入ai表
        aiService.insert(overall.getOverallId(), userId, todoItems.get(0).getTitle(), aiTodos);

        // 插入todo表
        for (TodoItem item : todoItems) {
            Todo todo = new Todo();
            todo.setTitle(item.getTitle());
            todo.setOverallId(overall.getOverallId());
            todo.setDescription(item.getTask());
            todo.setDayId(dayId);
            todo.setUserId(userId);
            todo.setCreatedAt(new Date()); // 设置创建时间

            System.out.println("插入待办事项: " + todo);
            todoService.insert(todo.getDayId(),todo.getOverallId(), todo.getUserId(), todo.getTitle(), todo.getDescription()); // 假设todoService有insert(Todo todo)方法
        }

        log.info("AI为用户 {} 生成了新的待办事项，共 {} 条", userId, todoItems.size());
        return true;
    }

    // 辅助方法：将Date转换为LocalDate
    private LocalDate convertToLocalDate(Date date) {
        if (date == null) {
            return null;
        }
        return Instant.ofEpochMilli(date.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
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
