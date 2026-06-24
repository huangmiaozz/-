package com.textbook.common;

/**
 * 统一响应结果类 — 对应前端 api.js 所有函数期望的返回格式
 *
 * 前端期望格式:
 * {
 *   "code": 200,          // 状态码
 *   "message": "success", // 提示信息
 *   "data": { ... }       // 数据（可以是对象、数组、null）
 * }
 *
 * <T> 是 Java 泛型：data 字段的类型由调用者决定
 * 例如 Result<Book>      → data 是单个 Book 对象
 *      Result<List<Book>> → data 是 Book 数组
 *      Result<Void>       → data 是 null
 */
public class Result<T> {

    private int code;           // 状态码：200=成功，401=未登录，403=无权限，500=服务器错误
    private String message;     // 提示信息
    private T data;             // 数据体（泛型，什么类型都可以）

    // ---- 私有构造器，外部用静态工厂方法创建实例 ----

    private Result() {}

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // ===== 快速创建成功响应 =====

    /** 成功 + 数据 */
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    /** 成功 + 自定义消息 + 数据 */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data);
    }

    /** 成功 + 仅消息（用于增删改操作） */
    public static <T> Result<T> success(String message) {
        return new Result<>(200, message, null);
    }

    // ===== 快速创建失败响应 =====

    /** 失败 + 状态码 + 消息 */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    // ===== 常用错误快捷方法 =====

    public static <T> Result<T> unauthorized(String message) {
        return error(401, message);
    }

    public static <T> Result<T> forbidden(String message) {
        return error(403, message);
    }

    public static <T> Result<T> badRequest(String message) {
        return error(400, message);
    }

    // ===== Lombok 不使用时手动提供 Getter/Setter =====

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
