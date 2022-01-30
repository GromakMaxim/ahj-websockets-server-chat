const WebSocketServer = require('ws');
const RegistrationService = require("./RegistrationService");

PORT = 9999;

const wss = new WebSocketServer.Server({port: PORT});
const registration = new RegistrationService();


wss.on('connection', onConnect);

function onConnect(wsClient) {
    let whoAreYou = {
        'oper': 'registration',
    }
    whoAreYou = JSON.stringify(whoAreYou);
    wsClient.send(JSON.stringify({action:'WHOAREYOU', data: whoAreYou}));

    wsClient.on('close', function () {
        for (let [key, value] of registration.getClients()) {
            if (wsClient === value) registration.deleteClient(key);
        }
        console.log('Пользователь отключился');
    });

    wsClient.on('message', async (message) => {
        try {
            let jsonMessage = JSON.parse(message);
            let data = JSON.parse(jsonMessage.data);
            switch (jsonMessage.action) {
                case 'IAMNEW':
                    if (data.oper === 'new_user') {
                        let response = await registration.registerClient(data.who, wsClient);
                        if (response.status === 'ok') {
                            console.log(response)
                            response = JSON.stringify(response);
                            wsClient.send(JSON.stringify({action: 'WELCOME', data: response}));
                        } else {
                            response = JSON.stringify(response);
                            console.log(response)
                            wsClient.send(JSON.stringify({action: 'IDNYOU', data: response}));
                            wsClient.close(1000, 'access denied');
                        }
                    }
                    break;
                case 'ECHO':
                    wsClient.send(jsonMessage.data);
                    break;
                case 'PING':
                    setTimeout(function () {
                        wsClient.send('PONG');
                    }, 2000);
                    break;
                case 'MSG':
                    console.log(JSON.stringify(jsonMessage))
                    for (let client of wss.clients) {
                        client.send(JSON.stringify(jsonMessage));
                    }
                    break;
                default:
                    console.log('Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });
}

console.log('Сервер запущен на ' + PORT + ' порту');
