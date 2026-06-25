package com.textbook.service;

import com.textbook.model.dto.StockOutDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 出库管理 Service — 对应前端 addStockOutApi()
 *
 * 关键：INSERT StockOutDetails 后，数据库触发器 StockOutUpdate 自动扣减 TextBooks.Stock
 *       如果库存不足，触发器会 ROLLBACK + RAISERROR → Spring 抛出 DataAccessException
 *       → GlobalExceptionHandler 捕获后返回友好提示 {"code":400, "message":"库存不足..."}
 */
@Service
public class StockOutService {

    private final JdbcTemplate jdbc;

    public StockOutService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 新增出库（含明细）
     */
    @Transactional
    public void add(StockOutDTO dto) {
        // 第1步：插入出库主表
        String masterSql = "INSERT INTO StockOut (StockOutDate, Operator) VALUES (?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(masterSql,
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, dto.getStockOutDate());
            ps.setInt(2, dto.getOperatorId());
            return ps;
        }, keyHolder);

        int stockOutId = keyHolder.getKey().intValue();

        // 第2步：批量插入出库明细 → 触发器自动扣库存！
        String detailSql = "INSERT INTO StockOutDetails (StockOutId, BookId, Quantity) VALUES (?, ?, ?)";
        for (StockOutDTO.StockOutDetailItem item : dto.getDetails()) {
            jdbc.update(detailSql, stockOutId, item.getBookId(), item.getQuantity());
        }
    }

    /**
     * 查询出库历史记录（含明细）
     *
     * @return [{ stockOutId, stockOutDate, operatorName, details: [{ bookname, quantity }] }]
     */
    public List<Map<String, Object>> listHistory() {
        String masterSql = """
            SELECT so.StockOutId, so.StockOutDate, u.DisplayName AS OperatorName
            FROM StockOut so
            JOIN Users u ON so.Operator = u.UserId
            ORDER BY so.StockOutId DESC
            """;

        List<Map<String, Object>> result = jdbc.query(masterSql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("stockOutId", rs.getInt("StockOutId"));
            map.put("stockOutDate", rs.getString("StockOutDate"));
            map.put("operatorName", rs.getString("OperatorName"));
            map.put("details", new ArrayList<>());
            return map;
        });

        for (Map<String, Object> record : result) {
            int stockOutId = (int) record.get("stockOutId");
            String detailSql = """
                SELECT tb.Bookname, sod.Quantity
                FROM StockOutDetails sod
                JOIN TextBooks tb ON sod.BookId = tb.BookId
                WHERE sod.StockOutId = ?
                """;
            List<Map<String, Object>> details = jdbc.queryForList(detailSql, stockOutId);
            record.put("details", details);
        }

        return result;
    }
}
