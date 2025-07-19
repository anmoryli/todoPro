package com.anmory.todopro.service;

import com.anmory.todopro.mapper.AiMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-20 上午12:05
 */

@Service
public class AiService {
    @Autowired
    AiMapper aiMapper;

    public int insert(int overallId, int userId, String title, String dailyGoals) {
        return aiMapper.insert(overallId, userId, title, dailyGoals);
    }

    public int updateChecked(int aiId) {
        return aiMapper.updateChecked(aiId);
    }

    public int updateAccepted(int aiId) {
        return aiMapper.updateAccepted(aiId);
    }

    public int insertOverview(int userId, String title, String overview) {
        return aiMapper.insertOverview(userId, title, overview);
    }

    public java.util.List<com.anmory.todopro.model.AiOverview> selectAllOverviewsByUserId(int userId) {
        return aiMapper.selectAllOverviewsByUserId(userId);
    }

    public com.anmory.todopro.model.AiOverview selectOverviewById(int overviewId) {
        return aiMapper.selectOverviewById(overviewId);
    }

    public com.anmory.todopro.model.Ai selectLastByUserId(int userId) {
        return aiMapper.selectLastByUserId(userId);
    }
}
