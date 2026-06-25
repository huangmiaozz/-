package com.textbook.service;

import com.textbook.model.dto.StockInDTO;
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

    /**
     * 查询入库历史记录（含明细）
     *
     * @return [{ stockInId, stockInDate, operatorName, details: [{ bookname, quantity }] }]
     */
    public List<Map<String, Object>> listHistory() {
        // 查询所有入库主记录
        String masterSql = """
            SELECT si.StockInId, si.StockInDate, u.DisplayName AS OperatorName
            FROM StockIn si
            JOIN Users u ON si.Operator = u.UserId
            ORDER BY si.StockInId DESC
            """;

        List<Map<String, Object>> result = jdbc.query(masterSql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("stockInId", rs.getInt("StockInId"));
            map.put("stockInDate", rs.getString("StockInDate"));
            map.put("operatorName", rs.getString("OperatorName"));
            map.put("details", new ArrayList<>());
            return map;
        });

        // 查询每条主记录的明细
        for (Map<String, Object> record : result) {
            int stockInId = (int) record.get("stockInId");
            String detailSql = """
                SELECT tb.Bookname, sid.Quantity
                FROM StockInDetails sid
                JOIN TextBooks tb ON sid.BookId = tb.BookId
                WHERE sid.StockInId = ?
                """;
            List<Map<String, Object>> details = jdbc.queryForList(detailSql, stockInId);
            record.put("details", details);
        }

        return result;
    }
}
