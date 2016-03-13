# SpaceRaiders
Multiplayer space game built on Node, Socket.io and AngularJS.

Live demo: http://spaceraiders.mo-talha.ca

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

### Improvements
Improve hit detection to use separating axis theorm.
See: http://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169

Change laser to shoot more smoothly across screen when rotated.

