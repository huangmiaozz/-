-- =============================================
-- 第一部分：基础数据（出版社、类型、教材）
-- =============================================

-- ==================== 出版社数据 ====================
INSERT INTO Publishers (PublisherName, PublishAddress, PublishPhone) VALUES
('高等教育出版社',   '北京市朝阳区惠新东街4号',       '010-58581114'),
('人民教育出版社',   '北京市海淀区中关村南大街17号',   '010-58758866'),
('清华大学出版社',   '北京市海淀区清华大学学研大厦',   '010-62776969'),
('机械工业出版社',   '北京市西城区百万庄大街22号',     '010-88379999'),
('电子工业出版社',   '北京市丰台区金家村288号',        '010-88258888');
GO

-- ==================== 教材类型数据 ====================
INSERT INTO Types (TypeName) VALUES
(N'数学'),
(N'英语'),
(N'计算机'),
(N'物理'),
(N'语文');
GO

-- ==================== 教材数据 ====================
-- 高等教育出版社 - 数学类
INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'高等数学（第七版）上册', 'ISBN9787040487', N'同济大学数学系', 56.00, 50,
    p.PublisherId, t.TypeId, '2014-07-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'高等教育出版社' AND t.TypeName = N'数学';
GO

INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'线性代数', 'ISBN9787040488', N'同济大学数学系', 35.00, 40,
    p.PublisherId, t.TypeId, '2014-06-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'高等教育出版社' AND t.TypeName = N'数学';
GO

INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'概率论与数理统计', 'ISBN9787040489', N'浙江大学盛骤', 42.00, 45,
    p.PublisherId, t.TypeId, '2014-06-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'高等教育出版社' AND t.TypeName = N'数学';
GO

-- 高等教育出版社 - 英语类
INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'大学英语综合教程1', 'ISBN9787040490', N'李荫华', 58.00, 30,
    p.PublisherId, t.TypeId, '2020-03-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'高等教育出版社' AND t.TypeName = N'英语';
GO

-- 高等教育出版社 - 物理类
INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'大学物理（第三版）上册', 'ISBN9787040491', N'赵凯华', 62.00, 25,
    p.PublisherId, t.TypeId, '2020-08-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'高等教育出版社' AND t.TypeName = N'物理';
GO

-- 清华大学出版社 - 计算机类
INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'C程序设计（第五版）', 'ISBN9787302482', N'谭浩强', 49.00, 80,
    p.PublisherId, t.TypeId, '2017-08-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'清华大学出版社' AND t.TypeName = N'计算机';
GO

INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'数据结构（C语言版）', 'ISBN9787302334', N'严蔚敏', 45.00, 60,
    p.PublisherId, t.TypeId, '2013-10-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'清华大学出版社' AND t.TypeName = N'计算机';
GO

-- 机械工业出版社 - 计算机类
INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'计算机网络（第7版）', 'ISBN9787115492', N'谢希仁', 59.00, 35,
    p.PublisherId, t.TypeId, '2017-01-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'机械工业出版社' AND t.TypeName = N'计算机';
GO

-- 人民教育出版社 - 英语类
INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'新概念英语2', 'ISBN9787560013', N'亚历山大（L.G.Alexander）', 38.00, 55,
    p.PublisherId, t.TypeId, '1997-10-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'人民教育出版社' AND t.TypeName = N'英语';
GO

-- 电子工业出版社 - 语文类
INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate)
SELECT N'大学语文（第十版）', 'ISBN9787121382', N'徐中玉', 45.00, 20,
    p.PublisherId, t.TypeId, '2018-07-01'
FROM Publishers p, Types t
WHERE p.PublisherName = N'电子工业出版社' AND t.TypeName = N'语文';
GO

-- =============================================
-- 第二部分：业务数据（v3.0 兼容）
-- =============================================

-- ==================== 需求数据 ====================
INSERT INTO BookDemands (DemandTitle, RequesterId, DemandDate, Status, Notes)
SELECT N'2024秋季学期教材需求', u.UserId, '2024-08-15', 'fulfilled', N'新学期教学用书需求'
FROM Users u WHERE u.Username = 'demander';
GO

INSERT INTO BookDemands (DemandTitle, RequesterId, DemandDate, Status, Notes)
SELECT N'计算机系补充教材', u.UserId, '2024-09-01', 'ordered', N'计算机科学与技术专业用书'
FROM Users u WHERE u.Username = 'demander';
GO

INSERT INTO BookDemands (DemandTitle, RequesterId, DemandDate, Status, Notes)
SELECT N'数学系考研参考书', u.UserId, '2024-09-10', 'active', N'考研数学参考教材'
FROM Users u WHERE u.Username = 'demander';
GO

-- 需求明细
INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 30, 30
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'2024秋季学期教材需求' AND t.Bookname = N'高等数学（第七版）上册';
GO

INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 25, 25
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'2024秋季学期教材需求' AND t.Bookname = N'线性代数';
GO

INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 20, 20
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'2024秋季学期教材需求' AND t.Bookname = N'大学英语综合教程1';
GO

INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 40, 10
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'计算机系补充教材' AND t.Bookname = N'C程序设计（第五版）';
GO

INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 30, 10
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'计算机系补充教材' AND t.Bookname = N'数据结构（C语言版）';
GO

INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 20, 0
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'计算机系补充教材' AND t.Bookname = N'计算机网络（第7版）';
GO

INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 30, 0
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'数学系考研参考书' AND t.Bookname = N'概率论与数理统计';
GO

INSERT INTO BookDemandDetails (DemandId, BookId, Quantity, FulFilledQuantity)
SELECT d.DemandId, t.BookId, 20, 0
FROM BookDemands d, TextBooks t
WHERE d.DemandTitle = N'数学系考研参考书' AND t.Bookname = N'高等数学（第七版）上册';
GO

-- ==================== 订购数据（v3.0 单表） ====================
DECLARE @op INT; SELECT @op = UserId FROM Users WHERE Username = 'stockop';
DECLARE @d1 INT; SELECT @d1 = DemandId FROM BookDemands WHERE DemandTitle = N'2024秋季学期教材需求';
DECLARE @d2 INT; SELECT @d2 = DemandId FROM BookDemands WHERE DemandTitle = N'计算机系补充教材';

-- 订购1：新华书店，3本教材
INSERT INTO BookOrder (OrderId, BookId, Quantity, DemandId, MerchantName, MerchantPhone, OrderDate, Operator)
SELECT 1, t.BookId, v.Qty, @d1, N'新华书店教材中心', '010-66083913', '2024-08-16', @op
FROM (VALUES
    (N'高等数学（第七版）上册', 30),
    (N'线性代数', 25),
    (N'大学英语综合教程1', 20)
) AS v(Bookname, Qty)
JOIN TextBooks t ON t.Bookname = v.Bookname;
GO

-- 订购2：清华大学出版社，3本教材
INSERT INTO BookOrder (OrderId, BookId, Quantity, DemandId, MerchantName, MerchantPhone, OrderDate, Operator)
SELECT 2, t.BookId, v.Qty, @d2, N'清华大学出版社发行部', '010-62776970', '2024-09-02', @op
FROM (VALUES
    (N'C程序设计（第五版）', 40),
    (N'数据结构（C语言版）', 30),
    (N'计算机网络（第7版）', 20)
) AS v(Bookname, Qty)
JOIN TextBooks t ON t.Bookname = v.Bookname;
GO

-- ==================== 入库数据（v3.0 单表 + 触发器自动更新库存） ====================
-- 入库1：订购1全部到货
INSERT INTO StockIn (StockInId, BookId, Quantity, StockInDate, Operator)
SELECT 1, t.BookId, v.Qty, '2024-08-20', @op
FROM (VALUES
    (N'高等数学（第七版）上册', 30),
    (N'线性代数', 25),
    (N'大学英语综合教程1', 20)
) AS v(Bookname, Qty)
JOIN TextBooks t ON t.Bookname = v.Bookname;
GO

-- 入库2：订购2部分到货（各到10本）
INSERT INTO StockIn (StockInId, BookId, Quantity, StockInDate, Operator)
SELECT 2, t.BookId, v.Qty, '2024-09-05', @op
FROM (VALUES
    (N'C程序设计（第五版）', 10),
    (N'数据结构（C语言版）', 10)
) AS v(Bookname, Qty)
JOIN TextBooks t ON t.Bookname = v.Bookname;
GO

-- ==================== 出库数据（v3.0 单表 + 触发器自动扣库存） ====================
INSERT INTO StockOut (StockOutId, BookId, Quantity, DemandId, StockOutDate, Operator)
SELECT 1, t.BookId, v.Qty, @d1, '2024-08-25', @op
FROM (VALUES
    (N'高等数学（第七版）上册', 30),
    (N'线性代数', 25),
    (N'大学英语综合教程1', 20)
) AS v(Bookname, Qty)
JOIN TextBooks t ON t.Bookname = v.Bookname;
GO

PRINT N'初始数据导入成功！';
