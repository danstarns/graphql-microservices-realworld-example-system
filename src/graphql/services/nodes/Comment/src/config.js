const { NATS_URL, MONGODB_URI, DEBUG, NODE_ENV } = process.env;

Object.entries({ NATS_URL, DEBUG, NODE_ENV }).forEach(([key, value]) => {
    if (!value && value !== false) {
        throw new Error(`Missing env ${key}`);
    }
});

module.exports = {
    NATS_URL,
    MONGODB_URI,
    DEBUG,
    NODE_ENV
};
