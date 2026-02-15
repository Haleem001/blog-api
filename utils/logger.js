const logger = {
    success: (msg, meta) => {
        console.log(`✅ ${msg}`);
        if (meta) console.log(meta);
    },
    error: (msg, meta) => {
        console.error(`❌ ERROR: ${msg}`);
        if (meta) {
            if (typeof meta === 'string') {
                console.error(meta);
            } else {
                console.error(JSON.stringify(meta, null, 2));
            }
        }
    },
    info: (msg, meta) => {
        console.log(`ℹ️  ${msg}`);
        if (meta) console.log(meta);
    },
    warn: (msg, meta) => {
        console.warn(`⚠️  ${msg}`);
        if (meta) console.warn(meta);
    }
};

module.exports = logger;