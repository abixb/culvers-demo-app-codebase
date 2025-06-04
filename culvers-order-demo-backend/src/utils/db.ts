    // src/utils/db.ts
    import sql from 'mssql';

    // Database configuration - values will come from environment variables
    // These are set in local.settings.json for local development
    // and in Azure Function App Application Settings for deployed function
    const dbConfig: sql.config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        server: process.env.DB_SERVER as string, // Type assertion as process.env values can be undefined
        port: parseInt(process.env.DB_PORT || "1433"),
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true', // Should be true for Azure SQL
            trustServerCertificate: false // Default is false, good for security
        }
    };

    // Create a connection pool. This is more efficient than creating a new connection for every request.
    // The pool is created once and reused.
    const poolPromise = new sql.ConnectionPool(dbConfig)
        .connect()
        .then(pool => {
            console.log('Connected to MSSQL database successfully!');
            return pool;
        })
        .catch(err => {
            console.error('Database Connection Failed! Check configuration and network: ', err);
            // In a real app, you might want to implement retry logic or gracefully handle this
            // For the demo, if this fails, the function won't work, which is an important point.
            throw err; // Re-throw to make it clear connection failed
        });

    // Export the pool promise and the sql object itself for convenience
    export { poolPromise, sql };
    