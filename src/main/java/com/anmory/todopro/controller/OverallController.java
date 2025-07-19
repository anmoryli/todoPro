package com.anmory.todopro.controller;

import com.anmory.todopro.service.OverallService;
import com.anmory.todopro.service.ToolService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-07-19 下午11:07
 */

@Slf4j
@RestController
@RequestMapping("/overall")
public class OverallController {
    @Autowired
    OverallService overallService;
    @Autowired
    ToolService toolService;

    @RequestMapping("/insert")
    public int insert(Integer userIdn,
                      String name,
                      String description,
                      MultipartFile file,
                      HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        // 校验文件是否为空
        if (file.isEmpty()) {
            log.error("文件上传失败：文件为空");
            return -1;
        }

        // 处理文件存储
        String fileName = file.getOriginalFilename();
        String filePath = "/usr/local/nginx/images/todoPro" + fileName;
        String imgPath = filePath;
        File dir = new File("/usr/local/nginx/images/todoPro");
        if (!dir.exists()) {
            dir.mkdirs();
        }

        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(file.getBytes());
            log.info("文件上传成功：{}", filePath);
        } catch (IOException e) {
            log.error("文件写入失败：{}", e.getMessage());
            return -1;
        }
        // 保存图片到服务器
        log.info("插入新的Overall记录，用户ID: {}, 名称: {}, 描述: {}, 图片路径: {}", userId, name, description, imgPath);
        return overallService.insert(userId, name, description, imgPath);
    }

    @RequestMapping("/delete")
    public int delete(Integer overallId) {
        log.info("删除Overall记录，ID: {}", overallId);
        return overallService.delete(overallId);
    }

    @RequestMapping("/update")
    public int update(Integer overallId,
                      String name,
                      String description,
                      MultipartFile file,
                      Boolean isCompleted) {
        String imgPath = null;
        if (file != null && !file.isEmpty()) {
            // 处理文件存储
            String fileName = file.getOriginalFilename();
            imgPath = "/usr/local/nginx/images/todoPro" + fileName;
            File dir = new File("/usr/local/nginx/images/todoPro");
            if (!dir.exists()) {
                dir.mkdirs();
            }

            try (FileOutputStream fos = new FileOutputStream(imgPath)) {
                fos.write(file.getBytes());
                log.info("文件上传成功：{}", imgPath);
            } catch (IOException e) {
                log.error("文件写入失败：{}", e.getMessage());
                return -1;
            }
        }
        log.info("更新Overall记录，ID: {}, 名称: {}, 描述: {}, 图片路径: {}, 完成状态: {}", overallId, name, description, imgPath, isCompleted);
        return overallService.update(overallId, name, description, imgPath, isCompleted);
    }

    @RequestMapping("/complete")
    public int complete(Integer overallId) {
        log.info("完成Overall记录，ID: {}", overallId);
        return overallService.complete(overallId);
    }

    @RequestMapping("/selectById")
    public com.anmory.todopro.model.Overall selectById(Integer overallId) {
        log.info("查询Overall记录，ID: {}", overallId);
        return overallService.selectById(overallId);
    }

    @RequestMapping("/selectByUserId")
    public java.util.List<com.anmory.todopro.model.Overall> selectByUserId(Integer userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        log.info("查询用户ID={}的所有Overall记录", userId);
        return overallService.selectByUserId(userId);
    }


    @RequestMapping("/selectLastByUserId")
    public com.anmory.todopro.model.Overall selectLastByUserId(Integer userIdn, HttpServletRequest request) {
        int userId = toolService.resolveUserId(request, userIdn);
        log.info("查询用户ID={}的最后一个Overall记录", userId);
        return overallService.selectLastByUserId(userId);
    }
}
