const RegistrationService = require("./RegistrationService");
const express = require('express');

const PORT = process.env.PORT || 9999;
const INDEX = '/index.html';

const server = express()
   // .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));


const { Server } = require('ws');
const wss = new Server({ server });
const registration = new RegistrationService();

wss.on('connection', onConnect);

function onConnect(wsClient) {
    let whoAreYou = {
        'oper': 'registration',
    }
    whoAreYou = JSON.stringify(whoAreYou);
    wsClient.send(JSON.stringify({action: 'WHOAREYOU', data: whoAreYou}));

    wsClient.on('close', function () {
        let user;
        for (let [key, value] of registration.getClients()) {
            if (wsClient === value) {
                registration.deleteClient(key);
                user = key;
                break;
            }
        }

        let obj = {
            'oper': 'user_left',
            'who': user,
        }

        obj = JSON.stringify(obj);
        for (let client of wss.clients) {
            client.send(JSON.stringify({action: 'GOODBYE', data: obj}));
        }

        console.log('Пользователь отключился');
    });

    wsClient.on('message', async (message) => {
        try {
            let jsonMessage = JSON.parse(message);
            let data = JSON.parse(jsonMessage.data);
            switch (jsonMessage.action) {
                case 'STATUS':
                    if (data.oper === 'status_changed') {
                        console.log(data)
                        let response = await registration.changeStatus(data.who, data.changeTo);
                        response = JSON.stringify(response);
                        for (let client of wss.clients) {
                            client.send(JSON.stringify({action: 'STATUS', data: response}));
                        }
                    }
                case 'AVATAR':
                    if (data.oper === "avatar_changed") {
                        let response = await registration.changeAvatar(data.who, data.changeTo);
                        response = JSON.stringify(response);
                        for (let client of wss.clients) {
                            client.send(JSON.stringify({action: 'AVATAR', data: response}));
                        }
                    }
                    break;
                case 'IAMNEW':
                    if (data.oper === 'new_user') {
                        let response = await registration.registerClient(data, wsClient);
                        if (response.status === 'ok') {
                            response = JSON.stringify(response);
                            for (let client of wss.clients) {
                                client.send(JSON.stringify({action: 'WELCOME', data: response}));
                            }
                        } else {
                            response = JSON.stringify(response);
                            wsClient.send(JSON.stringify({action: 'IDNYOU', data: response}));
                            wsClient.close(1000, 'access denied');
                        }
                    }
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
