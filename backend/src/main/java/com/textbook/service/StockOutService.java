package com.textbook.service;

import com.textbook.model.dto.StockOutDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 出库管理 Service（v3.0 合并表：StockOut 一张表替代主从双表）
 * 触发器 StockOutUpdate 自动扣减库存（不足则回滚）
 */
@Service
public class StockOutService {

    private final JdbcTemplate jdbc;

    public StockOutService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional
    public void add(StockOutDTO dto) {
        Integer maxId = jdbc.queryForObject(
                "SELECT ISNULL(MAX(StockOutId), 0) FROM StockOut", Integer.class);
        int stockOutId = (maxId == null ? 0 : maxId) + 1;

        String sql = "INSERT INTO StockOut (StockOutId, BookId, Quantity, StockOutDate, Operator, DemandId) VALUES (?, ?, ?, ?, ?, ?)";
        for (StockOutDTO.StockOutDetailItem item : dto.getDetails()) {
            jdbc.update(sql, stockOutId, item.getBookId(), item.getQuantity(),
                    dto.getStockOutDate(), dto.getOperatorId(), null);
        }
    }

    public List<Map<String, Object>> listHistory() {
        String sql = """
            SELECT so.StockOutId, so.StockOutDate, u.DisplayName AS OperatorName,
                   so.BookId, tb.Bookname, so.Quantity
            FROM StockOut so
            JOIN Users u ON so.Operator = u.UserId
            JOIN TextBooks tb ON so.BookId = tb.BookId
            ORDER BY so.StockOutId DESC
            """;

        List<Map<String, Object>> flat = jdbc.queryForList(sql);
        Map<Integer, Map<String, Object>> grouped = new LinkedHashMap<>();
        for (Map<String, Object> row : flat) {
            int id = (int) row.get("StockOutId");
            grouped.computeIfAbsent(id, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("stockOutId", id);
                m.put("stockOutDate", row.get("StockOutDate"));
                m.put("operatorName", row.get("OperatorName"));
                m.put("details", new ArrayList<>());
                return m;
            });
            Map<String, Object> detail = new HashMap<>();
            detail.put("bookname", row.get("Bookname"));
            detail.put("quantity", row.get("Quantity"));
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> details = (List<Map<String, Object>>) grouped.get(id).get("details");
            details.add(detail);
        }
        return new ArrayList<>(grouped.values());
    }
}
