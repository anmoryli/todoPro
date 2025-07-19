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
        String prompt = "你是一个todo生成助手，基于以下信息生成待办事项：\n" +
                "待办事项列表：" + todos + "\n" +
                "总体任务：" + overall + "\n" +
                "请生成一个结构化的待办事项列表，不能有其他任何格式，不能有其他任何多余的标点，格式为：\n" +
                "{待办标题1}[待办1],{待办标题2}[待办2],{待办标题2}[待办2],{待办标题3}[待办4]@\n" +
                ",代表待办事项之间的分隔符,@代表结束,生成的待办数量在3~7个之间,由你自己决定。\n" +
                "请注意，待办事项应简洁明了，能够准确描述任务内容。";
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

        // 处理@符号（如果存在），确保它不会干扰解析
        String cleanedResponse = aiResponse.replaceAll("@.*$", "").trim();

        // 定义正则表达式模式以匹配 "{待办标题}[待办事项]" 格式
        Pattern pattern = Pattern.compile("\\{([^}]+)\\}\\[([^\\]]+)\\]");
        Matcher matcher = pattern.matcher(cleanedResponse);

        while (matcher.find()) {
            String title = matcher.group(1).trim();
            String task = matcher.group(2).trim();

            result.add(new TodoItem(title, task));
        }
        return result;
    }
}
