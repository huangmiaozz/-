package com.textbook.model.entity;

/**
 * 用户实体 — 对应 Users 表
 *
 * 数据库字段:
 *   UserId, Username, Password, DisplayName, IsActive, CreatedAt
 */
public class User {

    private Integer userId;         // 用户ID（自增主键）
    private String username;        // 用户名（唯一）
    private String password;        // 密码（当前明文存储，后续应加密）
    private String displayName;     // 显示名称
    private Boolean isActive;       // 是否启用
    private String createdAt;       // 创建时间

    // ===== 构造器 =====

    public User() {}

    public User(Integer userId, String username, String password,
                String displayName, Boolean isActive, String createdAt) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.displayName = displayName;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    // ===== Getter/Setter =====

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
