package com.textbook.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 统计 Service — 调用数据库存储过程 TextBookStatistics
 *
 * 对应前端 api.js 中的 getStatisticsApi()
 */
@Service
public class StatisticsService {

    private final JdbcTemplate jdbc;

    public StatisticsService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 获取教材统计数据（调用存储过程）
     *
     * 存储过程 TextBookStatistics 返回:
     *   BookId, Bookname, ISBN, CurrentStock,
     *   OrderQuantity, StockInQuantity, StockOutQuantity
     */
    public List<Map<String, Object>> getStatistics() {
        // 调用存储过程: EXEC TextBookStatistics
        return jdbc.queryForList("EXEC TextBookStatistics");
    }
}
