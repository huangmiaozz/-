package com.textbook.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 核心配置类
 *
 * 职责：
 * 1. 配置哪些 URL 需要登录、哪些不需要
 * 2. 关闭 Session（用 JWT 代替）
 * 3. 把 JWT 过滤器加到过滤器链中
 * 4. 启用方法级权限注解（@PreAuthorize）
 * 5. 提供密码加密器
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // 启用 @PreAuthorize 注解
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    /**
     * 密码加密器 — 使用 BCrypt 算法
     * 注意：当前数据库中密码是明文存储的（admin123 / 123456）
     * 后续应改为 BCrypt 加密存储
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 安全过滤器链 — Spring Security 的核心配置
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. 关闭 CSRF（前后端分离 + JWT 不需要）
            .csrf(csrf -> csrf.disable())

            // 2. 关闭 Session（JWT 无状态，不需要服务端 Session）
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 3. URL 权限配置
            .authorizeHttpRequests(auth -> auth
                // 登录接口：允许所有人访问
                .requestMatchers("/api/auth/login").permitAll()
                // GET 请求（查看）：只需要登录即可（具体权限由 @PreAuthorize 控制）
                .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                // 其他所有请求：需要登录
                .requestMatchers("/api/**").authenticated()
                // 非 API 路径：允许（健康检查等）
                .anyRequest().permitAll()
            )

            // 4. 把 JWT 过滤器加到 UsernamePasswordAuthenticationFilter 之前
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
