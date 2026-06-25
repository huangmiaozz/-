package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.dto.StockInDTO;
import com.textbook.service.StockInService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 入库管理 Controller — 对应前端 api.js 中的 addStockInApi()
 */
@RestController
@RequestMapping("/api/stock-in")
public class StockInController {

    private final StockInService stockInService;

    public StockInController(StockInService stockInService) {
        this.stockInService = stockInService;
    }

    /**
     * 新增入库
     *
     * 前端请求: POST /api/stock-in
     *          Body: {"stockInDate":"2024-01-15", "operatorId":1,
     *                 "details":[{"bookId":1, "quantity":10}]}
     */
    @PostMapping
    @PreAuthorize("hasAuthority('stockin:create')")
    public Result<Void> add(@RequestBody @Valid StockInDTO dto) {
        stockInService.add(dto);
        return Result.success("入库成功");
    }

    /**
     * 查询入库历史（仅 Admin 可见）
     */
    @GetMapping
    @PreAuthorize("hasAuthority('role:manage')")
    public Result<List<Map<String, Object>>> listHistory() {
        return Result.success(stockInService.listHistory());
    }
}
