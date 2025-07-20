package com.anmory.todopro.controller;

import com.anmory.todopro.model.Day;
import com.anmory.todopro.service.DayService;
import com.anmory.todopro.service.ToolService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
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
    public int insert(Integer userIdn, String title, String overview, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        if (title == null || overview == null) {
            log.error("标题或概述不能为空，用户ID: {}", userId);
            return -1;
        }

        LocalDate currentDate = LocalDate.now();
        Integer dayId = null;

        try {
            // 1. 先查询当前用户当天是否已有记录（按用户隔离）
            Day todayDay = dayService.selectByUserIdAndDate(userId, currentDate);

            if (todayDay != null) {
                // 2. 存在当天记录，直接使用
                dayId = todayDay.getDayId();
                log.info("用户 {} 当天已有总结记录，使用ID: {}", userId, dayId);
                // 可选：如果需要更新标题/概述，添加更新逻辑
                // dayService.updateOverview(dayId, title, overview);
            } else {
                // 3. 不存在则创建新记录（借助数据库唯一约束防止并发重复）
                int insertRow = dayService.insert(userId, title, overview);
                if (insertRow <= 0) {
                    log.error("用户 {} 创建当天总结失败", userId);
                    return -1;
                }
                // 4. 按用户ID查询刚创建的记录（确保获取当前用户的记录）
                Day newDay = dayService.selectByUserIdAndDate(userId, currentDate);
                if (newDay == null) {
                    log.error("用户 {} 创建后未查询到当天记录", userId);
                    return -1;
                }
                dayId = newDay.getDayId();
                log.info("用户 {} 新建当天总结记录，ID: {}", userId, dayId);
            }

            // 5. 此处原逻辑的insert2可能是冗余操作，按实际需求保留（建议删除或明确用途）
            return dayId; // 返回有效dayId更合理

        } catch (DuplicateKeyException e) {
            // 捕获并发插入导致的唯一约束冲突（多用户同时创建时）
            log.warn("用户 {} 当天总结已存在（并发冲突），直接使用现有记录", userId);
            Day existDay = dayService.selectByUserIdAndDate(userId, currentDate);
            return existDay != null ? existDay.getDayId() : -1;
        } catch (Exception e) {
            log.error("用户 {} 总结插入失败", userId, e);
            return -1;
        }
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
