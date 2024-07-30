In order to deploy to RPI

> docker build -t discord-bot-al:version .

Run: Choose one of gzip or bzip2
> docker save discord-bot-al:version | gzip/bzip2 | ssh pi@raspberrypi sudo docker load

On the rpi
> docker run -dp 3000:3000 --env-file=.env --add-host=host.docker.internal:host-gateway discord-bot-al:version