import "./ConsumerBox.css";
import { useEffect, useRef, useState } from "react";

const ConsumerBox = ({ socket, device, producerId, roomId }) => {
  const videoRef = useRef(null);
  const [isStream, setIsStream] = useState(false);
  const [consumerTransport, setConsumerTransport] = useState(null);

  console.log(producerId, roomId);

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
            if (transport.connectionState === "connected") {
              console.warn("Consumer transport already connected");
              return;
            }
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
          console.log("params", params);
          if (!params || params.error) {
            const errMsg = params?.error || "Error during media consumption";
            return reject(new Error(errMsg));
          }

          // const streams = [];

          try {
            const consumer = await recvTransport.consume({
              id: params.id,
              producerId: params.producerId,
              kind: params.kind,
              rtpParameters: params.rtpParameters,
            });

            const stream = new MediaStream([consumer.track]);
            resolve([{ consumer, stream }]);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  };

  useEffect(() => {
    if (!socket || !device || !producerId || !roomId) return;

    // let isMounted = true;

    const setupConsumer = async () => {
      try {
        setIsStream(true);

        const transport = await createConsumeTransport(roomId);
        console.log("transport", transport);
        const [firstStream] = await consumeMedia(transport, roomId, producerId);

        console.log("firstStream", firstStream.stream.getTracks());

        if (videoRef.current) {
          videoRef.current.srcObject = firstStream.stream;
          videoRef.current.play().catch((err) => {
            console.warn("Auto-play failed:", err);
          });
        }

        socket.emit(
          "resumePausedConsumers",
          { roomId, producerId },
          ({ success }) => {
            if (success) {
              console.log("Consumer resumed successfully");
            } else {
              console.log("Error in resuming consumer");
            }
          }
        );
      } catch (err) {
        console.error("Error setting up consumer:", err);
      }
    };

    setupConsumer();

    return () => {
      // isMounted = false;
    };
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
