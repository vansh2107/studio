'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

interface InteractiveAssetCardViewerProps<T> {
  items: T[];
  renderCardFront: (item: T, isExpanded: boolean) => React.ReactNode;
  renderCardBack: (item: T) => React.ReactNode;
  layoutIdPrefix: string;
}

export function InteractiveAssetCardViewer<T extends { [key: string]: any }>({
  items,
  renderCardFront,
  renderCardBack,
  layoutIdPrefix,
}: InteractiveAssetCardViewerProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (index: number) => {
    setSelectedIndex(index);
    setIsFlipped(false);
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setIsFlipped(false);
  };
  
  const handleNavigation = (direction: 'next' | 'prev') => {
    if (selectedIndex === null) return;
    setIsFlipped(false);
    setTimeout(() => {
        if (direction === 'next') {
            setSelectedIndex((prevIndex) => (prevIndex! + 1) % items.length);
        } else {
            setSelectedIndex((prevIndex) => (prevIndex! - 1 + items.length) % items.length);
        }
    }, 150); // allow flip back animation to start
  }

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (selectedIndex === index) return;
    setIsFlipped(false);
    setTimeout(() => {
        setSelectedIndex(index);
    }, 150);
  }

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <>
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <motion.div
            key={item.id || index}
            layoutId={`${layoutIdPrefix}-${index}`}
            onClick={() => handleCardClick(index)}
            className="cursor-pointer h-56"
            whileHover={{ scale: 1.03 }}
          >
            {renderCardFront(item, false)}
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedItem && selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[8000] p-4 gap-6"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Prev Arrow */}
            {items.length > 1 && (
                <Button
                    variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleNavigation('prev'); }}
                    className="bg-black/20 hover:bg-black/40 text-white hover:text-white rounded-full shrink-0"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            )}

            {/* Card and Dots Container */}
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    layoutId={`${layoutIdPrefix}-${selectedIndex}`}
                    className="w-[50vw] h-[50vh] relative"
                    onClick={(e) => e.stopPropagation()}
                    style={{ perspective: 1000 }}
                >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="absolute top-2 right-2 z-[60] bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full"
                >
                    <X className="h-5 w-5" />
                </Button>
                
                <motion.div
                    className="w-full h-full cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                    onClick={() => setIsFlipped(!isFlipped)}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                    <motion.div
                    className="absolute inset-0"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                    {renderCardFront(selectedItem, true)}
                    </motion.div>
                    <motion.div
                    className="absolute inset-0 bg-card rounded-xl overflow-hidden"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                    {renderCardBack(selectedItem)}
                    </motion.div>
                </motion.div>
                </motion.div>

                {/* Dots */}
                {items.length > 1 && (
                    <div className="flex gap-2">
                    {items.map((_, index) => (
                        <button
                        key={index}
                        onClick={(e) => handleDotClick(e, index)}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            index === selectedIndex
                            ? "w-4 bg-primary"
                            : "w-2 bg-white/70 hover:bg-white"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                    </div>
                )}
            </div>

            {/* Next Arrow */}
            {items.length > 1 && (
                <Button
                    variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleNavigation('next'); }}
                    className="bg-black/20 hover:bg-black/40 text-white hover:text-white rounded-full shrink-0"
                >
                    <ArrowRight className="h-6 w-6" />
                </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
