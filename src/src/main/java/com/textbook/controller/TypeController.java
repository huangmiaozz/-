package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.entity.Type;
import com.textbook.service.TypeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 教材类型 Controller — 对应前端 api.js 中的 getTypeListApi()
 *
 * URL: GET /api/types
 * 不需要 @PreAuthorize，所有登录用户都可以查看类型
 */
@RestController
@RequestMapping("/api/types")
public class TypeController {

    private final TypeService typeService;

    public TypeController(TypeService typeService) {
        this.typeService = typeService;
    }

    /**
     * 获取所有教材类型
     */
    @GetMapping
    public Result<List<Type>> listAll() {
        return Result.success(typeService.listAll());
    }
}
