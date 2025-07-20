package com.anmory.todopro.controller;

import com.anmory.todopro.model.Day;
import com.anmory.todopro.service.DayService;
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
 * @date 2025-07-19 下午11:28
 */

@Slf4j
@RestController
@RequestMapping("/day")
public class DayController {
    @Autowired
    DayService dayService;
    @Autowired
    ToolService toolService;

    @RequestMapping("/insert")
    public int insert(Integer userIdn, String title, String overview,
                      HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        if (title == null || overview == null) {
            log.error("标题或概述不能为空");
            return -1;
        }
        return dayService.insert(userId, title, overview);
    }

    @RequestMapping("/delete")
    public int delete(Integer dayId) {
        if (dayId == null || dayId <= 0) {
            log.error("无效的日记ID");
            return -1;
        }
        return dayService.delete(dayId);
    }

    @RequestMapping("/update")
    public int update(Integer dayId, String title, String overview) {
        if (dayId == null || dayId <= 0 || title == null || overview == null) {
            log.error("无效的日记ID或标题或概述");
            return -1;
        }
        return dayService.update(dayId, title, overview);
    }

    @RequestMapping("/selectById")
    public Day selectById(Integer dayId) {
        if (dayId == null || dayId <= 0) {
            log.error("无效的日记ID");
            return null;
        }
        return dayService.selectById(dayId);
    }

    @RequestMapping("/selectByUserId")
    public List<Day> selectByUserId(Integer userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        if (userId <= 0) {
            log.error("无效的用户ID");
            return null;
        }
        return dayService.selectByUserId(userId);
    }

    @RequestMapping("/selectLastByUserId")
    public Day selectLastByUserId(Integer userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        if (userId <= 0) {
            log.error("无效的用户ID");
            return null;
        }
        return dayService.selectLastByUserId(userId);
    }

    @RequestMapping("/selectLastDay")
    public Day selectLastDay() {
        return dayService.selectLast();
    }
}
