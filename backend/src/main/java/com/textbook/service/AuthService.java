package com.textbook.service;

import com.textbook.model.dto.LoginDTO;
import com.textbook.model.dto.LoginVO;
import com.textbook.model.dto.UserInfoVO;
import com.textbook.model.entity.User;
import com.textbook.util.JwtUtil;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 认证 Service — 对应前端 api.js 中的 loginApi()
 *
 * 流程:
 * 1. 查 Users 表验证用户名密码（BCrypt 加密比对）
 * 2. 读取 RoleName 字段，按角色映射硬编码权限列表
 * 3. 用 JwtUtil 生成 Token
 * 4. 返回 {token, userInfo, permissions}
 */
@Service
public class AuthService {

    private final JdbcTemplate jdbc;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(JdbcTemplate jdbc, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 根据角色名获取硬编码权限列表
     */
    private List<String> getPermissionsByRole(String roleName) {
        return switch (roleName) {
            case "Admin" -> List.of(
                // 全部查看权限
                "book:view", "demand:view", "order:view", "stockin:view", "stockout:view",
                "publisher:view", "statistics:view",
                // 用户管理
                "user:view", "user:create", "user:edit", "user:delete",
                // 角色管理
                "role:manage"
            );
            case "StockOperator" -> List.of(
                "book:view", "book:create", "book:edit", "book:delete",
                "demand:view",
                "order:view", "order:create", "order:edit", "order:delete",
                "stockin:view", "stockin:create", "stockin:edit", "stockin:delete",
                "stockout:view", "stockout:create", "stockout:edit", "stockout:delete",
                "publisher:view", "publisher:create", "publisher:edit", "publisher:delete",
                "statistics:view"
            );
            case "DemandProvider" -> List.of(
                "book:view",
                "demand:view", "demand:create", "demand:edit", "demand:delete",
                "order:view",
                "stockin:view", "stockout:view",
                "publisher:view", "publisher:create", "publisher:edit", "publisher:delete",
                "statistics:view"
            );
            case "Viewer" -> List.of(
                "book:view", "demand:view", "order:view",
                "stockin:view", "stockout:view",
                "publisher:view", "statistics:view"
            );
            default -> List.of();
        };
    }

    /**
     * 用户登录
     *
     * @param dto { username, password }
     * @return LoginVO { token, userInfo, permissions }
     */
    public LoginVO login(LoginDTO dto) {
        // ===== 第1步：查用户（含 RoleName） =====
        String sql = "SELECT UserId, Username, Password, DisplayName, RoleName, IsActive " +
                     "FROM Users WHERE Username = ?";
        List<User> users = jdbc.query(sql, (rs, rowNum) -> {
            User u = new User();
            u.setUserId(rs.getInt("UserId"));
            u.setUsername(rs.getString("Username"));
            u.setPassword(rs.getString("Password"));
            u.setDisplayName(rs.getString("DisplayName"));
            u.setRoleName(rs.getString("RoleName"));
            u.setIsActive(rs.getBoolean("IsActive"));
            return u;
        }, dto.getUsername());

        if (users.isEmpty()) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        User user = users.get(0);

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new IllegalArgumentException("该账号已被禁用");
        }

        // 验证密码：BCrypt 优先，兼容明文
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())
                && !user.getPassword().equals(dto.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        // ===== 第2步：读取 RoleName，硬编码获取权限 =====
        String roleName = user.getRoleName();
        if (roleName == null || roleName.isEmpty()) {
            throw new IllegalArgumentException("该用户未分配角色，请联系管理员");
        }

        List<String> permissions = getPermissionsByRole(roleName);

        // 角色中文名映射
        String roleDisplayName = switch (roleName) {
            case "Admin"           -> "管理员";
            case "DemandProvider"  -> "需求提出者";
            case "StockOperator"   -> "库存操作员";
            case "Viewer"          -> "只读人员";
            default                -> roleName;
        };

        // ===== 第3步：生成 JWT =====
        String token = jwtUtil.generateToken(user.getUserId(), roleName, permissions);

        // ===== 第4步：组装返回数据 =====
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
