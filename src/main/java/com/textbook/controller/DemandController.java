package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.dto.DemandDTO;
import com.textbook.model.entity.BookDemand;
import com.textbook.model.entity.BookDemandDetail;
import com.textbook.service.DemandService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 需求管理 Controller — 对应前端 api.js 中的:
 *   getDemandListApi() / addDemandApi()
 */
@RestController
@RequestMapping("/api/demands")
public class DemandController {

    private final DemandService demandService;

    public DemandController(DemandService demandService) {
        this.demandService = demandService;
    }

    /**
     * 获取需求列表（含明细）
     *
     * 前端请求: GET /api/demands?status=active
     */
    @GetMapping
    @PreAuthorize("hasAuthority('demand:view')")
    public Result<List<Map<String, Object>>> list(
            @RequestParam(required = false) String status) {
        // 查主表
        List<BookDemand> demands = demandService.list(status);

        // 为每个需求附加明细列表
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (BookDemand d : demands) {
            List<BookDemandDetail> details = demandService.findDetailsByDemandId(d.getDemandId());

            Map<String, Object> item = new HashMap<>();
            item.put("demandId", d.getDemandId());
            item.put("demandTitle", d.getDemandTitle());
            item.put("requesterId", d.getRequesterId());
            item.put("requesterName", d.getRequesterName());
            item.put("demandDate", d.getDemandDate());
            item.put("status", d.getStatus());
            item.put("notes", d.getNotes());
            item.put("details", details);
            result.add(item);
        }
        return Result.success(result);
    }

    /**
     * 创建教材需求
     *
     * 前端请求: POST /api/demands
     *          Body: {"demandTitle":"xxx", "notes":"xxx",
     *                 "details":[{"bookId":1, "quantity":60}]}
     *
     * 需求提出人ID 从 JWT Token 中自动获取
     */
    @PostMapping
    @PreAuthorize("hasAuthority('demand:create')")
    public Result<Void> add(@RequestBody @Valid DemandDTO dto, Authentication auth) {
        // 从 JWT Token 中获取当前用户ID（即需求提出人ID）
        Integer requesterId = (Integer) auth.getPrincipal();
        demandService.add(dto, requesterId);
        return Result.success("需求创建成功");
    }

    /**
     * 取消需求 — 对应前端 cancelDemandApi(demandId)
     */
    @PutMapping("/{demandId}/cancel")
    @PreAuthorize("hasAuthority('demand:edit')")
    public Result<Void> cancel(@PathVariable Integer demandId) {
        demandService.cancel(demandId);
        return Result.success("需求已取消");
    }
}
