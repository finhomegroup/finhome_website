import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load Lottie component to reduce initial bundle size
const DotLottieReact = lazy(() => 
  import('@lottiefiles/dotlottie-react')
    .then(module => ({ default: module.DotLottieReact }))
    .catch(() => ({ default: () => null }))
);

interface Message {
  role: 'user' | 'bot';
  content: string;
}

// Function to format markdown-like text
const formatBotMessage = (text: string) => {
  // Split text by lines to preserve structure
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Handle bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return (
        <div key={lineIndex} className="flex items-start gap-2 my-1">
          <span className="text-blue-500 font-bold">•</span>
          <span>{formatInlineText(line.replace(/^[\s•-]+/, ''))}</span>
        </div>
      );
    }
    
    // Handle numbered lists
    if (/^\d+\./.test(line.trim())) {
      const match = line.match(/^(\s*)(\d+\.)(.*)$/);
      if (match) {
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-blue-500 font-bold">{match[2]}</span>
            <span>{formatInlineText(match[3].trim())}</span>
          </div>
        );
      }
    }
    
    // Handle headers (lines ending with :)
    if (line.trim().endsWith(':') && line.trim().length > 1) {
      return (
        <div key={lineIndex} className="font-semibold text-gray-800 mt-3 mb-1">
          {formatInlineText(line)}
        </div>
      );
    }
    
    // Handle empty lines
    if (line.trim() === '') {
      return <div key={lineIndex} className="h-2" />;
    }
    
    // Regular lines
    return (
      <div key={lineIndex} className="my-1">
        {formatInlineText(line)}
      </div>
    );
  });
};

// Function to format inline text with markdown-like formatting
const formatInlineText = (text: string) => {
  // Handle **bold** text
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    
    // Handle *italic* text
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className="italic text-gray-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    
    return <span key={index}>{part}</span>;
  });
};

const HappyChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  const getMockResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('startup') || lowerMessage.includes('dự án') || lowerMessage.includes('khởi nghiệp')) {
      return "🚀 **Về Startup tại VLIC:**\n\n• **Hỗ trợ ý tưởng khởi nghiệp** - Từ ý tưởng đến thực hiện\n• **Kết nối mentor và nhà đầu tư** - Mạng lưới chuyên gia\n• **Chương trình ươm tạo doanh nghiệp** - 3-6 tháng intensive\n• **Theo dõi tiến độ dự án** - Dashboard realtime\n\n*Bạn đang ở giai đoạn nào của startup? Mình có thể hỗ trợ bạn!*";
    }
    
    if (lowerMessage.includes('mentor') || lowerMessage.includes('cố vấn') || lowerMessage.includes('hướng dẫn')) {
      return "👨‍🏫 **Về Mentor tại VLIC:**\n\n• **Mentor có kinh nghiệm trong ngành** - 10+ năm kinh nghiệm\n• **Tư vấn chiến lược kinh doanh** - Business model & strategy\n• **Hỗ trợ phát triển sản phẩm** - MVP đến market fit\n• **Kết nối mạng lưới doanh nghiệp** - Ecosystem rộng lớn\n\n*Bạn muốn tìm mentor cho lĩnh vực nào?*";
    }
    
    if (lowerMessage.includes('đầu tư') || lowerMessage.includes('funding') || lowerMessage.includes('vốn')) {
      return "💰 **VLIC hỗ trợ kết nối nguồn vốn:**\n\n• **Seed Funding** - Từ các quỹ đầu tư uy tín\n• **Angel Investors** - Các nhà đầu tư cá nhân\n• **Venture Capital** - Quỹ đầu tư mạo hiểm\n• **Chương trình tài trợ chính phủ** - Funding hỗ trợ\n\n*Hãy chia sẻ về dự án để được tư vấn phù hợp!*";
    }
    
    if (lowerMessage.includes('incubation') || lowerMessage.includes('ươm tạo') || lowerMessage.includes('program')) {
      return "🏢 **Chương trình Ươm tạo VLIC:**\n\n1. **Đánh giá và tuyển chọn dự án** - Screening chi tiết\n2. **Đào tạo kỹ năng khởi nghiệp** - Intensive training\n3. **Kết nối mentor và đối tác** - Network building\n4. **Hỗ trợ phát triển sản phẩm** - MVP to market\n\n**Thời gian:** *3-6 tháng*\n**Tỷ lệ thành công:** *85%*";
    }
    
    if (lowerMessage.includes('tracking') || lowerMessage.includes('theo dõi') || lowerMessage.includes('progress')) {
      return "📊 **Hệ thống Tracking VLIC:**\n\n• **Theo dõi tiến độ dự án realtime** - Live updates\n• **Báo cáo hiệu suất startup** - Performance metrics\n• **Phân tích dữ liệu kinh doanh** - Business analytics\n• **Dashboard quản lý tổng quan** - Overview panel\n\n*Bạn có thể xem chi tiết trong admin panel!*";
    }
    
    if (lowerMessage.includes('liên hệ') || lowerMessage.includes('contact')) {
      return "📞 **Thông tin liên hệ VLIC:**\n\n📱 **Hotline:** 028 3930 0000\n📧 **Email:** startup@vlu.edu.vn\n📍 **Địa chỉ:** Đại học Văn Lang, TP.HCM\n🌐 **Website:** vlic.vlu.edu.vn\n\n*Bạn có thể liên hệ để được hỗ trợ trực tiếp!*";
    }
    
    return "**Chào mừng đến với VLIC - Startup Ecosystem!** 🚀\n\n*Mình có thể hỗ trợ bạn:*\n\n• 🚀 **Thông tin về Startup** - Tư vấn ý tưởng\n• 👨‍🏫 **Kết nối Mentor** - Chuyên gia hướng dẫn\n• 💰 **Tìm nguồn đầu tư** - Funding support\n• 🏢 **Chương trình Ươm tạo** - Incubation program\n• 📊 **Tracking dự án** - Progress monitoring\n\n*Hãy hỏi mình bất cứ điều gì về khởi nghiệp nhé!*";
  };

  const getCareerAdvice = async (message: string): Promise<string> => {
    try {
      console.log("Sending message:", message);
      
      const res = await fetch("https://cosari.io.vn/webhook/95e41fae-d277-4d64-bf74-be426292ae97", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ message: message }),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseText = await res.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response:", data);
      } catch (parseError) {
        console.log("Failed to parse JSON, using raw text");
        return responseText;
      }

      // Handle n8n webhook response format
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        return data[0].output;
      }
      
      if (data.output) {
        return data.output;
      }
      
      if (data.reply) {
        return data.reply;
      }
      
      if (data.message) {
        return data.message;
      }
      
      if (data.response) {
        return data.response;
      }
      
      if (typeof data === 'string') {
        return data;
      }
      
      console.warn("Unhandled response format:", data);
      return JSON.stringify(data);
      
    } catch (error) {
      console.error("Webhook error:", error);
      // Fallback to mock response when webhook fails
      return getMockResponse(message);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    const userMessage: Message = { role: 'user', content: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await getCareerAdvice(currentInput);
      const botMessage: Message = { 
        role: 'bot', 
        content: response || "No response received"
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Career advice error:", error);
      // Use mock response as fallback
      const mockResponse = getMockResponse(currentInput);
      setMessages((prev) => [...prev, { 
        role: 'bot', 
        content: mockResponse
      }]);
    }

    setIsLoading(false);
  };

  const toggleChat = () => {
    if (!isExpanded && !hasWelcomed) {
      setMessages([{
        role: 'bot',
        content: '**Chào bạn!** 👋 *Mình là AI Assistant của VLIC - Van Lang Incubation Center!*\n\n**Mình có thể hỗ trợ bạn:**\n\n• 🚀 **Thông tin về Startup Ecosystem** - Tư vấn ý tưởng\n• 👨‍🏫 **Kết nối với Mentor** - Chuyên gia hướng dẫn\n• 💰 **Tìm nguồn đầu tư và funding** - Funding support\n• 🏢 **Chương trình Ươm tạo doanh nghiệp** - Incubation program\n• 📊 **Tracking tiến độ dự án** - Progress monitoring\n\n*Bạn có câu hỏi gì về khởi nghiệp không?*'
      }]);
      setHasWelcomed(true);
    }
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

    return (
    <div className={cn(
      "fixed z-50 transition-all duration-300 ease-in-out",
      // Mobile layout
      "bottom-4 right-4",
      // Desktop layout
      "md:bottom-5 md:right-5",
      // Container width
      isExpanded 
        ? "w-[calc(100vw-2rem)] md:w-[600px]" 
        : "w-[80px] md:w-[200px]",
      // Layout direction
      "flex gap-2 md:gap-3"
    )}>
      {/* Avatar */}
      <div 
        className={cn(
          "cursor-pointer transition-all duration-300 flex-shrink-0 rounded-full overflow-hidden shadow-lg hover:scale-105 hover:shadow-xl",
          // Mobile size
          "w-[80px] h-[80px]",
          // Desktop size
          "md:w-[200px] md:h-[200px]"
        )}
        onClick={toggleChat}
      >
        <Suspense fallback={
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center rounded-full">
            <div className="text-white text-2xl">🎈</div>
          </div>
        }>
          <DotLottieReact
            src="https://lottie.host/b804e51b-04f6-49da-b002-2be499a1b47d/7t7x9k834N.lottie"
            loop
            autoplay
            style={{
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              transform: "translateZ(0)",
            }}
          />
        </Suspense>
      </div>

      {/* Chat Box */}
      {isExpanded && (
        <Card className={cn(
          "flex-1 flex flex-col animate-in slide-in-from-right duration-300",
          // Mobile height - full screen minus safe area
          "min-h-[calc(100vh-8rem)]",
          // Desktop height
          "md:min-h-[500px]",
          // Mobile specific styles
          "md:rounded-lg",
          "rounded-t-lg rounded-l-lg"
        )}>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold">🚀 VLIC - Startup Assistant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className={cn(
              "flex-1 overflow-y-auto p-3 space-y-2",
              // Mobile height
              "max-h-[calc(100vh-12rem)]",
              // Desktop height
              "md:max-h-[400px]"
            )}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-2xl text-sm",
                    // Mobile max width
                    "max-w-[85%]",
                    // Desktop max width
                    "md:max-w-[80%]",
                    msg.role === 'user' 
                      ? "ml-auto bg-gradient-to-r from-gray-200 to-gray-300 text-black rounded-br-md" 
                      : "mr-auto bg-gray-100 text-gray-900 rounded-bl-md"
                  )}
                >
                  {msg.role === 'bot' ? (
                    <div className="text-sm md:text-base">
                      {formatBotMessage(msg.content)}
                    </div>
                  ) : (
                    <div className="text-sm md:text-base">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className={cn(
                  "mr-auto p-3 rounded-2xl rounded-bl-md bg-gray-100 text-gray-900",
                  "max-w-[85%] md:max-w-[80%]"
                )}>
                  <div className="whitespace-pre-line text-sm md:text-base">
                    Đang trả lời...
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="border-t p-3 bg-white">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Gõ câu hỏi về startup, mentor, đầu tư..."
                  className={cn(
                    "flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    // Mobile size
                    "min-h-[44px] max-h-[100px] text-sm p-3",
                    // Desktop size
                    "md:min-h-[48px] md:max-h-[120px] md:text-base md:p-2"
                  )}
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!userInput.trim() || isLoading}
                  className={cn(
                    "flex-shrink-0",
                    // Mobile size
                    "h-[44px] w-[44px] p-0 rounded-full",
                    // Desktop size
                    "md:h-auto md:w-auto md:p-2 md:rounded-md"
                  )}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HappyChatbot;
