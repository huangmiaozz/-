package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.model.dto.PublisherDTO;
import com.textbook.model.entity.Publisher;
import com.textbook.service.PublisherService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 出版社管理 Controller — 对应前端 api.js 中的:
 *   getPublisherListApi() / deletePublisherApi()
 */
@RestController
@RequestMapping("/api/publishers")
public class PublisherController {

    private final PublisherService publisherService;

    public PublisherController(PublisherService publisherService) {
        this.publisherService = publisherService;
    }

    /**
     * 获取所有出版社
     *
     * 前端请求: GET /api/publishers
     */
    @GetMapping
    @PreAuthorize("hasAuthority('publisher:view')")
    public Result<List<Publisher>> listAll() {
        return Result.success(publisherService.listAll());
    }

    /**
     * 添加出版社
     */
    @PostMapping
    @PreAuthorize("hasAuthority('publisher:create')")
    public Result<Void> add(@RequestBody @Valid PublisherDTO dto) {
        publisherService.add(dto);
        return Result.success("添加成功");
    }

    /**
     * 删除出版社
     */
    @DeleteMapping("/{publisherId}")
    @PreAuthorize("hasAuthority('publisher:delete')")
    public Result<Void> delete(@PathVariable Integer publisherId) {
        publisherService.delete(publisherId);
        return Result.success("删除成功");
    }
}
