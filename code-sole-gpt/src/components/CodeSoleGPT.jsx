import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CodeSoleGPT = () => {
  // State for conversations
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [
      {
        id: uuidv4(),
        title: "Welcome Chat",
        messages: [
          { 
            id: 1, 
            text: "Hello! I'm CodeSole GPT. How can I assist you with coding today?", 
            sender: 'bot', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ];
  });
  
  // State for active conversation
  const [activeConversation, setActiveConversation] = useState(() => {
    const saved = localStorage.getItem('activeConversation');
    return saved ? saved : conversations[0].id;
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
    localStorage.setItem('activeConversation', activeConversation);
  }, [conversations, activeConversation]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversation, isLoading]);
  
  // Get current conversation
  const currentConversation = conversations.find(c => c.id === activeConversation);
  
  // Create new conversation
  const createNewConversation = () => {
    const newConversation = {
      id: uuidv4(),
      title: "New Chat",
      messages: [
        { 
          id: 1, 
          text: "Hello! I'm CodeSole GPT. What coding challenge can I help you with today?", 
          sender: 'bot', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation.id);
    setInputValue('');
    setShowClearConfirmation(false);
  };
  
  // Clear current conversation
  const clearCurrentConversation = () => {
    setConversations(convs => 
      convs.map(conv => 
        conv.id === activeConversation
          ? {
              ...conv,
              messages: [
                { 
                  id: 1, 
                  text: "I've cleared our conversation. What would you like to discuss now?", 
                  sender: 'bot', 
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            }
          : conv
      )
    );
    setShowClearConfirmation(false);
  };
  
  // Handle sending messages
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message to current conversation
    const newUserMessage = {
      id: currentConversation.messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Update conversation title if it's the first user message
    const updateTitle = currentConversation.title === "New Chat" || currentConversation.title === "Welcome Chat";
    
    setConversations(convs => 
      convs.map(conv => 
        conv.id === activeConversation
          ? {
              ...conv,
              title: updateTitle ? inputValue.substring(0, 30) + (inputValue.length > 30 ? "..." : "") : conv.title,
              messages: [...conv.messages, newUserMessage]
            }
          : conv
      )
    );
    
    setInputValue('');
    setIsLoading(true);

    try {
      // Encode the message for URL safety
      const encodedMessage = encodeURIComponent(inputValue);
      
      // Connect to Spring Boot backend - GET request with path variable
      const response = await fetch(`http://localhost:8080/api/${encodedMessage}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response as plain text (since controller returns String)
      const responseText = await response.text();

      // Add bot response
      const botResponse = {
        id: currentConversation.messages.length + 2,
        text: responseText,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversations(convs => 
        convs.map(conv => 
          conv.id === activeConversation
            ? { ...conv, messages: [...conv.messages, botResponse] }
            : conv
        )
      );
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorResponse = {
        id: currentConversation.messages.length + 2,
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversations(convs => 
        convs.map(conv => 
          conv.id === activeConversation
            ? { ...conv, messages: [...conv.messages, errorResponse] }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Clear Chat Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Clear Conversation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear this conversation? This will remove all messages in this chat.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearCurrentConversation}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              CodeSole GPT
            </h2>
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-3 px-4 mb-6 font-medium flex items-center justify-center hover:opacity-90 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            New Conversation
          </button>
          
          <div className="mb-4 text-xs text-gray-500 uppercase tracking-wider font-medium px-2">
            Conversations
          </div>
          
          <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  setShowClearConfirmation(false);
                }}
                className={`w-full text-left rounded-lg py-3 px-4 transition-all flex items-center ${
                  conversation.id === activeConversation
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 shadow-sm text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${
                  conversation.id === activeConversation ? 'text-indigo-500' : 'text-gray-400'
                }`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                {conversation.title}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 text-white shadow-lg">
          <div className="container mx-auto flex items-center">
            {!sidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="mr-4 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                <div className="bg-gradient-to-r from-amber-400 to-rose-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xs">CS</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">CodeSole GPT</h1>
                <p className="text-xs opacity-80">AI-powered coding assistant</p>
              </div>
            </div>
            
            {/* Clear Chat Button */}
            <button
              onClick={() => setShowClearConfirmation(true)}
              className="ml-auto flex items-center text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full px-4 py-2 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 text-red-400 w-5 mr-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear Chat
            </button>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="container mx-auto max-w-3xl">
            {currentConversation.messages.length > 1 ? (
              currentConversation.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`my-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%]">
                    <div className={`flex items-end ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 shadow ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-r from-purple-500 to-fuchsia-500'
                      }`}>
                        {message.sender === 'user' ? (
                          <span className="text-white font-bold text-sm">U</span>
                        ) : (
                          <span className="text-white font-bold text-sm">C</span>
                        )}
                      </div>
                      
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-lg ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                            : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-bl-none'
                        }`}
                      >
                        {message.text}
                        <div className={`text-xs opacity-70 mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-purple-100'}`}>
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Start a New Conversation</h2>
                <p className="text-gray-600 max-w-md mb-6">
                  Ask me anything about coding! I can help with algorithms, debugging, best practices, and more.
                </p>
                <button
                  onClick={createNewConversation}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full px-6 py-3 font-medium hover:opacity-90 transition-all shadow-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Start New Chat
                </button>
              </div>
            )}
            
            {isLoading && (
              <div className="my-4 flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center mx-2 shadow">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-2xl px-4 py-3 shadow-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="container mx-auto max-w-3xl">
            <form onSubmit={handleSend} className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about coding..."
                className="flex-1 rounded-l-full border border-gray-300 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 rounded-r-full font-semibold hover:opacity-90 transition-all shadow-md ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Send'}
              </button>
            </form>
            <p className="text-center text-xs text-gray-500 mt-2">
              CodeSole GPT can make mistakes. Verify important information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CodeSoleGPT;