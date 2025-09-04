import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full relative"
      >
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-xl glass-card-dark backdrop-blur-xl px-6 py-4 text-lg text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50 border border-white/10 hover:border-white/20 focus:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl bg-white/[0.02] hover:bg-white/[0.05] focus:bg-white/[0.08] resize-none',
            className
          )}
          ref={ref}
          {...props}
        />
        {/* Subtle glow effect on focus */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
      </motion.div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
