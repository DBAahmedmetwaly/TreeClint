
import sql from 'mssql';

let pool: sql.ConnectionPool | null = null;
let poolConnecting: Promise<sql.ConnectionPool> | null = null;

const connect = async (config: sql.config): Promise<sql.ConnectionPool> => {
    try {
        console.log("Connecting to database...");
        const connectionPool = new sql.ConnectionPool(config);
        const connection = await connectionPool.connect();
        console.log("Database connection successful.");
        connection.on('error', err => {
            console.error("Database connection error:", err);
            pool = null; // Reset pool on error
        });
        return connection;
    } catch (err) {
        console.error("Database connection failed:", err);
        throw err;
    }
};

export const getDbPool = (config: sql.config): Promise<sql.ConnectionPool> => {
    if (pool && pool.connected) {
        return Promise.resolve(pool);
    }
    if (poolConnecting) {
        return poolConnecting;
    }
    poolConnecting = connect(config);
    poolConnecting.then(p => {
        pool = p;
        poolConnecting = null;
    }).catch(() => {
        pool = null;
        poolConnecting = null;
    });
    return poolConnecting;
};
