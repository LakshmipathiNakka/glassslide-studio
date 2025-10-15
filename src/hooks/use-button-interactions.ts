import { useCallback, useRef } from 'react';

interface ButtonInteractionOptions {
  onPress?: () => void;
  ripple?: boolean;
  particle?: boolean;
  haptic?: boolean;
  magnetic?: boolean;
  shimmer?: boolean;
}

export const useButtonInteractions = (options: ButtonInteractionOptions = {}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!options.ripple) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      transform: scale(0);
      animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 1;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, [options.ripple]);

  const createParticleEffect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!options.particle) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create multiple particles
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      const angle = (i / 6) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;

      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${centerX}px;
        top: ${centerY}px;
        animation: particle-float 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        --end-x: ${endX}px;
        --end-y: ${endY}px;
      `;

      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 800);
    }
  }, [options.particle]);

  const createShimmerEffect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!options.shimmer) return;

    const button = event.currentTarget;
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 0.5s ease-out;
      pointer-events: none;
      z-index: 2;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(shimmer);

    setTimeout(() => {
      shimmer.remove();
    }, 500);
  }, [options.shimmer]);

  const addMagneticEffect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!options.magnetic) return;

    const button = event.currentTarget;
    button.style.transform = 'translateY(-2px)';
    
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  }, [options.magnetic]);

  const handlePress = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Add click animation
    const button = event.currentTarget;
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      button.style.transform = '';
    }, 100);

    // Create effects
    createRipple(event);
    createParticleEffect(event);
    createShimmerEffect(event);
    addMagneticEffect(event);
    
    // Haptic feedback
    if (options.haptic && 'vibrate' in navigator) {
      navigator.vibrate([10, 20, 10]); // Short haptic pattern
    }
    
    options.onPress?.();
  }, [createRipple, createParticleEffect, createShimmerEffect, addMagneticEffect, options]);

  return {
    handlePress,
    buttonRef,
  };
};
