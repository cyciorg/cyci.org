function idToRole(id) {
    switch (id) {
        case 0:
            return {name: 'User', color: "text-white"};
        case 1:
            return {name: 'Premium', color: "text-gold"};
        case 2:
            return {name: 'Mod', color: "text-blue"};
        case 3:
            return {name: 'Admin', color: "text-red"};
        case 4:
            return {name:'Owner', color: "text-red"};
    }
}
module.exports = idToRole;