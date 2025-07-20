package com.anmory.todopro.service;

import com.anmory.todopro.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午10:43
 */

@Service
public class UserService {
    @Autowired
    UserMapper userMapper;

    public int insert(String username, String password, String email) {
        return userMapper.insert(username, password, email);
    }

    public int delete(Integer userId) {
        return userMapper.delete(userId);
    }

    public int update(Integer userId, String username, String password, String email) {
        return userMapper.update(userId, username, password, email);
    }

    public com.anmory.todopro.model.User selectById(Integer userId) {
        return userMapper.selectById(userId);
    }

    public com.anmory.todopro.model.User selectByUsernameAndPassword(String username, String password) {
        return userMapper.selectByUsernameAndPassword(username, password);
    }

    public int updateWallPaper(int userId, String wallPaperPath) {
        return userMapper.updateWallPaper(userId, wallPaperPath);
    }
}
