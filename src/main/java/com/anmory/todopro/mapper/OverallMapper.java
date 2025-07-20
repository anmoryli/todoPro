package com.anmory.todopro.mapper;

import com.anmory.todopro.model.Overall;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-07-19 下午10:59
 */

@Mapper
public interface OverallMapper {
    @Insert("INSERT INTO overall (user_id, name, description, img_path, created_at, updated_at) " +
            "VALUES (#{userId}, #{name}, #{description}, #{imgPath}, NOW(), NOW())")
    int insert(Integer userId, String name, String description, String imgPath);

    @Delete("DELETE FROM overall WHERE overall_id = #{overallId}")
    int delete(Integer overallId);

    @Update("UPDATE overall SET name = #{name}, description = #{description}, img_path = #{imgPath}, " +
            "is_completed = #{isCompleted}, updated_at = NOW() WHERE overall_id = #{overallId}")
    int update(Integer overallId, String name, String description, String imgPath, Boolean isCompleted);

    @Update("UPDATE overall SET is_completed = TRUE, updated_at = NOW() " +
            "WHERE overall_id = #{overallId} AND is_completed = FALSE")
    int complete(Integer overallId);

    @Update("UPDATE overall SET is_completed = FALSE, updated_at = NOW() " +
            "WHERE overall_id = #{overallId} AND is_completed = TRUE")
    int deCompleted(Integer overallId);

    @Select("SELECT * FROM overall WHERE overall_id = #{overallId}")
    Overall selectById(Integer overallId);

    @Select("SELECT * FROM overall WHERE user_id = #{userId}")
    List<Overall> selectByUserId(Integer userId);

    @Select("select * from overall where user_id = #{userId} order by created_at desc limit 1")
    Overall selectLastByUserId(Integer userId);

    @Select("SELECT * FROM overall WHERE user_id = #{userId} ORDER BY created_at DESC LIMIT 10")
    List<Overall> selectLastTenOverallsByUserId(Integer userId) throws Exception;
}
