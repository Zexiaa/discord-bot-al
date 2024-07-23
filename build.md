In order to deploy to RPI

> docker build -t discord-bot-al:version

Run: Choose one of gzip or bzip2
> docker save discord-bot-al:version | gzip/bzip2 | ssh pi@raspberrypi sudo docker load

On the rpi
> docker run -dp 127.0.0.1:3000:3000 discord-bot-al:version -v db:/app