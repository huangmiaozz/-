package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.dto.RegisterDTO;
import com.textbook.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户管理 Controller — 仅 Admin 可访问
 *
 * URL:
 *   GET    /api/users       → 用户列表
 *   POST   /api/users       → 创建用户
 *   DELETE /api/users/{id}  → 删除用户
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 获取所有用户列表（含角色信息）
     */
    @GetMapping
    @PreAuthorize("hasAuthority('user:view')")
    public Result<List<Map<String, Object>>> listUsers() {
        return Result.success(userService.listUsers());
    }

    /**
     * 创建新用户（Admin 分配角色）
     */
    @PostMapping
    @PreAuthorize("hasAuthority('user:create')")
    public Result<Map<String, Object>> createUser(@RequestBody @Valid RegisterDTO dto) {
        int userId = userService.createUser(dto);
        return Result.success("用户创建成功",
                Map.of("userId", userId, "username", dto.getUsername()));
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('user:delete')")
    public Result<Void> deleteUser(@PathVariable int userId) {
        userService.deleteUser(userId);
        return Result.success("用户删除成功");
    }
}
