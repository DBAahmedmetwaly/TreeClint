
export const GET_BRANCHES_QUERY = `
-- هذا الاستعلام يجلب قائمة الفروع.
-- يجب أن يُرجع عمودين: 'branch' للقيمة/المعرف، و 'a_name' للتسمية المعروضة.
-- مثال: SELECT branch_code as branch, arabic_name as a_name FROM my_branch_table;
SELECT branch, a_name 
FROM sys_branch 
ORDER BY a_name;
`;

export const UPDATE_CUSTOMER_QUERY = `
-- هذا السكريبت يتحقق مما إذا كان العميل موجودًا وغير مستخدم، ثم يقوم بتحديثه.
-- @cardNumber: رقم كارت العميل (INT)
-- @branchName: اسم الفرع المختار (NVARCHAR)
-- @customerName: اسم العميل (NVARCHAR)
-- @gender: جنس العميل ('1' للذكر, '2' للانثى) (VARCHAR)
-- @phoneNumber: رقم هاتف العمل الخاص بالعميل (VARCHAR)

-- أولاً، تحقق مما إذا كان العميل يفي بالمعايير
IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber AND usage = 0 AND a_name IS NULL) = 1
BEGIN
    -- إذا كان الأمر كذلك، قم بإجراء التحديث
    UPDATE pos_customer
    SET
        branch = @branchName,
        a_name = @customerName,
        sex = @gender,
        usage = 1,
        transdate = GETDATE(),
        work_phone = @phoneNumber
    WHERE
        customerno = @cardNumber AND usage = 0 AND a_name IS NULL;
    
    -- إرجاع رسالة نجاح
    SELECT 'تم تحديث العميل بنجاح.' AS message;
END
ELSE
BEGIN
    -- خلاف ذلك، قم بإرجاع رسالة فشل توضح السبب
    IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber) = 0
    BEGIN
        SELECT 'العميل غير موجود.' AS message;
    END
    ELSE IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber AND usage != 0) > 0
    BEGIN
        SELECT 'العميل مستخدم بالفعل.' AS message;
    END
    ELSE IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber AND a_name IS NOT NULL) > 0
    BEGIN
        SELECT 'اسم العميل مسجل بالفعل.' AS message;
    END
    ELSE
    BEGIN
        SELECT 'العميل لا يفي بمعايير التحديث.' AS message;
    END
END
`;
