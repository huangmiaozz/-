package com.textbook.service;

import com.textbook.model.dto.StockInDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;

/**
 * 入库管理 Service — 对应前端 addStockInApi()
 *
 * 关键：INSERT StockInDetails 后，数据库触发器 StockInUpdate 自动增加 TextBooks.Stock
 *       同时 DemandAutoFulfill 触发器自动检测需求是否满足
 *       后端只需插入主表+明细表，不需要手动更新库存！
 */
@Service
public class StockInService {

    private final JdbcTemplate jdbc;

    public StockInService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 新增入库（含明细）
     *
     * @Transactional 确保主表和明细表在同一事务中
     */
    @Transactional
    public void add(StockInDTO dto) {
        // 第1步：插入入库主表
        String masterSql = "INSERT INTO StockIn (StockInDate, Operator) VALUES (?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(masterSql,
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, dto.getStockInDate());
            ps.setInt(2, dto.getOperatorId());
            return ps;
        }, keyHolder);

        // 获取自增主键 StockInId
        int stockInId = keyHolder.getKey().intValue();

        // 第2步：批量插入入库明细 → 触发器自动更新库存！
        String detailSql = "INSERT INTO StockInDetails (StockInId, BookId, Quantity) VALUES (?, ?, ?)";
        for (StockInDTO.StockInDetailItem item : dto.getDetails()) {
            jdbc.update(detailSql, stockInId, item.getBookId(), item.getQuantity());
        }
    }
}
