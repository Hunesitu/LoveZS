import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale';
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  animation = 'fade'
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const animationClass = {
    fade: 'page-transition',
    slide: 'slide-in',
    scale: 'scale-in'
  }[animation];

  useEffect(() => {
    // 当路由变化时，滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 触发重新动画
    if (containerRef.current) {
      containerRef.current.classList.remove(animationClass);
      void containerRef.current.offsetWidth; // 触发回流
      containerRef.current.classList.add(animationClass);
    }
  }, [location.pathname, animationClass]);

  return (
    <div ref={containerRef} className={`${animationClass} ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;
