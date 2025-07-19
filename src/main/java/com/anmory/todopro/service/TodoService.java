package com.anmory.todopro.service;

import com.anmory.todopro.mapper.TodoMapper;
import com.anmory.todopro.model.Day;
import com.anmory.todopro.model.Todo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午11:33
 */

@Service
public class TodoService {
    @Autowired
    TodoMapper todoMapper;

    public int insert(Integer dayId, Integer overallId, Integer userId, String title, String description) {
        return todoMapper.insert(dayId, overallId, userId, title, description);
    }

    public int delete(Integer todoId) {
        return todoMapper.delete(todoId);
    }

    public int update(Integer todoId, String title, String description) {
        return todoMapper.update(todoId, title, description);
    }

    public int complete(Integer todoId) {
        return todoMapper.complete(todoId);
    }

    public List<Todo> selectByDayId(Integer dayId) {
        return todoMapper.selectByDayId(dayId);
    }

    public List<Todo> selectByOverallId(Integer overallId) {
        return todoMapper.selectByOverallId(overallId);
    }

    public List<Todo> selectByUserId(Integer userId) {
        return todoMapper.selectByUserId(userId);
    }

    public Todo selectNotCompletedByDayId(Integer dayId) {
        return todoMapper.selectNotCompletedByDayId(dayId).get(0);
    }

    public Todo selectNotCompletedByOverallId(Integer overallId) {
        return todoMapper.selectNotCompletedByOverallId(overallId).get(0);
    }
}
