package com.textbook.controller;

import com.textbook.common.Result;
import com.textbook.service.StatisticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 统计 Controller — 对应前端 api.js 中的 getStatisticsApi()
 *
 * URL: GET /api/statistics
 * 调用数据库存储过程 TextBookStatistics
 */
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * 获取教材统计数据
     */
    @GetMapping
    @PreAuthorize("hasAuthority('statistics:view')")
    public Result<List<Map<String, Object>>> getStatistics() {
        return Result.success(statisticsService.getStatistics());
    }
}
