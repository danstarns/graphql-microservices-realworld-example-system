function viewer(root, args, { user }) {
    if (user) {
        return { user: { id: user } };
    }
}

module.exports = viewer;
