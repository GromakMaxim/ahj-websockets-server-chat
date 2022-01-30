class RegistrationService {

    constructor() {
        this.clients = new Map();
    }

    async registerClient(key, client) {
        if (key !== null && key !== undefined && client !== null && client !== undefined && !this.clients.has(key)) {
            this.clients.set(key, client);
            return {
                "status": "ok",
                "oper": "new_user",
                "who": key,
            };
        }
        return {
            "status": "err",
            "oper": "new_user",
            "who": key,
        };

    }

    getClients() {
        return this.clients.entries();
    }

    deleteClient(key){
        this.clients.delete(key);
    }

}

module.exports = RegistrationService;
