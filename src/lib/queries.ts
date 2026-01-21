
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
