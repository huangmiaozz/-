package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 登录请求 DTO — 对应前端 loginApi(params)
 *
 * 前端请求: { "username": "admin", "password": "admin123" }
 */
public class LoginDTO {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    // ===== Getter/Setter =====

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
