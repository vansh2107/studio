
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FullScreenOverlay } from '@/components/ui/FullScreenOverlay';

interface InteractiveAssetCardViewerProps<T> {
  items: T[];
  renderCardFront: (item: T, isExpanded: boolean) => React.ReactNode;
  renderCardBack: (item: T) => React.ReactNode;
  layoutIdPrefix: string;
  expandedCardClassName?: string;
  memberName?: string;
}

export function InteractiveAssetCardViewer<T extends { [key: string]: any }>({
  items,
  renderCardFront,
  renderCardBack,
  layoutIdPrefix,
  expandedCardClassName,
  memberName,
}: InteractiveAssetCardViewerProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const handleCardClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };
  
  const handleNavigation = useCallback((navDirection: 'next' | 'prev') => {
    if (selectedIndex === null) return;

    if (navDirection === 'next') {
        setDirection(1);
        setSelectedIndex((prevIndex) => (prevIndex! + 1) % items.length);
    } else {
        setDirection(-1);
        setSelectedIndex((prevIndex) => (prevIndex! - 1 + items.length) % items.length);
    }
  }, [selectedIndex, items.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNavigation('next');
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleNavigation('prev');
      }
    };

    if (selectedIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, handleNavigation]);

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (selectedIndex === null || selectedIndex === index) return;
    
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
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <FullScreenOverlay isOpen={!!selectedItem} onClose={handleClose}>
        
        {selectedItem && (() => {
          const isSpecialCase =
            memberName === 'Ashish Hirpara' &&
            (selectedItem as any).dpName === 'Upstox';

          if (isSpecialCase) {
            return (
              <div className="flex flex-col items-center justify-start h-full w-full pt-16 overflow-y-auto px-4">
                <motion.div
                  layoutId={`${layoutIdPrefix}-${selectedIndex}`}
                  className="w-[60vw] max-w-3xl h-56 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderCardFront(selectedItem, true)}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                  className="w-[80vw] max-w-4xl mt-4"
                   onClick={(e) => e.stopPropagation()}
                >
                  {renderCardBack(selectedItem)}
                </motion.div>
              </div>
            );
          }

          // Default rendering logic for all other cards
          return (
            <>
              {items.length > 1 && (
                  <Button
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleNavigation('prev'); }}
                      className="h-[40vh] w-auto shrink-0 bg-transparent p-0 shadow-none border-none ring-0 focus-visible:ring-0 hover:bg-transparent text-gray-700 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300"
                  >
                      <ArrowLeft className="h-[35vh] w-auto" />
                  </Button>
              )}

              <div className="flex flex-col items-center gap-4">
                  <motion.div
                      className={cn("w-[50vw] h-[50vh] relative", expandedCardClassName)}
                      onClick={(e) => e.stopPropagation()}
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
                          className="absolute inset-0 bg-card rounded-xl overflow-hidden"
                      >
                        {renderCardBack(selectedItem!)}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>

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

              {items.length > 1 && (
                  <Button
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleNavigation('next'); }}
                      className="h-[40vh] w-auto shrink-0 bg-transparent p-0 shadow-none border-none ring-0 focus-visible:ring-0 hover:bg-transparent text-gray-700 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300"
                  >
                      <ArrowRight className="h-[35vh] w-auto" />
                  </Button>
              )}
            </>
          );
        })()}
      </FullScreenOverlay>
    </>
  );
}
