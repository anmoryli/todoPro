package com.anmory.todopro.mapper;

import com.anmory.todopro.model.User;
import org.apache.ibatis.annotations.*;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-07-19 下午10:39
 */

@Mapper
public interface UserMapper {
    @Insert("INSERT INTO user (username, password, email, created_at, updated_at) " +
            "VALUES (#{username}, #{password}, #{email}, NOW(), NOW())")
    int insert(String username, String password, String email);

    @Delete("DELETE FROM user WHERE user_id = #{userId}")
    int delete(Integer userId);

    @Update("UPDATE user SET username = #{username}, password = #{password}, email = #{email}, updated_at = NOW() " +
            "WHERE user_id = #{userId}")
    int update(Integer userId, String username, String password, String email);

    @Select("SELECT * FROM user WHERE user_id = #{userId}")
    User selectById(Integer userId);

    @Select("SELECT * FROM user WHERE username = #{username} AND password = #{password}")
    User selectByUsernameAndPassword(String username, String password);

    @Update("UPDATE user SET wall_paper_path = #{wallPaperPath}, updated_at = NOW() " +
            "WHERE user_id = #{userId}")
    int updateWallPaper(int userId, String wallPaperPath);
}
