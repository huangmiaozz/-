package com.textbook.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * 跨域（CORS）配置 — 允许前端页面调用后端 API
 *
 * 为什么需要？
 * 前端页面通过 Live Server 或其他方式打开时，URL 可能为：
 *   http://127.0.0.1:5500/index.html
 * 后端运行在：
 *   http://localhost:8080
 * 不同端口 = 跨域，浏览器会拦截请求，需要后端明确允许。
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 允许的前端来源（开发阶段放开所有来源）
        config.setAllowedOriginPatterns(List.of("*"));

        // 允许携带 Cookie / Authorization 头
        config.setAllowCredentials(true);

        // 允许的 HTTP 方法
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 允许的请求头
        config.setAllowedHeaders(List.of("*"));

        // 预检请求缓存时间（秒）
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);  // 所有路径都允许跨域

        return new CorsFilter(source);
    }
}
