package com.anmory.todopro.mapper;

import com.anmory.todopro.model.Todo;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-07-19 下午11:17
 */

@Mapper
public interface TodoMapper {
    @Insert("INSERT INTO todo (day_id, overall_id, user_id, title, description, created_at, updated_at) " +
            "VALUES (#{dayId}, #{overallId}, #{userId}, #{title}, #{description}, NOW(), NOW())")
    int insert(Integer dayId, Integer overallId, Integer userId, String title, String description);

    @Delete("DELETE FROM todo WHERE todo_id = #{todoId}")
    int delete(Integer todoId);

    @Update("UPDATE todo SET title = #{title}, description = #{description}, " +
            "updated_at = NOW() WHERE todo_id = #{todoId}")
    int update(Integer todoId, String title, String description);

    @Update("UPDATE todo SET is_completed = TRUE, updated_at = NOW() " +
            "WHERE todo_id = #{todoId} AND is_completed = FALSE")
    int complete(Integer todoId);

    @Select("SELECT * FROM todo WHERE todo_id = #{todoId}")
    List<Todo> selectByDayId(Integer dayId);

    @Select("SELECT * FROM todo WHERE overall_id = #{overallId}")
    List<Todo> selectByOverallId(Integer overallId);

    @Select("SELECT * FROM todo WHERE user_id = #{userId}")
    List<Todo> selectByUserId(Integer userId);

    @Select("SELECT * FROM todo WHERE day_id = #{dayId} and is_completed = false ORDER BY created_at DESC")
    List<Todo> selectNotCompletedByDayId(Integer dayId);

    @Select("SELECT * FROM todo WHERE overall_id = #{overallId} and is_completed = false ORDER BY created_at DESC")
    List<Todo> selectNotCompletedByOverallId(Integer overallId);
}
