import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  useEffect(() => {
    if (!hasWelcomed) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: 'Chào bạn, mình là VLIC AI Assistant - AI Chatbot (Developed by COSARI & VLIC)',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setHasWelcomed(true);
    }
  }, [hasWelcomed]);

    const getAIResponse = async (message: string) => {
    try {
      console.log("Sending message:", message);
      
      const res = await fetch("https://united-glider-becoming.ngrok-free.app/webhook/95e41fae-d277-4d64-bf74-be426292ae97", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" // Skip ngrok browser warning
        },
        body: JSON.stringify({ message: message }),
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseText = await res.text();
      console.log("Raw response:", responseText);
      console.log("Response text length:", responseText.length);
      console.log("Response text type:", typeof responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response:", data);
        console.log("Data type:", typeof data);
        console.log("Data keys:", Object.keys(data));
      } catch (parseError) {
        console.log("Failed to parse JSON, using raw text");
        console.log("Parse error:", parseError);
        return responseText;
      }

      // Handle n8n webhook response format: array with object containing "output" property
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        console.log("Using n8n array format with output property");
        console.log("Output value:", data[0].output);
        return data[0].output;
      }
      
      // Handle direct object with "output" property
      if (data.output) {
        console.log("Using direct object format with output property");
        console.log("Output value:", data.output);
        return data.output;
      }
      
      // Handle other possible response formats
      if (data.reply) {
        console.log("Using reply property:", data.reply);
        return data.reply;
      }
      
      if (data.message) {
        console.log("Using message property:", data.message);
        return data.message;
      }
      
      if (data.response) {
        console.log("Using response property:", data.response);
        return data.response;
      }
      
      // If it's a string, return it directly
      if (typeof data === 'string') {
        console.log("Data is string:", data);
        return data;
      }
      
      // Log unhandled format for debugging
      console.warn("Unhandled response format:", data);
      console.warn("Data structure:", JSON.stringify(data, null, 2));
      
      // Fallback to stringified JSON
      return JSON.stringify(data);
      
    } catch (error) {
      console.error("Webhook error:", error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const currentInput = inputMessage; // Lưu giá trị trước khi xóa
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage(""); // Xóa input ngay lập tức
    setIsLoading(true);

    try {
      const response = await getAIResponse(currentInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || "No response received",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI response error:", error);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Lỗi kết nối webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/\n/g, '<br>'); // Line breaks
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - 1/3 width */}
          <Card className="w-1/3 bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6 h-full">
              <div className="text-center text-gray-600">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">VLIC AI Assistant</h3>
                <p className="text-sm mb-4">
                  Get instant help with your startup questions, mentorship requests, and VLIC program information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Chat Area - 2/3 width */}
          <Card className="w-2/3 bg-white border-gray-200 shadow-sm flex flex-col">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-gray-900 text-lg font-semibold text-center">Chat</h2>
              </div>

                                            {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {messages.length === 0 && !hasWelcomed && (
                   <div className="text-center text-gray-500 mt-8">
                     <p>Start a conversation with the VLIC AI assistant</p>
                   </div>
                 )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                                         <div
                       className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                         message.isUser
                           ? 'bg-pink-200 text-gray-900'
                           : 'bg-gray-100 text-gray-900'
                       }`}
                     >
                                             <p className="text-sm" dangerouslySetInnerHTML={{
                         __html: formatMessage(message.text)
                       }} />
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                                 )}
               </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                                     <Input
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder="Type your message..."
                     className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
                     disabled={isLoading}
                   />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AIChatbot; 