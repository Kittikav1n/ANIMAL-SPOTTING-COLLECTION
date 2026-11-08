import React from 'react';
import { Icon } from '@iconify/react'; 

export default function AnimalIcon({ 
  pinName, 
  className = "w-5 h-5 text-slate-700" 
}: { 
  pinName: string; 
  className?: string; 
}) {
  return <Icon icon={pinName || 'ph:question'} className={className} />;
}