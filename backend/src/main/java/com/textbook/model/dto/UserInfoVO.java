package com.textbook.model.dto;

/**
 * 用户信息 VO — 对应前端 userInfo 字段
 */
public class UserInfoVO {

    private Integer userId;
    private String username;
    private String displayName;
    private String role;           // Admin / DemandProvider / StockOperator / Viewer
    private String roleName;       // 管理员 / 需求提出者 / 库存操作员 / 只读人员

    public UserInfoVO() {}

    public UserInfoVO(Integer userId, String username, String displayName,
                      String role, String roleName) {
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.role = role;
        this.roleName = roleName;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
