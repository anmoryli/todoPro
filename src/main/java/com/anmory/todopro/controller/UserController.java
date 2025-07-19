package com.anmory.todopro.controller;

import com.anmory.todopro.model.User;
import com.anmory.todopro.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午10:50
 */

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    UserService userService;

    @RequestMapping("/login")
    public User login(String username, String password, HttpSession session) {
        if(username == null || password == null) {
            log.error("用户名或密码不能为空");
            return null;
        }

        User user = userService.selectByUsernameAndPassword(username, password);
        if(user == null) {
            log.error("登录失败：用户名或密码错误或用户不存在");
            return null;
        }

        if(password.equals(user.getPassword())) {
            log.info("登录成功，用户ID: {}", user.getUserId());
            session.setAttribute("session_user_key", user);
            return user;
        } else {
            log.error("登录失败：密码错误");
            return null;
        }
    }

    @RequestMapping("/logout")
    public String logout(HttpSession session) {
        session.removeAttribute("session_user_key");
        log.info("用户已成功登出");
        return "登出成功";
    }

    @RequestMapping("register")
    public String register(String username, String password, String email) {
        if(username == null || password == null || email == null) {
            log.error("注册失败：用户名、密码或邮箱不能为空");
            return "注册失败：用户名、密码或邮箱不能为空";
        }

        int result = userService.insert(username, password, email);
        if(result > 0) {
            log.info("注册成功，用户ID: {}", result);
            return "注册成功";
        } else {
            log.error("注册失败：可能是用户名已存在或其他错误");
            return "注册失败：可能是用户名已存在或其他错误";
        }
    }

    @RequestMapping("/update")
    public String update(Integer userId, String username, String password, String email) {
        if(userId == null || username == null || password == null || email == null) {
            log.error("更新失败：用户ID、用户名、密码或邮箱不能为空");
            return "更新失败：用户ID、用户名、密码或邮箱不能为空";
        }
        int result = userService.update(userId, username, password, email);
        if(result > 0) {
            log.info("用户信息更新成功，用户ID: {}", userId);
            return "用户信息更新成功";
        } else {
            log.error("更新失败：可能是用户不存在或其他错误");
            return "更新失败：可能是用户不存在或其他错误";
        }
    }

    @RequestMapping("/delete")
    public String delete(Integer userId) {
        if(userId == null) {
            log.error("删除失败：用户ID不能为空");
            return "删除失败：用户ID不能为空";
        }

        int result = userService.delete(userId);
        if(result > 0) {
            log.info("用户删除成功，用户ID: {}", userId);
            return "用户删除成功";
        } else {
            log.error("删除失败：可能是用户不存在或其他错误");
            return "删除失败：可能是用户不存在或其他错误";
        }
    }
}
