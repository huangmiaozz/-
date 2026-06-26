-- =============================================
-- 教材管理系统 数据库脚本 v3.0（简化版）
-- 16 表 → 9 表：合并主从表、RBAC 简化为 RoleName 字段
-- 角色：Admin / DemandProvider / StockOperator / Viewer
-- =============================================

-- =============================================
-- 第一部分：删除旧表（子表优先，逐级向上）
-- =============================================
DROP TABLE IF EXISTS BookDemandDetails;
GO
DROP TABLE IF EXISTS StockOut;
GO
DROP TABLE IF EXISTS BookOrder;
GO
DROP TABLE IF EXISTS BookDemands;
GO
DROP TABLE IF EXISTS StockIn;
GO
DROP TABLE IF EXISTS TextBooks;
GO
DROP TABLE IF EXISTS Users;
GO
DROP TABLE IF EXISTS Types;
GO
DROP TABLE IF EXISTS Publishers;
GO
DROP PROCEDURE IF EXISTS TextBookStatistics;
GO
DROP TRIGGER IF EXISTS StockInUpdate;
GO
DROP TRIGGER IF EXISTS StockOutUpdate;
GO
DROP TRIGGER IF EXISTS DemandAutoFulfill;
GO

-- =============================================
-- 第二部分：创建新表
-- =============================================

-- Publishers 出版社信息表
CREATE TABLE Publishers (
    PublisherId INT PRIMARY KEY IDENTITY(1,1),
    PublisherName NVARCHAR(100) NOT NULL,
    PublishAddress NVARCHAR(200) NOT NULL,
    PublishPhone NVARCHAR(20) NOT NULL
);
GO

-- Types 教材类型表
CREATE TABLE Types (
    TypeId INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(50) NOT NULL
);
GO

-- TextBooks 教材信息主表
CREATE TABLE TextBooks (
    BookId INT PRIMARY KEY IDENTITY(1,1),
    Bookname NVARCHAR(100) NOT NULL,
    ISBN NVARCHAR(14) NOT NULL UNIQUE,
    Author NVARCHAR(100) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Stock INT NOT NULL CHECK(Stock >= 0),
    PublisherId INT NOT NULL,
    TypeId INT NOT NULL,
    PublishDate DATE NOT NULL,
    FOREIGN KEY (PublisherId) REFERENCES Publishers(PublisherId),
    FOREIGN KEY (TypeId) REFERENCES Types(TypeId),
    CONSTRAINT CHK_ISBN CHECK (
        ISBN LIKE 'ISBN[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    )
);
GO

-- Users 用户表（RoleName 替代 RBAC 五表）
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    DisplayName NVARCHAR(100) NOT NULL,
    RoleName NVARCHAR(50) NOT NULL DEFAULT 'Viewer',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- BookDemands 需求主表
CREATE TABLE BookDemands (
    DemandId INT PRIMARY KEY IDENTITY(1,1),
    DemandTitle NVARCHAR(200) NOT NULL,
    RequesterId INT NOT NULL,
    DemandDate DATE NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',
    Notes NVARCHAR(500),
    FOREIGN KEY (RequesterId) REFERENCES Users(UserId),
    CONSTRAINT CHK_DemandStatus CHECK (Status IN ('active', 'ordered', 'fulfilled', 'cancelled'))
);
GO

-- BookDemandDetails 需求明细表
CREATE TABLE BookDemandDetails (
    DemandDetailId INT PRIMARY KEY IDENTITY(1,1),
    DemandId INT NOT NULL,
    BookId INT NOT NULL,
    Quantity INT NOT NULL CHECK(Quantity > 0),
    FulFilledQuantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (DemandId) REFERENCES BookDemands(DemandId),
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId)
);
GO

-- BookOrder 订购表（合并主从，OrderId+BookId 复合主键）
CREATE TABLE BookOrder (
    OrderId INT NOT NULL,
    BookId INT NOT NULL,
    Quantity INT NOT NULL,
    DemandId INT NULL,
    MerchantName NVARCHAR(100) NOT NULL,
    MerchantPhone NVARCHAR(20) NOT NULL,
    OrderDate DATE NOT NULL,
    Operator INT NOT NULL,
    PRIMARY KEY (OrderId, BookId),
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId),
    FOREIGN KEY (DemandId) REFERENCES BookDemands(DemandId),
    FOREIGN KEY (Operator) REFERENCES Users(UserId)
);
GO

-- StockIn 入库表（合并主从，StockInId+BookId 复合主键）
CREATE TABLE StockIn (
    StockInId INT NOT NULL,
    BookId INT NOT NULL,
    Quantity INT NOT NULL,
    StockInDate DATE NOT NULL,
    Operator INT NOT NULL,
    PRIMARY KEY (StockInId, BookId),
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId),
    FOREIGN KEY (Operator) REFERENCES Users(UserId)
);
GO

-- StockOut 出库表（合并主从，StockOutId+BookId 复合主键）
CREATE TABLE StockOut (
    StockOutId INT NOT NULL,
    BookId INT NOT NULL,
    Quantity INT NOT NULL,
    DemandId INT NULL,
    StockOutDate DATE NOT NULL,
    Operator INT NOT NULL,
    PRIMARY KEY (StockOutId, BookId),
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId),
    FOREIGN KEY (DemandId) REFERENCES BookDemands(DemandId),
    FOREIGN KEY (Operator) REFERENCES Users(UserId)
);
GO

-- =============================================
-- 第三部分：插入基础数据
-- =============================================

INSERT INTO Users (Username, Password, DisplayName, RoleName) VALUES
('admin',    'admin123', '系统管理员',  'Admin'),
('demander', '123456',   '需求提出者',  'DemandProvider'),
('stockop',  '123456',   '库存操作员',  'StockOperator'),
('viewer',   '123456',   '只读人员',    'Viewer');
GO

-- =============================================
-- 第四部分：触发器
-- =============================================

-- 入库触发器：批量增加库存（无需游标）
CREATE TRIGGER StockInUpdate ON StockIn
AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;
    UPDATE tb
    SET Stock = Stock + i.Quantity
    FROM TextBooks tb
    INNER JOIN inserted i ON tb.BookId = i.BookId;
END;
GO

-- 出库触发器：批量扣减库存（无需游标）
CREATE TRIGGER StockOutUpdate ON StockOut
AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted i
        INNER JOIN TextBooks tb ON i.BookId = tb.BookId
        WHERE tb.Stock < i.Quantity
    )
    BEGIN
        RAISERROR(N'库存不足，无法出库！', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    UPDATE tb
    SET Stock = Stock - i.Quantity
    FROM TextBooks tb
    INNER JOIN inserted i ON tb.BookId = i.BookId;
END;
GO

-- 需求自动满足检测触发器
CREATE TRIGGER DemandAutoFulfill ON StockIn
AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;

    UPDATE bdd
    SET FulFilledQuantity = (
        SELECT ISNULL(SUM(si.Quantity), 0)
        FROM StockIn si
        WHERE si.BookId = bdd.BookId
    )
    FROM BookDemandDetails bdd
    INNER JOIN BookDemands bd ON bdd.DemandId = bd.DemandId
    WHERE bd.Status IN ('active', 'ordered')
      AND bdd.BookId IN (SELECT DISTINCT BookId FROM inserted);

    UPDATE BookDemands
    SET Status = 'fulfilled'
    WHERE DemandId IN (
        SELECT bd.DemandId
        FROM BookDemands bd
        INNER JOIN BookDemandDetails bdd ON bd.DemandId = bdd.DemandId
        WHERE bd.Status IN ('active', 'ordered')
        GROUP BY bd.DemandId
        HAVING COUNT(CASE WHEN bdd.FulFilledQuantity >= bdd.Quantity THEN 1 END)
             = COUNT(*)
    );
END;
GO

-- =============================================
-- 第五部分：存储过程
-- =============================================

CREATE PROCEDURE TextBookStatistics
    @BookId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        tb.BookId,
        tb.Bookname,
        tb.ISBN,
        tb.Stock AS CurrentStock,
        ISNULL(ord.OrderTotal, 0) AS OrderQuantity,
        ISNULL(sin.StockInTotal, 0) AS StockInQuantity,
        ISNULL(sout.StockOutTotal, 0) AS StockOutQuantity
    FROM TextBooks tb
    LEFT JOIN (
        SELECT BookId, SUM(Quantity) AS OrderTotal
        FROM BookOrder
        GROUP BY BookId
    ) ord ON tb.BookId = ord.BookId
    LEFT JOIN (
        SELECT BookId, SUM(Quantity) AS StockInTotal
        FROM StockIn
        GROUP BY BookId
    ) sin ON tb.BookId = sin.BookId
    LEFT JOIN (
        SELECT BookId, SUM(Quantity) AS StockOutTotal
        FROM StockOut
        GROUP BY BookId
    ) sout ON tb.BookId = sout.BookId
    WHERE (@BookId IS NULL OR tb.BookId = @BookId)
    ORDER BY tb.BookId;
END;
GO
