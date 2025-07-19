package com.anmory.todopro.service;

import com.anmory.todopro.mapper.OverallMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午11:06
 */

@Service
public class OverallService {
    @Autowired
    OverallMapper overallMapper;

    public int insert(Integer userId, String name, String description, String imgPath) {
        return overallMapper.insert(userId, name, description, imgPath);
    }

    public int delete(Integer overallId) {
        return overallMapper.delete(overallId);
    }

    public int update(Integer overallId, String name, String description, String imgPath, Boolean isCompleted) {
        return overallMapper.update(overallId, name, description, imgPath, isCompleted);
    }

    public int complete(Integer overallId) {
        return overallMapper.complete(overallId);
    }

    public com.anmory.todopro.model.Overall selectById(Integer overallId) {
        return overallMapper.selectById(overallId);
    }

    public java.util.List<com.anmory.todopro.model.Overall> selectByUserId(Integer userId) {
        return overallMapper.selectByUserId(userId);
    }

    public com.anmory.todopro.model.Overall selectLastByUserId(Integer userId) {
        return overallMapper.selectLastByUserId(userId);
    }

    public java.util.List<com.anmory.todopro.model.Overall> selectLastTenOverallsByUserId(Integer userId) throws Exception {
        return overallMapper.selectLastTenOverallsByUserId(userId);
    }
}
