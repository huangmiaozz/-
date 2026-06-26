package com.textbook.service;

import com.textbook.model.dto.StockInDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 入库管理 Service（v3.0 合并表：StockIn 一张表替代主从双表）
 * 触发器 StockInUpdate 自动更新 TextBooks.Stock
 */
@Service
public class StockInService {

    private final JdbcTemplate jdbc;

    public StockInService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional
    public void add(StockInDTO dto) {
        // 生成新 StockInId
        Integer maxId = jdbc.queryForObject(
                "SELECT ISNULL(MAX(StockInId), 0) FROM StockIn", Integer.class);
        int stockInId = (maxId == null ? 0 : maxId) + 1;

        // 逐本教材插入一行 → 触发器自动累加库存
        String sql = "INSERT INTO StockIn (StockInId, BookId, Quantity, StockInDate, Operator) VALUES (?, ?, ?, ?, ?)";
        for (StockInDTO.StockInDetailItem item : dto.getDetails()) {
            jdbc.update(sql, stockInId, item.getBookId(), item.getQuantity(),
                    dto.getStockInDate(), dto.getOperatorId());
        }
    }

    public List<Map<String, Object>> listHistory() {
        String sql = """
            SELECT si.StockInId, si.StockInDate, u.DisplayName AS OperatorName,
                   si.BookId, tb.Bookname, si.Quantity
            FROM StockIn si
            JOIN Users u ON si.Operator = u.UserId
            JOIN TextBooks tb ON si.BookId = tb.BookId
            ORDER BY si.StockInId DESC
            """;

        List<Map<String, Object>> flat = jdbc.queryForList(sql);

        // 按 StockInId 分组
        Map<Integer, Map<String, Object>> grouped = new LinkedHashMap<>();
        for (Map<String, Object> row : flat) {
            int id = (int) row.get("StockInId");
            grouped.computeIfAbsent(id, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("stockInId", id);
                m.put("stockInDate", row.get("StockInDate"));
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
