package com.anmory.todopro.service;

import com.anmory.todopro.dto.TodoItem;
import com.anmory.todopro.model.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午11:10
 */

@Slf4j
@Service
public class ToolService {
    @Autowired
    PromptService promptService;

    public int resolveUserId(HttpServletRequest request, Integer userIdn) {
        if (userIdn != null && userIdn > 0) {
            log.debug("使用userIdn参数获取用户ID：{}", userIdn);
            return userIdn;
        }

        User loginUser = (User) request.getSession().getAttribute("session_user_key");
        if (loginUser != null && loginUser.getUserId() > 0) {
            log.debug("使用Session获取用户ID：{}", loginUser.getUserId());
            return loginUser.getUserId();
        }

        return -1;
    }

    private final OpenAiChatModel openAiChatModel;

    public ToolService(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    public String todoGenerate(@RequestParam(value = "message",defaultValue = "你是谁")
                       String todos,
                       String overall,
                       @RequestParam String sessionId) {
        String prompt = promptService.selectById().getContent();
        prompt += "{todos}和{overall}的内容是:" +
                todos + "以及" + overall + "\n";
        System.out.println("prompt:"+ prompt);
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,sessionId,100);
        ChatClient chatClient = ChatClient.builder(openAiChatModel)
                .defaultSystem(prompt)
                .defaultAdvisors(messageChatMemoryAdvisor)
                .build();
        return chatClient.prompt()
                .user("生成待办事项列表")
                .advisors(messageChatMemoryAdvisor)
                .call()
                .content();
    }

    public String aiSummary(@RequestParam(value = "message",defaultValue = "你是谁")
                               String todoss,
                               String overalls,
                               @RequestParam String sessionId) {
        String prompt = "你是一个总结助手，基于以下信息生成总结：\n" +
                "最近的总体任务:"+ overalls + "\n" +
                "待办事项列表：" + todoss + "\n" +
                "请用纯文本生成一个简洁的总结，不能有其他任何格式，不能有其他任何多余的标点,\n" +
                "总结应包括待办事项的主要内容和总体任务的概述，字数在500~1000字之间。\n";
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,sessionId,100);
        ChatClient chatClient = ChatClient.builder(openAiChatModel)
                .defaultSystem(prompt)
                .defaultAdvisors(messageChatMemoryAdvisor)
                .build();
        return chatClient.prompt()
                .user("生成总结")
                .advisors(messageChatMemoryAdvisor)
                .call()
                .content();
    }

    public List<TodoItem> parseTodoList(String aiResponse) {
        List<TodoItem> result = new ArrayList<>();

        // 移除@符号及其后的所有内容，并去除首尾空格
        String cleanedResponse = aiResponse.replaceAll("@.*$", "").trim();

        // 定义新的正则表达式模式，匹配 "(标题)[任务]" 格式
        Pattern pattern = Pattern.compile("\\(([^)]+)\\)\\[([^\\]]+)\\]");
        Matcher matcher = pattern.matcher(cleanedResponse);

        while (matcher.find()) {
            String title = matcher.group(1).trim();  // 提取括号内的标题部分
            String task = matcher.group(2).trim();   // 提取方括号内的任务部分
            result.add(new TodoItem(title, task));
        }

        System.out.println(result);  // 打印解析结果（可根据需要移除）
        return result;
    }
}
