package com.textbook.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

/**
 * JWT 工具类 — 负责生成 Token 和解析 Token
 *
 * JWT（JSON Web Token）结构（用 . 分隔的三段 Base64）：
 *   Header.Payload.Signature
 *
 * 本项目中 Token 负载（Payload）包含：
 *   - sub (subject):  用户 ID
 *   - role:           角色名（Admin/DemandProvider/StockOperator/Viewer）
 *   - permissions:    权限码列表（如 ["book:view", "book:create"]）
 *   - iat (issuedAt): 签发时间
 *   - exp (expiration): 过期时间
 *
 * 对应前端：登录成功后 sessionStorage.setItem('auth_token', token)
 * 后续请求在 Header 中携带: Authorization: Bearer <token>
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;                      // 密钥（从 application.yml 读取）

    @Value("${jwt.expiration}")
    private long expiration;                    // 过期时间（毫秒）

    /**
     * 获取签名密钥
     * HS256 算法要求密钥至少 256 位（32 字节）
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成 JWT Token
     *
     * @param userId      用户 ID
     * @param role        角色名
     * @param permissions 权限码列表
     * @return JWT 字符串（xxx.yyy.zzz 格式）
     */
    public String generateToken(Integer userId, String role, List<String> permissions) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(String.valueOf(userId))   // sub: 用户ID
                .claim("role", role)               // 自定义字段: 角色
                .claim("permissions", permissions) // 自定义字段: 权限列表
                .issuedAt(now)                     // iat: 签发时间
                .expiration(expiryDate)            // exp: 过期时间
                .signWith(getSigningKey())         // 签名
                .compact();                        // 生成字符串
    }

    /**
     * 从 Token 中解析出 Claims（负载数据）
     *
     * @param token JWT 字符串
     * @return Claims 对象（包含 sub, role, permissions 等）
     * @throws JwtException Token 无效或过期时抛出
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 从 Token 中获取用户 ID
     */
    public Integer getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Integer.valueOf(claims.getSubject());
    }

    /**
     * 从 Token 中获取角色名
     */
    public String getRoleFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }

    /**
     * 从 Token 中获取权限列表
     */
    @SuppressWarnings("unchecked")
    public List<String> getPermissionsFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("permissions", List.class);
    }

    /**
     * 验证 Token 是否有效（未过期、签名正确）
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
