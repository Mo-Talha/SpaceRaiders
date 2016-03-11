# SpaceRaiders
Multiplayer space game built on Node, Socket.io and AngularJS.

### Installation
Assuming debian linux.

Install git
```bash
sudo apt-get update
sudo apt-get install git
```

Install Node.js
```bash
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install nodejs
```

Install project dependencies
```bash
npm install
```

Now the server can be started using the command:
```bash
DEBUG=app:* PORT=80 npm start
```
