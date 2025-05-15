import { Server } from 'socket.io'

let connections = {}
let messages = {}
let timeOnline = {} 

export const connectToSocket = (server) => {
    const io = new Server(server , {
        cors: { // only done in the testing environment
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    })

    io.on("connection", (socket) => {
        socket.on("join-call", (path) =>{

            if(connections[path] === undefined){
                connections[path] = []
            }

            connections[path].push(socket.id)
            timeOnline[socket.id] = new Date()

            // connections[path].forEach(element => {
            //     io.to(element)
            // });

            for (let i = 0; i < connections[path].length; i++) {
                io.to(connections[path][i]).emit('user-joined', socket.id)
            }


        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message)
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections).reduce(([room, isFound], [roomKey, roomValue]) => { // Check if the room contains the sender
                if(!isFound && roomValue.includes(socket.id)){
                    return [roomKey, true]
                }

                return [room, isFound] 
            }, ['', false]) 

            if(found === true){
                if(messages[matchingRoom] === undefined){
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({'sender': sender, 'data': data, 'socket-id-sender': socket.id})
                console.log("messages", messages, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                });

            }
        })

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key 

            for (const [k,v] of JSON.parse(JSON.stringify(connections))){ 
                for (let a = 0; a<v.length; ++a){  
                    if(v[a] === socket.id){
                        key = k

                        for (let a=0; a<connections[key].length; ++a){
                            io.to(connections[key][a]).emit("user-left", socket.id)
                        } // emit to all users in the room that the user has left

                        var index = connections[key].indexOf(socket.id); 

                        connections[key].splice(index, 1); // remove the socket from the array

                        if(connections[key].length === 0){
                            delete connections[key]
                            delete messages[key]
                        }
// -----------<<<<>>>
                    }
                }
            }
        })
    })

    return io
}