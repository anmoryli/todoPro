package com.anmory.todopro.service;

import com.anmory.todopro.mapper.DayMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午11:27
 */

@Service
public class DayService {
    @Autowired
    DayMapper dayMapper;

    public int insert(Integer userId, String title, String overview) {
        return dayMapper.insert(userId, title, overview);
    }

    public int delete(Integer dayId) {
        return dayMapper.delete(dayId);
    }

    public int update(Integer dayId, String title, String overview) {
        return dayMapper.update(dayId, title, overview);
    }

    public com.anmory.todopro.model.Day selectById(Integer dayId) {
        return dayMapper.selectById(dayId);
    }

    public java.util.List<com.anmory.todopro.model.Day> selectByUserId(Integer userId) {
        return dayMapper.selectByUserId(userId);
    }

    public com.anmory.todopro.model.Day selectLastByUserId(Integer userId) {
        return dayMapper.selectLastByUserId(userId);
    }

    public com.anmory.todopro.model.Day selectLast() {
        return dayMapper.selectLast();
    }
}
