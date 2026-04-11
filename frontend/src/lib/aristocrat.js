// Utilidad para obtener información de aristocracia
export const getAristocratInfo = (aristocratLevel) => {
  const levels = {
    0: { name: 'Sin Rango', icon: '', color: 'gray', bgGradient: 'from-gray-400 to-gray-500' },
    1: { name: 'Aristocrat I', icon: '👑', color: 'bronze', bgGradient: 'from-amber-600 to-amber-700' },
    2: { name: 'Aristocrat II', icon: '👑👑', color: 'silver', bgGradient: 'from-gray-400 to-gray-500' },
    3: { name: 'Aristocrat III', icon: '👑👑👑', color: 'gold', bgGradient: 'from-yellow-400 to-yellow-600' },
    4: { name: 'Aristocrat IV', icon: '💎', color: 'diamond', bgGradient: 'from-blue-400 to-blue-600' },
    5: { name: 'Aristocrat V', icon: '💎💎', color: 'emerald', bgGradient: 'from-emerald-400 to-emerald-600' },
    6: { name: 'Aristocrat VI', icon: '💎💎💎', color: 'ruby', bgGradient: 'from-red-500 to-red-700' },
    7: { name: 'Aristocrat VII', icon: '👑💎', color: 'sapphire', bgGradient: 'from-blue-600 to-purple-600' },
    8: { name: 'Aristocrat VIII', icon: '👑💎👑', color: 'rainbow', bgGradient: 'from-purple-500 via-pink-500 to-red-500' },
    9: { name: 'Aristocrat IX', icon: '👑💎👑💎', color: 'supreme', bgGradient: 'from-yellow-400 via-red-500 to-purple-600' }
  };

  return levels[aristocratLevel] || levels[0];
};

export const getAristocratBadge = (aristocratLevel) => {
  if (aristocratLevel === 0) return null;
  
  const info = getAristocratInfo(aristocratLevel);
  
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${info.bgGradient} text-white text-xs font-bold shadow-lg`}>
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </div>
  );
};

export const getAristocratFrame = (aristocratLevel) => {
  if (aristocratLevel === 0) return 'border-2 border-gray-300';
  if (aristocratLevel <= 3) return 'border-3 border-yellow-400 shadow-lg shadow-yellow-400/50';
  if (aristocratLevel <= 6) return 'border-3 border-blue-500 shadow-lg shadow-blue-500/50';
  return 'border-4 border-purple-500 shadow-xl shadow-purple-500/50 animate-pulse';
};
