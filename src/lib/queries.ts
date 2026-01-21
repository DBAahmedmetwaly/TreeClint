
export const GET_BRANCHES_QUERY = `
-- This query retrieves the list of branches.
-- It MUST return two columns: 'branch' for the value/ID, and 'a_name' for the display label.
-- Example: SELECT branch_code as branch, arabic_name as a_name FROM my_branch_table;
SELECT branch, a_name 
FROM sys_branch 
ORDER BY a_name;
`;

export const UPDATE_CUSTOMER_QUERY = `
-- This script checks if a customer exists and is unused, then updates it.
-- @cardNumber: The customer's card number (INT)
-- @branchName: The selected branch name (NVARCHAR)
-- @customerName: The customer's name (NVARCHAR)
-- @gender: The customer's gender ('1' for male, '2' for female) (VARCHAR)
-- @phoneNumber: The customer's work phone (VARCHAR)

-- First, check if the customer meets the criteria
IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber AND usage = 0 AND a_name IS NULL) = 1
BEGIN
    -- If so, perform the update
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
    
    -- Return a success message
    SELECT 'Customer updated successfully.' AS message;
END
ELSE
BEGIN
    -- Otherwise, return a failure message explaining why
    IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber) = 0
    BEGIN
        SELECT 'Customer not found.' AS message;
    END
    ELSE IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber AND usage != 0) > 0
    BEGIN
        SELECT 'Customer is already in use.' AS message;
    END
    ELSE IF (SELECT COUNT(*) FROM pos_customer WHERE customerno = @cardNumber AND a_name IS NOT NULL) > 0
    BEGIN
        SELECT 'Customer name is not null.' AS message;
    END
    ELSE
    BEGIN
        SELECT 'Customer does not meet update criteria.' AS message;
    END
END
`;
