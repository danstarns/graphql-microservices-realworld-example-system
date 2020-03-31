const { NATS_URL, PORT, MONGODB_URI, DEBUG, SECRET, NODE_ENV } = process.env;

Object.entries({ NATS_URL, PORT, DEBUG, SECRET, NODE_ENV }).forEach(
    ([key, value]) => {
        if (!value && value !== false) {
            throw new Error(`Missing env ${key}`);
        }
    }
);

module.exports = {
    NATS_URL,
    PORT: Number(PORT),
    MONGODB_URI,
    DEBUG,
    SECRET,
    NODE_ENV
};
