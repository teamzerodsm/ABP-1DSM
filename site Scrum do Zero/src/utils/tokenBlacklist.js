const blacklisted = new Set();

function addToken(token) {
    if (!token) return;
    blacklisted.add(token);
}

function isBlacklisted(token) {
    return blacklisted.has(token);
}

module.exports = {
    addToken,
    isBlacklisted
}
