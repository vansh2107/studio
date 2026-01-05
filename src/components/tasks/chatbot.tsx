
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


const parseTaskCommand = (input: string): { task?: Partial<Omit<Task, 'id'>>; error?: string } => {
    const cleanInput = input.trim();
    const regex = /create task for (.*?) for (.*?) which is assigned to (.*?) by (.*?) which is (.*)/i;
    const match = cleanInput.match(regex);

    if (!match) {
        return { error: 'Please use the format:\n`Create task for <CLIENT NAME> for <CATEGORY> which is assigned to <RM NAME> by <dd-mm-yyyy hh:mm> which is <STATUS>`' };
    }
    
    const [, clientName, category, rmName, dueDate, status] = match.map(m => m.trim());
    
    // Simple validation for dd-mm-yyyy hh:mm format
    const dateTimeRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/;
    if (!dateTimeRegex.test(dueDate)) {
        return { error: `Invalid date format for "${dueDate}". Please use "dd-mm-yyyy hh:mm".`};
    }
    
    return {
        task: {
            clientName: clientName || 'Not specified',
            category: category || 'Not specified',
            rmName: rmName || 'Not specified',
            dueDate: dueDate || 'Not specified',
            status: status || 'Not specified',
        }
    };
};


export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "To create a task, please use the format:\n`Create task for <CLIENT NAME> for <CATEGORY> which is assigned to <RM NAME> by <dd-mm-yyyy hh:mm> which is <STATUS>`", sender: 'bot' }
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
    const { task: taskDetails, error } = parseTaskCommand(inputValue);
    
    if (taskDetails) {
        const fullTask: Task = {
            id: `task-${Date.now()}`,
            clientName: taskDetails.clientName!,
            category: taskDetails.category!,
            rmName: taskDetails.rmName!,
            dueDate: taskDetails.dueDate!,
            status: taskDetails.status!,
            description: `Created via chatbot`
        };
        addTask(fullTask);

        const botResponse: Message = {
            id: Date.now() + 1,
            text: `Task created for ${fullTask.clientName} under ${fullTask.category}, assigned to ${fullTask.rmName} (Due: ${fullTask.dueDate}, Status: ${fullTask.status})`,
            sender: 'bot'
        };
        newMessages.push(botResponse);
    } else {
        const botResponse: Message = {
            id: Date.now() + 1,
            text: error || "Sorry — I couldn’t understand that.",
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
            className="fixed bottom-24 right-5 z-50 w-full max-w-sm"
          >
            <Card className="flex flex-col h-[500px] shadow-2xl bg-white text-black">
              <CardHeader className="flex flex-row items-center justify-between bg-app-header">
                <div className="flex items-center gap-2">
                   <Bot className="h-6 w-6 text-white" />
                   <CardTitle className="text-white">Assistant</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:text-white/80 hover:bg-white/20">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto" ref={chatHistoryRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
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
                    placeholder="Create task for <CLIENT> for <CATEGORY>..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-white text-black placeholder:text-black/60"
                  />
                  <Button onClick={handleSendMessage} className="bg-[#1b51a0] text-white hover:bg-[#1b51a0]/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        className="fixed bottom-5 right-5 z-50 h-16 w-16 rounded-full shadow-lg bg-[#1b51a0] text-white hover:bg-[#1b51a0]/90"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </>
  );
}
