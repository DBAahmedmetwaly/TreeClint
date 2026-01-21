
export const GET_BRANCHES_QUERY = `
-- This query retrieves the list of branch names.
-- You can modify this query to match your database schema.
-- For example, if your table is called 'StoreLocations' and the column is 'LocationName',
-- you would change it to: SELECT LocationName AS name FROM StoreLocations ORDER BY LocationName;
-- The query MUST return a single column named 'name'.
SELECT name 
FROM Branches 
ORDER BY name;
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
