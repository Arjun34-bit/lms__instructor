import "./ConsumerBox.css";
import { useEffect, useRef, useState } from "react";

const ConsumerBox = ({ socket, device, producerId, roomId }) => {
  const videoRef = useRef(null);
  const [isStream, setIsStream] = useState(false);
  const [consumerTransport, setConsumerTransport] = useState(null);

  const createConsumeTransport = (roomId) => {
    return new Promise((resolve, reject) => {
      if (!device || !socket) return reject("Device or socket not ready");

      socket.emit(
        "createTransport",
        { roomId: roomId, sender: false },
        ({ params }) => {
          if (params?.error) return reject(params.error);

          const transport = device.createRecvTransport(params);
          setConsumerTransport(transport);

          transport.on("connect", ({ dtlsParameters }, callback, errback) => {
            socket.emit(
              "connectConsumerTransport",
              { roomId, dtlsParameters },
              ({ success, error }) => {
                if (error) {
                  console.error("Transport connect failed:", error);
                  return errback(error);
                }
                callback();
              }
            );
          });

          resolve(transport);
        }
      );
    });
  };

  const consumeMedia = (recvTransport, roomId, producerId) => {
    return new Promise((resolve, reject) => {
      socket.emit(
        "consumeMedia",
        {
          roomId,
          rtpCapabilities: device.rtpCapabilities,
          producerId,
        },
        async ({ params }) => {
          if (!params || params.error) {
            const errMsg = params?.error || "Error during media consumption";
            return reject(new Error(errMsg));
          }

          if (!Array.isArray(params)) {
            return reject(new Error("Invalid consumer parameters"));
          }

          const streams = [];

          for (const consumerParams of params) {
            const consumer = await recvTransport.consume({
              id: consumerParams.id,
              producerId: consumerParams.producerId,
              kind: consumerParams.kind,
              rtpParameters: consumerParams.rtpParameters,
            });

            const stream = new MediaStream([consumer.track]);
            streams.push({ consumer, stream });
          }

          resolve(streams);
        }
      );
    });
  };

  useEffect(() => {
    if (!socket || !device || !producerId || !roomId) return;

    const setupConsumer = async () => {
      try {
        setIsStream(true);
        const transport = await createConsumeTransport(roomId);
        const [firstStream] = await consumeMedia(transport, roomId, producerId);

        console.log("firstStream", firstStream.stream);

        if (videoRef.current) {
          videoRef.current.srcObject = firstStream.stream;
        }

        await socket.emit("resumePausedConsumers", {
          roomId,
          producerId: producerId,
        });
      } catch (err) {
        console.error("Error setting up consumer:", err);
      }
    };

    setupConsumer();
  }, [socket, device, producerId, roomId]);

  return (
    <div className="main-consumer-box">
      <div className="video-box">
        {isStream ? (
          <video ref={videoRef} autoPlay playsInline className="cons-video" />
        ) : (
          <div className="user-tag">
            <p>"S1"</p>
          </div>
        )}
        <span className="user-label">{producerId}</span>
      </div>
    </div>
  );
};

export default ConsumerBox;
