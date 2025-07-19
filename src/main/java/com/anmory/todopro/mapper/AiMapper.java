package com.anmory.todopro.mapper;

import com.anmory.todopro.model.Ai;
import com.anmory.todopro.model.AiOverview;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午11:59
 */

@Mapper
public interface AiMapper {
    @Insert("INSERT INTO ai (overall_id, user_id, title, daily_goals, created_at, updated_at) " +
            "VALUES (#{overallId}, #{userId}, #{title}, #{dailyGoals}, NOW(), NOW())")
    int insert(int overallId, int userId, String title, String dailyGoals);

    @Update("update ai set is_checked = true, updated_at = now() where ai_id = #{aiId} and is_checked = false")
    int updateChecked(int aiId);

    @Update("update ai set is_accepted = true, updated_at = now() where ai_id = #{aiId} and is_accepted = false")
    int updateAccepted(int aiId);

    @Insert("INSERT INTO ai_overview (user_id, title, overview, created_at, updated_at) " +
            "VALUES (#{userId}, #{title}, #{overview}, NOW(), NOW())")
    int insertOverview(int userId, String title, String overview);

    @Select("SELECT * FROM ai_overview WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<AiOverview> selectAllOverviewsByUserId(int userId);

    @Select("SELECT * FROM ai_overview WHERE ai_overview_id = #{overviewId} ORDER BY created_at DESC LIMIT 1")
    AiOverview selectOverviewById(int overviewId);

    @Select("SELECT * FROM ai WHERE user_id = #{userId} ORDER BY created_at DESC LIMIT 1")
    Ai selectLastByUserId(int userId);
}
