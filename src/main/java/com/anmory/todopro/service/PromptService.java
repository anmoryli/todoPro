package com.anmory.todopro.service;

import com.anmory.todopro.mapper.PromptMapper;
import com.anmory.todopro.model.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-20 下午2:20
 */

@Service
public class PromptService {
    @Autowired
    PromptMapper promptMapper;

    public Prompt selectById() {
        return promptMapper.selectById();
    }
}
