package com.textbook.config;

import com.textbook.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT 认证过滤器 — 每个请求进来时自动执行
 *
 * 流程：
 * 1. 从请求头取 "Authorization: Bearer xxx"
 * 2. 解析 Token，提取用户ID、角色、权限
 * 3. 把用户信息放入 SecurityContext（Spring Security 的"当前用户"）
 * 4. 后续 Controller 的 @PreAuthorize 就能根据这些信息判断权限
 *
 * 对应前端：api.js 中每个 fetch 都应该带
 *   headers: { 'Authorization': `Bearer ${getToken()}` }
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 从请求头中提取 Token
        String token = extractToken(request);

        // 2. 如果有 Token 且有效，则解析并设置认证信息
        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            // 2a. 提取用户信息
            Integer userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            List<String> permissions = jwtUtil.getPermissionsFromToken(token);

            // 2b. 将权限码转为 Spring Security 的 GrantedAuthority
            //     "book:view" → SimpleGrantedAuthority("book:view")
            List<GrantedAuthority> authorities = permissions.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            // 2c. 构建认证对象
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, token, authorities);

            // 2d. 存入 SecurityContext（Spring Security 就知道"当前用户是谁"了）
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 3. 继续执行后续过滤器 → Controller
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求头中提取 Bearer Token
     * 前端请求格式: Authorization: Bearer eyJhbGciOi...
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);  // 去掉 "Bearer " 前缀
        }
        return null;
    }
}
