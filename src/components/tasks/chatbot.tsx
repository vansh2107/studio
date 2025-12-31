
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

// More robust parser for "create task for NAME to TASK by DATE"
const parseTaskCommand = (input: string): { task?: Partial<Omit<Task, 'id'>>; error?: string } => {
    const cleanInput = input.toLowerCase().trim();

    if (!cleanInput.startsWith('create a task for')) {
        return { error: "Try: create a task for NAME to TASK by DATE/TIME" };
    }

    // Regex to capture name, task, and optional due date
    const match = cleanInput.match(/^create a task for (.+?) to (.+?)(?: by (.+))?$/);

    if (!match) {
        if (cleanInput.match(/^create a task for (.+?) to\s*$/)) {
            return { error: "Please specify what the task is." };
        }
        return { error: "Try: create a task for NAME to TASK by DATE/TIME" };
    }

    const [, person, task, dueDate] = match;

    if (!person || !task) {
        return { error: "Try: create a task for NAME to TASK by DATE/TIME" };
    }

    return {
        task: {
            person: person.trim(),
            task: task.trim(),
            dueDate: dueDate ? dueDate.trim() : 'Not specified',
        }
    };
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
    const { task: taskDetails, error } = parseTaskCommand(inputValue);
    
    if (taskDetails) {
        const fullTask: Task = {
            id: `task-${Date.now()}`,
            person: taskDetails.person!,
            task: taskDetails.task!,
            dueDate: taskDetails.dueDate!,
            description: `Created via chatbot: "${inputValue}"`
        };
        addTask(fullTask);

        const botResponse: Message = {
            id: Date.now() + 1,
            text: `Task created for ${fullTask.person}: ${fullTask.task} (Due: ${fullTask.dueDate})`,
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
                        className={`max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap ${
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
