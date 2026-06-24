package com.textbook.service;

import com.textbook.model.dto.OrderDTO;
import com.textbook.model.entity.BookOrder;
import com.textbook.model.entity.BookOrderDetail;
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
 * 订购管理 Service — 对应前端 api.js 中的 orderBookApi() / getPendingStockApi()
 */
@Service
public class OrderService {

    private final JdbcTemplate jdbc;

    public OrderService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 查询所有订购单（含明细）— 对应前端 getPendingStockApi()
     */
    public List<Map<String, Object>> listAll() {
        String sql = "SELECT o.OrderId, o.MerchantName, o.MerchantPhone, o.OrderDate, " +
                     "u.DisplayName AS OperatorName, o.Operator AS OperatorId " +
                     "FROM BookOrder o " +
                     "LEFT JOIN Users u ON o.Operator = u.UserId " +
                     "ORDER BY o.OrderId DESC";
        List<Map<String, Object>> orders = jdbc.queryForList(sql);

        for (Map<String, Object> order : orders) {
            Integer orderId = (Integer) order.get("OrderId");
            String detailSql = "SELECT od.OrderDetailId, od.OrderId, od.BookId, od.Quantity, " +
                              "tb.Bookname, tb.ISBN, tb.Author, tb.Price, " +
                              "p.PublisherName, t.TypeName " +
                              "FROM BookOrderDetails od " +
                              "LEFT JOIN TextBooks tb ON od.BookId = tb.BookId " +
                              "LEFT JOIN Publishers p ON tb.PublisherId = p.PublisherId " +
                              "LEFT JOIN Types t ON tb.TypeId = t.TypeId " +
                              "WHERE od.OrderId = ?";
            List<Map<String, Object>> details = jdbc.queryForList(detailSql, orderId);
            order.put("details", details);
        }
        return orders;
    }

    /**
     * 创建订购单（含明细）
     */
    @Transactional
    public void add(OrderDTO dto) {
        String masterSql = "INSERT INTO BookOrder (DemandId, MerchantName, MerchantPhone, Operator, OrderDate) " +
                          "VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(masterSql,
                    Statement.RETURN_GENERATED_KEYS);
            if (dto.getDemandId() != null) {
                ps.setInt(1, dto.getDemandId());
            } else {
                ps.setNull(1, java.sql.Types.INTEGER);
            }
            ps.setString(2, dto.getMerchantName());
            ps.setString(3, dto.getMerchantPhone());
            ps.setInt(4, dto.getOperatorId());
            ps.setString(5, new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date()));
            return ps;
        }, keyHolder);

        int orderId = keyHolder.getKey().intValue();

        String detailSql = "INSERT INTO BookOrderDetails (OrderId, BookId, Quantity) VALUES (?, ?, ?)";
        for (OrderDTO.OrderDetailItem item : dto.getDetails()) {
            jdbc.update(detailSql, orderId, item.getBookId(), item.getQuantity());
        }
    }

    /**
     * 删除订购单（含明细）— 对应前端 removePendingStockApi()
     */
    @Transactional
    public void delete(Integer orderId) {
        jdbc.update("DELETE FROM BookOrderDetails WHERE OrderId = ?", orderId);
        jdbc.update("DELETE FROM BookOrder WHERE OrderId = ?", orderId);
    }
}
