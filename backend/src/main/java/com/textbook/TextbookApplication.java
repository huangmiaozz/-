package com.textbook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 教材管理系统 — Spring Boot 启动类
 *
 * @SpringBootApplication = 三个注解的合体：
 *   @Configuration  — 允许定义 Bean
 *   @EnableAutoConfiguration — 自动配置（连数据库、启 Web 等）
 *   @ComponentScan  — 扫描当前包及子包中的组件
 */
@SpringBootApplication
public class TextbookApplication {

    public static void main(String[] args) {
        SpringApplication.run(TextbookApplication.class, args);
        System.out.println("========================================");
        System.out.println("  教材管理系统后端启动成功！");
        System.out.println("  访问地址: http://localhost:8080");
        System.out.println("========================================");
    }
}
