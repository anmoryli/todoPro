package com.anmory.todopro.controller;

import com.anmory.todopro.model.Todo;
import com.anmory.todopro.service.TodoService;
import com.anmory.todopro.service.ToolService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午11:38
 */

@Slf4j
@RestController
@RequestMapping("/todo")
public class TodoController {
    @Autowired
    TodoService todoService;
    @Autowired
    ToolService toolService;

    @RequestMapping("/insert")
    public int insert(Integer dayId, Integer overallId, Integer userIdn, String title, String description,
                      HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        return todoService.insert(dayId, overallId, userId, title, description);
    }

    @RequestMapping("/delete")
    public int delete(Integer todoId) {
        if (todoId == null || todoId <= 0) {
            log.error("无效的待办事项ID");
            return -1;
        }
        return todoService.delete(todoId);
    }

    @RequestMapping("/update")
    public int update(Integer todoId, String title, String description) {
        if (todoId == null || todoId <= 0 || title == null || description == null) {
            log.error("无效的待办事项ID或标题或描述");
            return -1;
        }
        return todoService.update(todoId, title, description);
    }

    @RequestMapping("/complete")
    public int complete(Integer todoId) {
        if (todoId == null || todoId <= 0) {
            log.error("无效的待办事项ID");
            return -1;
        }
        return todoService.complete(todoId);
    }

    @RequestMapping("/deCompleted")
    public int deCompleted(Integer todoId) {
        if (todoId == null || todoId <= 0) {
            log.error("无效的待办事项ID");
            return -1;
        }
        return todoService.deCompleted(todoId);
    }

    @RequestMapping("/selectByDayId")
    public List<Todo> selectByDayId(Integer dayId,Integer userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        if (dayId == null || dayId <= 0) {
            log.error("无效的日记ID");
            return null;
        }
        return todoService.selectByDayIdAndUserId(dayId, userId);
    }

    @RequestMapping("/selectByOverallId")
    public List<Todo> selectByOverallId(Integer overallId) {
        if (overallId == null || overallId <= 0) {
            log.error("无效的总体ID");
            return null;
        }
        return todoService.selectByOverallId(overallId);
    }

    @RequestMapping("/selectByUserId")
    public List<Todo> selectByUserId(Integer userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        if (userId <= 0) {
            log.error("无效的用户ID");
            return null;
        }
        return todoService.selectByUserId(userId);
    }

    @RequestMapping("/selectNotCompletedByDayId")
    public Todo selectNotCompletedByDayId(Integer dayId) {
        if (dayId == null || dayId <= 0) {
            log.error("无效的日记ID");
            return null;
        }
        return todoService.selectNotCompletedByDayId(dayId);
    }

    @RequestMapping("/selectNotCompletedByOverallId")
    public Todo selectNotCompletedByOverallId(Integer overallId) {
        if (overallId == null || overallId <= 0) {
            log.error("无效的总体ID");
            return null;
        }
        return todoService.selectNotCompletedByOverallId(overallId);
    }
}
