'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { useTasks, Task } from '@/hooks/use-tasks';
import { AnimatePresence, motion } from 'framer-motion';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

// Simple parser logic
const parseTaskCommand = (input: string): Partial<Task> | null => {
  const lowerInput = input.toLowerCase();
  if (!lowerInput.includes('task for')) {
    return null;
  }

  const personMatch = lowerInput.match(/for\s+([a-z]+)/i);
  const person = personMatch ? personMatch[1].charAt(0).toUpperCase() + personMatch[1].slice(1) : null;

  const titleMatch = lowerInput.match(/to\s+(.+?)(?=\s+by\s+|\s+in\s+|\s+next\s+|\s+today\s*|\s+tomorrow\s*|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  
  const tomorrowMatch = lowerInput.match(/\b(tomorrow)\b/i);
  const todayMatch = lowerInput.match(/\b(today)\b/i);
  const nextWeekMatch = lowerInput.match(/next\s+week/i);
  const nextMonthMatch = lowerInput.match(/next\s+month/i);

  let dueDate = 'Not specified';
  if(tomorrowMatch) dueDate = 'Tomorrow';
  else if(todayMatch) dueDate = 'Today';
  else if(nextWeekMatch) dueDate = 'Next Week';
  else if(nextMonthMatch) dueDate = 'Next Month';


  if (person && title) {
    return { person, title, dueDate };
  }

  return null;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I help you create tasks today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const { addTask } = useTasks();
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    
    const newMessages = [...messages, userMessage];
    const taskDetails = parseTaskCommand(inputValue);
    
    if (taskDetails) {
        const fullTask: Task = {
            id: `task-${Date.now()}`,
            person: taskDetails.person!,
            title: taskDetails.title!,
            dueDate: taskDetails.dueDate!,
        };
        addTask(fullTask);

        const botResponse: Message = {
            id: Date.now() + 1,
            text: `Task created for ${fullTask.person}: ${fullTask.title} (Due: ${fullTask.dueDate})`,
            sender: 'bot'
        };
        newMessages.push(botResponse);
    } else {
        const botResponse: Message = {
            id: Date.now() + 1,
            text: "Sorry, I didn't understand that. Please use the format: 'create a task for [Name] to [do something] by [time]'.",
            sender: 'bot'
        };
        newMessages.push(botResponse);
    }

    setMessages(newMessages);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
           <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-5 z-[1000] w-full max-w-sm"
          >
            <Card className="flex flex-col h-[500px] shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                   <Bot className="h-6 w-6 text-primary" />
                   <CardTitle>Assistant</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto" ref={chatHistoryRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Create a task for..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        className="fixed bottom-5 right-5 z-[1000] h-16 w-16 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </>
  );
}
