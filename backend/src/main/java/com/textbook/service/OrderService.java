package com.textbook.service;

import com.textbook.model.dto.OrderDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 订购管理 Service（v3.0 合并表：BookOrder 一张表替代主从双表）
 */
@Service
public class OrderService {

    private final JdbcTemplate jdbc;

    public OrderService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Map<String, Object>> listAll() {
        String sql = """
            SELECT o.OrderId, o.MerchantName, o.MerchantPhone, o.OrderDate,
                   u.DisplayName AS OperatorName, o.BookId, tb.Bookname, tb.ISBN,
                   tb.Author, tb.Price, p.PublisherName, t.TypeName, o.Quantity
            FROM BookOrder o
            LEFT JOIN Users u ON o.Operator = u.UserId
            LEFT JOIN TextBooks tb ON o.BookId = tb.BookId
            LEFT JOIN Publishers p ON tb.PublisherId = p.PublisherId
            LEFT JOIN Types t ON tb.TypeId = t.TypeId
            ORDER BY o.OrderId DESC
            """;
        return jdbc.queryForList(sql);
    }

    @Transactional
    public void add(OrderDTO dto) {
        Integer maxId = jdbc.queryForObject(
                "SELECT ISNULL(MAX(OrderId), 0) FROM BookOrder", Integer.class);
        int orderId = (maxId == null ? 0 : maxId) + 1;

        String dateStr = new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date());
        String sql = "INSERT INTO BookOrder (OrderId, BookId, Quantity, DemandId, MerchantName, MerchantPhone, OrderDate, Operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        for (OrderDTO.OrderDetailItem item : dto.getDetails()) {
            jdbc.update(sql, orderId, item.getBookId(), item.getQuantity(),
                    dto.getDemandId(), dto.getMerchantName(), dto.getMerchantPhone(),
                    dateStr, dto.getOperatorId());
        }
    }

    @Transactional
    public void delete(Integer orderId) {
        jdbc.update("DELETE FROM BookOrder WHERE OrderId = ?", orderId);
    }
}
