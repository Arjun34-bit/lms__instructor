import React, { useState, useEffect, useRef } from "react";
import BotMessage from "./components/BotMessage";
import UserMessage from "./components/UserMessage";
import Messages from "./components/Messages";
import Input from "./components/Input";
import ChatBotAPI from "./chatbotAPI";
import "./styles.css";
import Header from "./components/Header";
import { FaComments } from "react-icons/fa";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const chatboxRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    async function loadWelcomeMessage() {
      setMessages([
        <BotMessage
          key="0"
          fetchMessage={async () => await ChatBotAPI.GetChatbotResponse("hi")}
        />,
      ]);
    }
    loadWelcomeMessage();

    // Close the chatbot when clicking outside of it
    const handleClickOutside = (event) => {
      if (chatboxRef.current && !chatboxRef.current.contains(event.target)) {
        setIsOpen(false); // Close the chatbot
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Add event listener

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const send = async (text) => {
    const newMessages = messages.concat(
      <UserMessage key={messages.length + 1} text={text} />,
      <BotMessage
        key={messages.length + 2}
        fetchMessage={async () => await ChatBotAPI.GetChatbotResponse(text)}
      />
    );
    setMessages(newMessages);
  };

  return (
    <div className="chatbot">
      {/* Toggle Button */}
      <button
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#0084ff",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          padding: "15px",
          fontSize: "18px",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={toggleChatbot}
      >
        <FaComments size={30} />
      </button>
      {/* Chatbot */}
      {isOpen && (
        <div
          ref={chatboxRef}
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            width: "350px",
            height: "500px",
            zIndex: 9999,
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <Header />
          <Messages messages={messages} />
          <Input onSend={send} />
        </div>
      )}
    </div>
  );
}

export default Chatbot;
