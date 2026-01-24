'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
  const [direction, setDirection] = useState(0);

  const handleCardClick = (index: number) => {
    setSelectedIndex(index);
    setIsFlipped(false);
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setIsFlipped(false);
  };
  
  const handleNavigation = (navDirection: 'next' | 'prev') => {
    if (selectedIndex === null) return;
    setIsFlipped(false);

    if (navDirection === 'next') {
        setDirection(1);
        setSelectedIndex((prevIndex) => (prevIndex! + 1) % items.length);
    } else {
        setDirection(-1);
        setSelectedIndex((prevIndex) => (prevIndex! - 1 + items.length) % items.length);
    }
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (selectedIndex === null || selectedIndex === index) return;
    
    setIsFlipped(false);
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };


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
            className="fixed inset-0 flex items-center justify-center z-[8000] p-4"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          >
            {/* Prev Arrow */}
            {items.length > 1 && (
                <Button
                    variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleNavigation('prev'); }}
                    className="text-foreground h-16 w-16 hover:scale-110 transition-transform shrink-0 hover:bg-transparent"
                >
                    <ArrowLeft className="h-10 w-10" />
                </Button>
            )}

            {/* Card and Dots Container */}
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    className="w-[50vw] h-[50vh] relative"
                    onClick={(e) => e.stopPropagation()}
                    style={{ perspective: 1000 }}
                >
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={selectedIndex}
                        layoutId={`${layoutIdPrefix}-${selectedIndex}`}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 },
                        }}
                        className="absolute inset-0"
                    >
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
                  </AnimatePresence>
                </motion.div>

                {/* Dots */}
                {items.length > 1 && (
                    <div className="flex gap-2">
                    {items.map((_, index) => (
                        <button
                        key={index}
                        onClick={(e) => handleDotClick(e, index)}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            index === selectedIndex
                            ? "w-3 h-3 bg-primary"
                            : "w-2 h-2 bg-white/70 hover:bg-white"
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
                    className="text-foreground h-16 w-16 hover:scale-110 transition-transform shrink-0 hover:bg-transparent"
                >
                    <ArrowRight className="h-10 w-10" />
                </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
