const { getRandomFloat } = require('./index')

const InitConnection = async (waiting, connections, socketid) => {
    const uarray = waiting.filter(users => users.socketid !== socketid);
    const index = getRandomFloat(uarray.length - 1)
    let user = uarray[index]
    const puser = connections[socketid]
    if(puser && puser.socketid === user.socketid) {
        user = uarray.filter(item => item.socketid !== user.socketid);
        if(!user) return null
    }
    if(user?.socketid === socketid) return null
    return user;
}

module.exports = { InitConnection }