package com.anmory.todopro.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-07-20 下午2:18
 */

@Mapper
public interface PromptMapper {
    @Select("SELECT * FROM prompt")
    com.anmory.todopro.model.Prompt selectById();
}
