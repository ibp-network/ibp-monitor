'use strict'
const { Docker } = require('node-docker-api')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

;(async () => {
  const image = 'redis'
  docker.image.get(image)
  docker.container
    .create({
      Image: image,
      name: 'test',
    })
    .then((container) => container.start())
    .then((container) => container.stop())
    .then((container) => container.restart())
    .then((container) => container.delete({ force: true }))
    .catch((error) => console.log(error))
})()
