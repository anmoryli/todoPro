package com.anmory.todopro.mapper;

import com.anmory.todopro.model.Day;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-07-19 下午11:23
 */

@Mapper
public interface DayMapper {
    @Insert("INSERT INTO day (user_id, title, overview, created_at, updated_at) " +
            "VALUES (#{userId}, #{title}, #{overview}, NOW(), NOW())")
    int insert(Integer userId, String title, String overview);

    @Delete("DELETE FROM day WHERE day_id = #{dayId}")
    int delete(Integer dayId);

    @Update("UPDATE day SET title = #{title}, overview = #{overview}, updated_at = NOW() " +
            "WHERE day_id = #{dayId}")
    int update(Integer dayId, String title, String overview);

    @Select("SELECT * FROM day WHERE day_id = #{dayId}")
    Day selectById(Integer dayId);

    @Select("SELECT * FROM day WHERE user_id = #{userId}")
    List<Day> selectByUserId(Integer userId);

    @Select("SELECT * FROM day WHERE user_id = #{userId} ORDER BY created_at DESC LIMIT 1")
    Day selectLastByUserId(Integer userId);

    @Select("SELECT * FROM day ORDER BY created_at DESC LIMIT 1")
    Day selectLast();
}
