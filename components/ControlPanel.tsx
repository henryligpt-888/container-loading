
import React, { useState } from 'react';
import { BoxItem, ContainerStats } from '../types';
import { ContainerSpec, CONTAINER_TYPES, PRESET_COLORS } from '../constants';
import { Plus, Trash2, Play, Box, Package, RotateCcw, LayoutGrid, ShoppingCart, XCircle, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ControlPanelProps {
  boxes: BoxItem[];
  onAddBoxes: (boxes: BoxItem[]) => void;
  onRemoveBox: (id: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  onClearAll: () => void;
  stats: ContainerStats;
  isCalculating: boolean;
  currentContainer: ContainerSpec;
  onContainerChange: (c: ContainerSpec) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  boxes,
  onAddBoxes,
  onRemoveBox,
  onCalculate,
  onReset,
  onClearAll,
  stats,
  isCalculating,
  currentContainer,
  onContainerChange
}) => {
  // Input states
  const [length, setLength] = useState<string>('60');
  const [width, setWidth] = useState<string>('40');
  const [height, setHeight] = useState<string>('40');
  const [weight, setWeight] = useState<string>('10');
  const [quantity, setQuantity] = useState<string>('1');
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[6]); // Default Blue
  const [cantStackTop, setCantStackTop] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);
    const wt = parseFloat(weight);
    const qty = parseInt(quantity);

    if (isNaN(l) || isNaN(w) || isNaN(h) || isNaN(wt) || isNaN(qty) || l <= 0 || w <= 0 || h <= 0 || wt <= 0 || qty <= 0) return;

    const newBoxes: BoxItem[] = [];
    
    for (let i = 0; i < qty; i++) {
      newBoxes.push({
        id: uuidv4(),
        width: l,  
        depth: w,
        height: h,
        weight: wt,
        cantStackTop,
        color: selectedColor,
        placed: false
      });
    }

    onAddBoxes(newBoxes);
    
    // Reset quantity to 1
    setQuantity('1');
  };

  const placedCount = boxes.filter(b => b.placed).length;
  const notFittedCount = boxes.length - placedCount;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-xl z-20 w-full lg:w-[450px] lg:max-w-[450px] flex-shrink-0">

      {/* Header - Fixed on desktop, scrollable on mobile */}
      <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50 lg:flex-shrink-0">
        <h1 className="text-xl lg:text-2xl font-extrabold text-slate-800 flex items-center gap-2 lg:gap-3 tracking-tight">
          <Box className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 fill-blue-100" />
          智能装箱模拟器
        </h1>
        <p className="text-xs lg:text-sm text-slate-500 mt-1 ml-8 lg:ml-11">SmartLoad 3D Visualization</p>
      </div>

      {/* Mobile: Everything scrollable | Desktop: Only middle section scrollable */}
      <div className="flex-1 overflow-y-auto lg:overflow-y-hidden lg:flex lg:flex-col">
        <div className="lg:flex-1 lg:overflow-y-auto custom-scrollbar">
          <div className="p-3 lg:p-6 space-y-4 lg:space-y-8">
          
          {/* Container Selection */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              货柜型号选择
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              {CONTAINER_TYPES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onContainerChange(c)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all flex-shrink-0 ${
                    currentContainer.name === c.name
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  title={c.description}
                >
                  <div className="font-bold">{c.name}</div>
                  <div className={`text-[10px] mt-0.5 ${currentContainer.name === c.name ? 'text-blue-100' : 'text-slate-400'}`}>
                    {c.label.split(' ')[1] || c.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="text-xs text-center text-slate-500 bg-slate-50 py-1.5 rounded border border-slate-100 font-mono">
               内尺寸: {currentContainer.width}×{currentContainer.depth}×{currentContainer.height} cm
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Add Cargo Form */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4" />
              添加新货物
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">

              {/* Colors */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">货物颜色</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 flex-shrink-0 rounded-full shadow-sm transition-transform hover:scale-110 focus:outline-none flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">长 (cm)</label>
                  <input
                    type="number"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono text-slate-700"
                    placeholder="60"
                    value={length}
                    onChange={e => setLength(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">宽 (cm)</label>
                  <input
                    type="number"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono text-slate-700"
                    placeholder="40"
                    value={width}
                    onChange={e => setWidth(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">高 (cm)</label>
                  <input
                    type="number"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono text-slate-700"
                    placeholder="40"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              {/* Weight & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">单件重量 (kg)</label>
                  <input
                    type="number"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono text-slate-700"
                    placeholder="10"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">添加数量 (件)</label>
                    <input
                      type="number"
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono text-slate-700"
                      placeholder="1"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      min="1"
                      max="1000"
                    />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center">
                 <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={cantStackTop}
                      onChange={e => setCantStackTop(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all"></div>
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 select-none">上方禁放 (易碎品)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-bold transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                添加到货物列表
              </button>
            </form>
          </section>

           {/* Cargo List */}
           <section className="space-y-3 pt-4">
            <div className="flex justify-between items-end border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                货物清单 ({boxes.length})
              </h2>
              {boxes.length > 0 && (
                <button onClick={onClearAll} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> 清空列表
                </button>
              )}
            </div>

            <div className="space-y-2 lg:max-h-[400px] lg:overflow-y-auto pr-1 custom-scrollbar">
              {boxes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <p className="text-base font-medium text-slate-500">暂无货物</p>
                  <p className="text-sm mt-1 opacity-60">请在上方添加箱子</p>
                </div>
              ) : (
                boxes.map((box, index) => (
                  <div 
                    key={box.id} 
                    className={`group relative flex items-center p-3 bg-white border rounded-xl shadow-sm transition-all hover:shadow-md ${
                      box.placed ? 'border-l-[6px] border-l-emerald-500' : 
                      (box.placed === false && box.position === undefined && placedCount > 0) ? 'border-l-[6px] border-l-red-400 opacity-70' : 'border-l-[6px] border-l-slate-300'
                    }`}
                  >
                    {/* Color Indicator */}
                    <div className="w-10 h-10 rounded-lg shadow-sm mr-3 flex-shrink-0" style={{ backgroundColor: box.color }}>
                      <div className="w-full h-full flex items-center justify-center text-white/90 font-bold text-xs">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">货物 #{index + 1}</span>
                        {box.cantStackTop && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            易碎
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex flex-wrap gap-x-3 gap-y-1">
                        <span className="bg-slate-50 px-1.5 rounded border border-slate-100">{box.width}×{box.depth}×{box.height} cm</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-600 font-semibold">{box.weight} kg</span>
                      </div>
                    </div>
                    
                    {/* Status & Delete */}
                    <div className="flex items-center gap-2 pl-2">
                       {box.placed && (
                         <div className="flex flex-col items-end">
                           <Check className="w-5 h-5 text-emerald-500" />
                         </div>
                       )}
                       {!box.placed && placedCount > 0 && (
                         <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 whitespace-nowrap">
                           未装入
                         </span>
                       )}

                      <button 
                        onClick={() => onRemoveBox(box.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="移除"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          </div>
        </div>

        {/* Footer Actions - Part of scrollable area on mobile, fixed on desktop */}
        <div className="p-3 lg:p-6 bg-slate-50 border-t border-slate-200 space-y-2 lg:space-y-4 lg:flex-shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onReset}
            disabled={boxes.length === 0}
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 py-2.5 lg:py-3.5 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50 text-xs lg:text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            重置位置
          </button>
          <button
            onClick={onCalculate}
            disabled={boxes.length === 0 || isCalculating}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 lg:py-3.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-200 text-xs lg:text-sm"
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                计算中...
              </span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                开始装箱计算
              </>
            )}
          </button>
        </div>
        
        {stats.boxCount > 0 && (
           <div className="flex justify-between items-center text-xs px-1">
              <span className="text-slate-500">总货物: <b>{stats.boxCount}</b> 件</span>
              {notFittedCount > 0 && (
                <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  {notFittedCount} 件无法装入
                </span>
              )}
           </div>
        )}
        </div>
      </div>
    </div>
  );
};
