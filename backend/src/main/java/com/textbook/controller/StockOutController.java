package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.dto.StockOutDTO;
import com.textbook.service.StockOutService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 出库管理 Controller — 对应前端 api.js 中的 addStockOutApi()
 */
@RestController
@RequestMapping("/api/stock-out")
public class StockOutController {

    private final StockOutService stockOutService;

    public StockOutController(StockOutService stockOutService) {
        this.stockOutService = stockOutService;
    }

    /**
     * 新增出库
     *
     * 前端请求: POST /api/stock-out
     *          Body: {"stockOutDate":"2024-01-15", "operatorId":1,
     *                 "details":[{"bookId":1, "quantity":5}]}
     *
     * 如果库存不足，触发器会抛异常 → GlobalExceptionHandler 返回 400 错误
     */
    @PostMapping
    @PreAuthorize("hasAuthority('stockout:create')")
    public Result<Void> add(@RequestBody @Valid StockOutDTO dto) {
        stockOutService.add(dto);
        return Result.success("出库成功");
    }

    /**
     * 查询出库历史（仅 Admin 可见）
     */
    @GetMapping
    @PreAuthorize("hasAuthority('role:manage')")
    public Result<List<Map<String, Object>>> listHistory() {
        return Result.success(stockOutService.listHistory());
    }
}
