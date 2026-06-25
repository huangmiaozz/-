package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 注册/创建用户请求 DTO
 *
 * 前端请求: { "username": "xxx", "password": "xxx", "displayName": "xxx", "roleName": "Viewer" }
 */
public class RegisterDTO {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @NotBlank(message = "显示名称不能为空")
    private String displayName;

    @NotBlank(message = "角色不能为空")
    private String roleName;      // 角色名：Admin / StockOperator / DemandProvider / Viewer

    // ===== Getter/Setter =====

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
