class RegistrationService {

    constructor() {
        this.clients = new Map();
        this.clientsContent = new Map();
    }

    async registerClient(data, client) {
        let key = data.who;
        if (key !== null && key !== undefined && client !== null && client !== undefined && !this.clients.has(key)) {
            this.clients.set(key, client);
            this.clientsContent.set(key, data.payload);
            console.log("+1! size now: " + this.clientsContent.size)
            let payload = await this.makePayload();
            return {
                "status": "ok",
                "oper": "new_user",
                "who": key,
                "payload": payload,
            };
        }
        return {
            "status": "err",
            "oper": "new_user",
            "who": key,
        };
    }

    async changeAvatar(key, content) {
        console.log(content)
        if (this.clients.has(key) && this.clientsContent.has(key)) {
            let obj = this.clientsContent.get(key);
            obj.pic = content;
            this.clientsContent.set(key, obj);

            let response = {
                "status": 'ok',
                "oper": "avatar_changed",
                "who": key,
                "changeTo": content
            }
            return response;

        } else {
            return {
                "status": 'err',
                "oper": "avatar_changed",
                "who": key,
            }
        }
    }

    async makePayload() {
        let arr = [];
        for (let entry of this.clientsContent) {
            arr.push(JSON.stringify(entry));
        }
        return JSON.stringify(arr);
    }

    getClients() {
        return this.clients.entries();
    }

    deleteClient(key) {
        this.clients.delete(key);
        this.clientsContent.delete(key);
        console.log("-1! size now: " + this.clientsContent.size)
    }

}

module.exports = RegistrationService;
