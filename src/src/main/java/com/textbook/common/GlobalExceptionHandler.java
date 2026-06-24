package com.textbook.common;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器 — 统一拦截所有未捕获的异常，返回前端期望的 JSON 格式
 *
 * 作用：
 * 1. 把 Java 异常翻译成前端能看懂的 {code, message, data:null}
 * 2. 避免异常直接暴露给前端（安全 + 友好提示）
 * 3. 出库库存不足时，数据库触发器会 RAISERROR → 这里捕获并返回
 */
@RestControllerAdvice   // 拦截所有 @RestController 的异常
public class GlobalExceptionHandler {

    /**
     * 权限不足（Security 框架抛出）
     * 返回: {"code":403, "message":"权限不足", "data":null}
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Result<Void>> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Result.forbidden("您没有此操作的权限"));
    }

    /**
     * 数据库操作异常（包含触发器 RAISERROR 抛出的错误）
     * 例如：出库时库存不足，触发器抛 "库存不足，无法出库！"
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Result<Void>> handleDataAccess(DataAccessException e) {
        // 提取 SQL Server 错误消息
        String message = e.getMostSpecificCause().getMessage();
        // 去掉 SQL Server 错误号前缀，使提示更友好
        if (message != null && message.contains("库存不足")) {
            return ResponseEntity.badRequest()
                    .body(Result.badRequest(message));
        }
        return ResponseEntity.internalServerError()
                .body(Result.error(500, "数据库操作失败: " + message));
    }

    /**
     * 参数校验异常（@Valid 校验失败）
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<Void>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(Result.badRequest(e.getMessage()));
    }

    /**
     * 兜底：其他所有未捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleOther(Exception e) {
        e.printStackTrace();  // 打印堆栈到控制台，便于调试
        return ResponseEntity.internalServerError()
                .body(Result.error(500, "服务器内部错误: " + e.getMessage()));
    }
}
