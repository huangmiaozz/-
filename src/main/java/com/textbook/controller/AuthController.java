package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.dto.LoginDTO;
import com.textbook.model.dto.LoginVO;
import com.textbook.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * 认证 Controller — 对应前端 api.js 中的 loginApi()
 *
 * URL: POST /api/auth/login
 * 无需登录即可访问（SecurityConfig 中配置了 permitAll）
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 用户登录
     *
     * 前端请求: POST /api/auth/login
     *          Body: {"username":"admin", "password":"admin123"}
     *
     * 后端返回: {"code":200, "message":"success",
     *            "data":{"token":"xxx", "userInfo":{...}, "permissions":[...]}}
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody @Valid LoginDTO dto) {
        LoginVO result = authService.login(dto);
        return Result.success(result);
    }
}
