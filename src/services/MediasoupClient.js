import { Device } from 'mediasoup-client';

class MediasoupClient {
    constructor(socket, peerId, roomId) {
        this.device = null;
        this.socket = socket;
        this.peerId = peerId;
        this.roomId = roomId;
        this.sendTransport = null;
        this.recvTransport = null;
        this.producers = new Map();
        this.consumers = new Map();
        this.onNewProducer = null;
    }

    async loadDevice() {
        try {
            const routerRtpCapabilities = await new Promise((resolve, reject) => {
                this.socket.emit('getRouterRtpCapabilities', (response) => {
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                });
            });

            this.device = new Device();
            await this.device.load({ routerRtpCapabilities });

            // Listen for new producers
            this.socket.on('newProducer', async ({ producerId, participantId }) => {
                try {
                    const consumer = await this.consume(producerId);
                    if (this.onNewProducer) {
                        this.onNewProducer(consumer, participantId);
                    }
                } catch (error) {
                    console.error('Error consuming new producer:', error);
                }
            });

        } catch (error) {
            console.error('Failed to load device:', error);
            throw error;
        }
    }

    async createSendTransport() {
        try {
            const transportOptions = await new Promise((resolve, reject) => {
                this.socket.emit('createWebRtcTransport', { producing: true }, (response) => {
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                });
            });

            this.sendTransport = this.device.createSendTransport(transportOptions);

            this.sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await new Promise((resolve, reject) => {
                        this.socket.emit('connectTransport', {
                            transportId: this.sendTransport.id,
                            dtlsParameters
                        }, (response) => {
                            if (response.error) {
                                reject(new Error(response.error));
                            } else {
                                resolve();
                            }
                        });
                    });
                    callback();
                } catch (error) {
                    errback(error);
                }
            });

            this.sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
                try {
                    const { producerId } = await new Promise((resolve, reject) => {
                        this.socket.emit('produce', {
                            transportId: this.sendTransport.id,
                            kind,
                            rtpParameters
                        }, (response) => {
                            if (response.error) {
                                reject(new Error(response.error));
                            } else {
                                resolve(response);
                            }
                        });
                    });
                    callback({ id: producerId });
                } catch (error) {
                    errback(error);
                }
            });
        } catch (error) {
            console.error('Failed to create send transport:', error);
            throw error;
        }
    }

    async createRecvTransport() {
        try {
            const transportOptions = await new Promise((resolve, reject) => {
                this.socket.emit('createWebRtcTransport', { producing: false }, (response) => {
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                });
            });

            this.recvTransport = this.device.createRecvTransport(transportOptions);

            this.recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await new Promise((resolve, reject) => {
                        this.socket.emit('connectTransport', {
                            transportId: this.recvTransport.id,
                            dtlsParameters
                        }, (response) => {
                            if (response.error) {
                                reject(new Error(response.error));
                            } else {
                                resolve();
                            }
                        });
                    });
                    callback();
                } catch (error) {
                    errback(error);
                }
            });
        } catch (error) {
            console.error('Failed to create receive transport:', error);
            throw error;
        }
    }

    async produce(track) {
        if (!this.sendTransport) {
            throw new Error('Send transport not created');
        }
        const producer = await this.sendTransport.produce({ track });
        this.producers.set(producer.id, producer);

        // Handle producer events
        producer.on('transportclose', () => {
            this.producers.delete(producer.id);
        });

        producer.on('trackended', () => {
            this.closeProducer(producer.id);
        });

        return producer;
    }

    async consume(producerId) {
        if (!this.recvTransport) {
            throw new Error('Receive transport not created');
        }

        try {
            const { rtpCapabilities } = this.device;
            const { id, kind, rtpParameters } = await new Promise((resolve, reject) => {
                this.socket.emit('consume', {
                    producerId,
                    rtpCapabilities
                }, (response) => {
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                });
            });

            const consumer = await this.recvTransport.consume({
                id,
                producerId,
                kind,
                rtpParameters,
                paused: true // Start paused and resume after creation
            });

            this.consumers.set(consumer.id, consumer);

            // Handle consumer events
            consumer.on('transportclose', () => {
                this.consumers.delete(consumer.id);
            });

            consumer.on('trackended', () => {
                this.closeConsumer(consumer.id);
            });

            // Resume the consumer immediately
            await consumer.resume();

            return consumer;
        } catch (error) {
            console.error('Failed to consume:', error);
            throw error;
        }
    }

    closeProducer(producerId) {
        const producer = this.producers.get(producerId);
        if (producer) {
            producer.close();
            this.producers.delete(producerId);
        }
    }

    closeConsumer(consumerId) {
        const consumer = this.consumers.get(consumerId);
        if (consumer) {
            consumer.close();
            this.consumers.delete(consumerId);
        }
    }

    close() {
        this.producers.forEach(producer => producer.close());
        this.consumers.forEach(consumer => consumer.close());
        if (this.sendTransport) this.sendTransport.close();
        if (this.recvTransport) this.recvTransport.close();
        this.producers.clear();
        this.consumers.clear();
        this.sendTransport = null;
        this.recvTransport = null;
    }

    async join() {
        await new Promise((resolve, reject) => {
            this.socket.emit('joinRoom', {
                roomId: this.roomId,
                peerId: this.peerId
            }, (response) => {
                if (response?.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    }

    setNewProducerCallback(callback) {
        this.onNewProducer = callback;
    }
}

export default MediasoupClient;