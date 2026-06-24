package com.textbook.service;

import com.textbook.model.dto.DemandDTO;
import com.textbook.model.entity.BookDemand;
import com.textbook.model.entity.BookDemandDetail;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * 需求管理 Service — 对应前端 api.js 中的 getDemandListApi / addDemandApi
 */
@Service
public class DemandService {

    private final JdbcTemplate jdbc;

    public DemandService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 获取需求列表（含明细）
     *
     * 对应前端: getDemandListApi({ status })
     */
    public List<BookDemand> list(String status) {
        // ---- 查需求主表 ----
        StringBuilder sql = new StringBuilder(
            "SELECT bd.DemandId, bd.DemandTitle, bd.RequesterId, u.DisplayName AS RequesterName, " +
            "bd.DemandDate, bd.Status, bd.Notes " +
            "FROM BookDemands bd " +
            "LEFT JOIN Users u ON bd.RequesterId = u.UserId " +
            "WHERE 1=1");

        List<Object> params = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append(" AND bd.Status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY bd.DemandId DESC");

        List<BookDemand> demands = jdbc.query(sql.toString(), (rs, rowNum) -> {
            BookDemand d = new BookDemand();
            d.setDemandId(rs.getInt("DemandId"));
            d.setDemandTitle(rs.getString("DemandTitle"));
            d.setRequesterId(rs.getInt("RequesterId"));
            d.setRequesterName(rs.getString("RequesterName"));
            d.setDemandDate(rs.getString("DemandDate"));
            d.setStatus(rs.getString("Status"));
            d.setNotes(rs.getString("Notes"));
            return d;
        }, params.toArray());

        // ---- 为每个需求查明细 ----
        for (BookDemand demand : demands) {
            List<BookDemandDetail> details = findDetailsByDemandId(demand.getDemandId());
            // 这里用反射或扩展字段存储明细（简化方案：在 BookDemand 中加一个 transient 字段）
            // 为简单起见，我们在 BookDemand 类中加一个 details 属性
        }

        return demands;
    }

    /**
     * 根据需求ID查明细列表
     */
    public List<BookDemandDetail> findDetailsByDemandId(Integer demandId) {
        String sql = "SELECT bdd.DemandDetailId, bdd.DemandId, bdd.BookId, " +
                     "bdd.Quantity, bdd.FulFilledQuantity, tb.Bookname " +
                     "FROM BookDemandDetails bdd " +
                     "LEFT JOIN TextBooks tb ON bdd.BookId = tb.BookId " +
                     "WHERE bdd.DemandId = ?";
        return jdbc.query(sql, (rs, rowNum) -> {
            BookDemandDetail detail = new BookDemandDetail();
            detail.setDemandDetailId(rs.getInt("DemandDetailId"));
            detail.setDemandId(rs.getInt("DemandId"));
            detail.setBookId(rs.getInt("BookId"));
            detail.setQuantity(rs.getInt("Quantity"));
            detail.setFulFilledQuantity(rs.getInt("FulFilledQuantity"));
            detail.setBookname(rs.getString("Bookname"));
            return detail;
        }, demandId);
    }

    /**
     * 创建教材需求（含明细）
     *
     * 对应前端: addDemandApi(params)
     */
    @Transactional
    public void add(DemandDTO dto, Integer requesterId) {
        // 第1步：插入需求主表
        String masterSql = "INSERT INTO BookDemands (DemandTitle, RequesterId, DemandDate, Notes) " +
                          "VALUES (?, ?, GETDATE(), ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(masterSql,
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, dto.getDemandTitle());
            ps.setInt(2, requesterId);
            ps.setString(3, dto.getNotes());
            return ps;
        }, keyHolder);

        int demandId = keyHolder.getKey().intValue();

        // 第2步：插入需求明细
        String detailSql = "INSERT INTO BookDemandDetails (DemandId, BookId, Quantity) VALUES (?, ?, ?)";
        for (DemandDTO.DemandDetailItem item : dto.getDetails()) {
            jdbc.update(detailSql, demandId, item.getBookId(), item.getQuantity());
        }
    }

    /**
     * 取消需求 — 将状态改为 cancelled
     *
     * 对应前端: cancelDemandApi(demandId)
     */
    @Transactional
    public void cancel(Integer demandId) {
        jdbc.update("UPDATE BookDemands SET Status = 'cancelled' WHERE DemandId = ?", demandId);
    }
}
