const logger = {
    success: (msg, meta) => console.log(`✅ ${msg}`, meta),
    error: (msg, meta) => console.error(`❌ ${msg}`, meta)
};
module.exports = logger;