package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.dto.OrderDTO;
import com.textbook.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 订购管理 Controller — 对应前端 api.js 中的:
 *   orderBookApi() / getPendingStockApi() / removePendingStockApi()
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * 查询所有订购单（含明细）— 对应前端 getPendingStockApi()
     */
    @GetMapping
    @PreAuthorize("hasAuthority('order:view')")
    public Result<List<Map<String, Object>>> listAll() {
        return Result.success(orderService.listAll());
    }

    /**
     * 创建订购单 — 对应前端 orderBookApi()
     */
    @PostMapping
    @PreAuthorize("hasAuthority('order:create')")
    public Result<Void> add(@RequestBody @Valid OrderDTO dto) {
        orderService.add(dto);
        return Result.success("订购成功");
    }

    /**
     * 删除订购单 — 对应前端 removePendingStockApi()
     */
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasAuthority('order:delete')")
    public Result<Void> delete(@PathVariable Integer orderId) {
        orderService.delete(orderId);
        return Result.success("移除成功");
    }
}
