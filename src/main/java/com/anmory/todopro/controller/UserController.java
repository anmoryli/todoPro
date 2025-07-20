package com.anmory.todopro.controller;

import com.anmory.todopro.model.User;
import com.anmory.todopro.service.ToolService;
import com.anmory.todopro.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

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
    @Autowired
    ToolService toolService;

    @RequestMapping("/uploadSelfWallPaper")
    public int uploadSelfWallPaper(Integer userIdn,
                                      @RequestParam(required = false) MultipartFile file,
                                      HttpServletRequest request) throws IOException {
        int userId = toolService.resolveUserId(request, userIdn);
        String imgPath = null;  // 默认为null（无图片）

        // 关键：先判断file是否为null，再判断是否为空
        if (file != null && !file.isEmpty()) {  // 只有文件存在且非空时才处理
            String fileName = file.getOriginalFilename();
            // 注意添加路径分隔符，避免文件名拼接错误
            String filePath = "/usr/local/nginx/images/todoPro/" + fileName;
            imgPath = filePath;

            File dir = new File("/usr/local/nginx/images/todoPro/");
            if (!dir.exists()) {
                dir.mkdirs();
            }

            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(file.getBytes());
                log.info("文件上传成功：{}", filePath);
            } catch (IOException e) {
                log.error("文件写入失败：{}", e.getMessage());
                return -1;
            }
        } else {
            log.info("未上传文件或文件为空，跳过文件处理");  // 空文件时直接跳过
        }

        int ret = userService.updateWallPaper(userId, imgPath);
        if (ret > 0) {
            log.info("用户 {} 的壁纸更新成功，路径：{}", userId, imgPath);
            return ret;
        } else {
            log.error("用户 {} 的壁纸更新失败", userId);
            return -1;
        }
    }

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
