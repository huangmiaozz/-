package com.textbook.service;

import com.textbook.model.dto.LoginDTO;
import com.textbook.model.dto.LoginVO;
import com.textbook.model.dto.UserInfoVO;
import com.textbook.model.entity.User;
import com.textbook.util.JwtUtil;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 认证 Service — 对应前端 api.js 中的 loginApi()
 *
 * 流程:
 * 1. 查 Users 表验证用户名密码
 * 2. 查 UserRoles + Roles 表获取角色
 * 3. 查 RolePermissions + Permissions 表获取权限列表
 * 4. 用 JwtUtil 生成 Token
 * 5. 返回 {token, userInfo, permissions}
 */
@Service
public class AuthService {

    private final JdbcTemplate jdbc;
    private final JwtUtil jwtUtil;

    public AuthService(JdbcTemplate jdbc, JwtUtil jwtUtil) {
        this.jdbc = jdbc;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 用户登录
     *
     * @param dto { username, password }
     * @return LoginVO { token, userInfo, permissions }
     */
    public LoginVO login(LoginDTO dto) {
        // ===== 第1步：查用户 =====
        String sql = "SELECT UserId, Username, Password, DisplayName, IsActive " +
                     "FROM Users WHERE Username = ?";
        List<User> users = jdbc.query(sql, (rs, rowNum) -> {
            User u = new User();
            u.setUserId(rs.getInt("UserId"));
            u.setUsername(rs.getString("Username"));
            u.setPassword(rs.getString("Password"));
            u.setDisplayName(rs.getString("DisplayName"));
            u.setIsActive(rs.getBoolean("IsActive"));
            return u;
        }, dto.getUsername());

        if (users.isEmpty()) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        User user = users.get(0);

        // 验证是否启用
        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new IllegalArgumentException("该账号已被禁用");
        }

        // 验证密码（当前数据库存的是明文，后续改为 BCrypt 比对）
        if (!user.getPassword().equals(dto.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        // ===== 第2步：查角色 =====
        String roleSql = "SELECT r.RoleId, r.RoleName " +
                        "FROM Roles r " +
                        "JOIN UserRoles ur ON r.RoleId = ur.RoleId " +
                        "WHERE ur.UserId = ?";
        List<String> roleNames = jdbc.query(roleSql, (rs, rowNum) ->
            rs.getString("RoleName"), user.getUserId());

        if (roleNames.isEmpty()) {
            throw new IllegalArgumentException("该用户未分配角色，请联系管理员");
        }

        // 取第一个角色（当前设计是一个用户一个角色）
        String roleName = roleNames.get(0);

        // 角色中文名映射
        String roleDisplayName = switch (roleName) {
            case "Admin"           -> "管理员";
            case "DemandProvider"  -> "需求提出者";
            case "StockOperator"   -> "库存操作员";
            case "Viewer"          -> "只读人员";
            default                -> roleName;
        };

        // ===== 第3步：查权限列表 =====
        String permSql = "SELECT p.PermissionCode " +
                        "FROM Permissions p " +
                        "JOIN RolePermissions rp ON p.PermissionId = rp.PermissionId " +
                        "JOIN UserRoles ur ON rp.RoleId = ur.RoleId " +
                        "WHERE ur.UserId = ?";
        List<String> permissions = jdbc.queryForList(permSql, String.class, user.getUserId());

        // ===== 第4步：生成 JWT =====
        String token = jwtUtil.generateToken(user.getUserId(), roleName, permissions);

        // ===== 第5步：组装返回数据 =====
        UserInfoVO userInfo = new UserInfoVO(
                user.getUserId(),
                user.getUsername(),
                user.getDisplayName(),
                roleName,
                roleDisplayName
        );

        return new LoginVO(token, userInfo, permissions);
    }
}
