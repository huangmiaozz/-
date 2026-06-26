package com.textbook.service;

import com.textbook.model.dto.RegisterDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户管理 Service — 仅 Admin 角色可调用
 *
 * 职责：
 * 1. 列出所有用户及其角色
 * 2. 创建新用户（BCrypt 加密密码 + 分配角色）
 * 3. 删除用户（级联删除 UserRoles 关联）
 */
@Service
public class UserService {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    public UserService(JdbcTemplate jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 获取所有用户列表（含角色信息）
     */
    public List<Map<String, Object>> listUsers() {
        String sql = """
            SELECT UserId, Username, DisplayName, RoleName, IsActive, CreatedAt
            FROM Users
            ORDER BY UserId
            """;

        return jdbc.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", rs.getInt("UserId"));
            map.put("username", rs.getString("Username"));
            map.put("displayName", rs.getString("DisplayName"));
            map.put("isActive", rs.getBoolean("IsActive"));
            map.put("createdAt", rs.getString("CreatedAt"));

            String role = rs.getString("RoleName");
            map.put("roleName", role);
            map.put("roleDisplayName", role != null ? switch (role) {
                case "Admin"           -> "管理员";
                case "DemandProvider"  -> "需求提出者";
                case "StockOperator"   -> "库存操作员";
                case "Viewer"          -> "只读人员";
                default                -> role;
            } : "未分配");

            return map;
        });
    }

    /**
     * 创建新用户（BCrypt 加密密码 + 分配角色）
     *
     * @param dto { username, password, displayName, roleName }
     * @return 新建用户的 userId
     */
    @Transactional
    public int createUser(RegisterDTO dto) {
        // 1. 检查用户名
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM Users WHERE Username = ?",
                Integer.class, dto.getUsername());
        if (count != null && count > 0) {
            throw new IllegalArgumentException("用户名 '" + dto.getUsername() + "' 已存在");
        }

        // 2. 加密密码
        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        // 3. 插入用户（直接写 RoleName）
        String insertUserSql = """
            INSERT INTO Users (Username, Password, DisplayName, RoleName)
            OUTPUT INSERTED.UserId
            VALUES (?, ?, ?, ?)
            """;
        return jdbc.queryForObject(insertUserSql, Integer.class,
                dto.getUsername(), encodedPassword, dto.getDisplayName(), dto.getRoleName());
    }

    @Transactional
    public void deleteUser(int userId) {
        int rows = jdbc.update("DELETE FROM Users WHERE UserId = ?", userId);
        if (rows == 0) {
            throw new IllegalArgumentException("用户 ID " + userId + " 不存在");
        }
    }
}
