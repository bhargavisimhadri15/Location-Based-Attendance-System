/**
 * Haversine Formula for distance calculation
 * @param {Array} coord1 - [longitude, latitude]
 * @param {Array} coord2 - [longitude, latitude]
 * @returns {Number} Distance in meters
 */
const getDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
};

/**
 * Checks if a user is within the predefined radius of a location
 * @param {Array} userCoord - [lon, lat] 
 * @param {Array} locationCoord - [lon, lat]
 * @param {Number} radius - in meters
 * @returns {Boolean}
 */
const isWithinRange = (userCoord, locationCoord, radius) => {
    const distance = getDistance(userCoord, locationCoord);
    return distance <= radius;
};

module.exports = {
    getDistance,
    isWithinRange
};
